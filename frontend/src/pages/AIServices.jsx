import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const AIServices = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    content: '',
    file: null,
    numQuestions: 5,
    subject: ''
  });

  const processFile = (file) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Only PDF, DOCX, DOC, TXT files are supported.');
      return;
    }
    setFormData(prev => ({ ...prev, file }));
    setFileName(file.name);
    if (ext === '.txt') {
      const reader = new FileReader();
      reader.onload = (e) => setFormData(prev => ({ ...prev, content: e.target.result }));
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      let response;

      if (activeTab === 'notes') {
        const fd = new FormData();
        if (formData.file) fd.append('file', formData.file);
        if (formData.content) fd.append('content', formData.content);
        response = await axios.post('/api/ai/notes', fd);
        setResult(response.data.notes || '');

      } else if (activeTab === 'quiz') {
        const fd = new FormData();
        if (formData.file) fd.append('file', formData.file);
        if (formData.content) fd.append('content', formData.content);
        fd.append('num_questions', formData.numQuestions);
        response = await axios.post('/api/ai/quiz', fd);
        setQuizData(response.data.questions || []);

      } else if (activeTab === 'guidance') {
        response = await axios.post('/api/ai/guidance', {
          user_id: user?.user_id,
          subject: formData.subject
        });
        setResult(response.data.guidance || '');
      }

      toast.success('Generated successfully!');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to process request. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({ content: '', file: null, numQuestions: 5, subject: '' });
    setFileName('');
    setResult('');
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_result.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const handleAnswerSelect = (qi, option) => {
    if (!quizSubmitted) setUserAnswers(prev => ({ ...prev, [qi]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(userAnswers).length < quizData.length) {
      toast.error(`Please answer all ${quizData.length} questions first!`);
      return;
    }
    setQuizSubmitted(true);
    const correct = quizData.filter((q, i) => userAnswers[i] === q.correct_answer).length;
    if (correct >= quizData.length * 0.8) toast.success(`🎉 Excellent! ${correct}/${quizData.length} correct!`);
    else if (correct >= quizData.length * 0.5) toast.success(`👍 Good job! ${correct}/${quizData.length} correct.`);
    else toast(`📖 ${correct}/${quizData.length} correct. Keep studying!`);
  };

  const tabs = [
    { id: 'notes', name: 'Notes Generator', icon: DocumentTextIcon, color: 'blue', desc: 'AI-generated study notes from any content' },
    { id: 'quiz', name: 'Quiz Generator', icon: QuestionMarkCircleIcon, color: 'purple', desc: 'Interactive MCQ quiz from your material' },
    { id: 'guidance', name: 'Smart Suggestions', icon: LightBulbIcon, color: 'amber', desc: 'Personalized AI study tips based on your marks' }
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const quizScore = quizSubmitted && quizData
    ? quizData.filter((q, i) => userAnswers[i] === q.correct_answer).length : 0;

  const needsFileInput = activeTab !== 'guidance';
  const canGenerate = activeTab === 'guidance' || formData.content || formData.file;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm mb-4">
            <SparklesIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Powered by Groq AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">AI Learning Services</h1>
          <p className="text-gray-500 text-lg">Generate notes, test yourself, and get smart study suggestions</p>
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); clearForm(); }}
              className={`rounded-2xl p-5 text-left border-2 transition-all duration-300 shadow-sm hover:shadow-xl group overflow-hidden relative ${
                activeTab === tab.id
                  ? `${colorMap[tab.color]} shadow-lg scale-[1.03] ring-2 ring-offset-2 ring-white/20`
                  : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
              }`}
            >
              <div className={`absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                <tab.icon className="h-24 w-24" />
              </div>
              <tab.icon className={`h-8 w-8 mb-3 transition-transform duration-300 group-hover:scale-110 ${activeTab === tab.id ? '' : 'text-gray-400'}`} />
              <p className="font-bold text-sm tracking-tight">{tab.name}</p>
              <p className={`text-xs mt-1 leading-relaxed ${activeTab === tab.id ? 'opacity-90' : 'text-gray-400'}`}>{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* File Upload Area */}
              {needsFileInput && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Document <span className="text-gray-400 font-normal">(PDF, DOCX, TXT)</span>
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('ai-file-input').click()}
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all
                      ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 bg-gray-50'}`}
                  >
                    <ArrowUpTrayIcon className={`h-10 w-10 mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
                    {fileName ? (
                      <div className="text-center">
                        <p className="font-semibold text-blue-700 text-sm">📄 {fileName}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-medium text-gray-600 text-sm">Drag & drop or <span className="text-blue-600 underline">browse</span></p>
                        <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, DOC, TXT</p>
                      </div>
                    )}
                    <input
                      id="ai-file-input"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Divider */}
              {needsFileInput && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              )}

              {/* Paste Content */}
              {needsFileInput && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Content Directly</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none bg-gray-50 placeholder-gray-400"
                    rows="5"
                    placeholder="Paste your lecture notes, textbook chapters, or any study material here..."
                  />
                </div>
              )}

              {/* Quiz: Number of Questions */}
              {activeTab === 'quiz' && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Number of Questions:</label>
                  <input
                    type="number" min="1" max="20"
                    value={formData.numQuestions}
                    onChange={(e) => setFormData({ ...formData, numQuestions: parseInt(e.target.value) || 5 })}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-xs text-gray-400">(1–20)</span>
                </div>
              )}

              {/* Guidance: Subject input */}
              {activeTab === 'guidance' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject to Improve <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Data Structures, Java, DBMS, Operating Systems..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 placeholder-gray-400"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    💡 Leave blank — the AI will automatically detect your weakest subject from your exam marks.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !canGenerate}
                  className="flex-1 relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      {activeTab === 'notes' ? 'Generate Notes' : activeTab === 'quiz' ? 'Generate Quiz' : 'Get My Study Plan'}
                    </>
                  )}
                </button>
                <button
                  type="button" onClick={clearForm}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* ======= RESULT SECTIONS ======= */}

          {/* Notes / Guidance Result */}
          {result && (activeTab === 'notes' || activeTab === 'guidance') && (
            <div className="border-t border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {activeTab === 'guidance' ? '✨ Your Personalized Study Plan' : '📝 Generated Notes'}
                </h3>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                    <ClipboardDocumentIcon className="h-4 w-4" /> Copy
                  </button>
                  <button onClick={downloadResult} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                    <ArrowDownTrayIcon className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 max-h-[600px] overflow-y-auto prose prose-sm max-w-none text-gray-800">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Quiz Result */}
          {quizData && activeTab === 'quiz' && (
            <div className="border-t border-gray-100 p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">📋 Quiz — {quizData.length} Questions</h3>
                {quizSubmitted && (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${quizScore >= quizData.length * 0.6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Score: {quizScore}/{quizData.length}
                  </span>
                )}
              </div>

              {quizData.map((q, qi) => {
                const uAns = userAnswers[qi];
                const isCorrect = uAns === q.correct_answer;
                return (
                  <div 
                    key={qi} 
                    className={`rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-[1.01] ${
                      quizSubmitted 
                        ? (isCorrect ? 'border-green-300 bg-green-50/50 shadow-sm' : 'border-red-200 bg-red-50/50 shadow-sm') 
                        : 'border-gray-100 bg-white shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md">
                        {qi + 1}
                      </span>
                      <p className="font-bold text-gray-800 text-base leading-relaxed pt-0.5">
                        {q.question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                      {q.options.map((opt, oi) => {
                        let cls = 'border-gray-100 bg-gray-50/50 text-gray-700 hover:border-blue-400 hover:bg-white hover:shadow-sm';
                        let icon = null;

                        if (quizSubmitted) {
                          if (opt === q.correct_answer) {
                            cls = 'border-green-500 bg-green-100 text-green-800 font-bold ring-2 ring-green-200';
                            icon = <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0" />;
                          } else if (opt === uAns) {
                            cls = 'border-red-500 bg-red-100 text-red-700 font-medium ring-2 ring-red-100';
                            icon = <XCircleIcon className="h-5 w-5 text-red-500 shrink-0" />;
                          } else {
                            cls = 'border-gray-100 bg-gray-50 text-gray-300 opacity-60';
                          }
                        } else if (opt === uAns) {
                          cls = 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-200 shadow-sm scale-[1.02]';
                          icon = <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />;
                        }

                        return (
                          <button
                            key={oi}
                            type="button"
                            onClick={() => handleAnswerSelect(qi, opt)}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 text-sm group ${cls}`}
                          >
                            <span className="flex-1">{opt}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!quizSubmitted ? (
                <div className="pt-6">
                  <button
                    onClick={submitQuiz}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    Submit My Answers ({Object.keys(userAnswers).length}/{quizData.length})
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3 italic">
                    Double check your choices before submitting!
                  </p>
                </div>
              ) : (
                <div className="mt-8 relative overflow-hidden bg-white rounded-3xl border-2 border-indigo-100 shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
                  
                  <div className="mb-4 inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-4xl shadow-inner">
                    {quizScore >= quizData.length * 0.8 ? '🏆' : quizScore >= quizData.length * 0.5 ? '⭐' : '📚'}
                  </div>

                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {quizScore >= quizData.length * 0.8 ? 'Spectacular!' : quizScore >= quizData.length * 0.5 ? 'Great Effort!' : 'Room to Grow!'}
                  </h2>

                  <div className="flex justify-center items-baseline gap-2 mb-6">
                    <span className="text-5xl font-black text-blue-600">{quizScore}</span>
                    <span className="text-xl text-gray-400 font-bold">/ {quizData.length}</span>
                  </div>

                  <div className="max-w-md mx-auto mb-8">
                    <div className="w-full bg-gray-100 rounded-full h-4 mb-2 shadow-inner overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          quizScore >= quizData.length * 0.8 ? 'bg-green-500' : quizScore >= quizData.length * 0.5 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${(quizScore / quizData.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      You achieved a score of <span className="text-blue-600 font-bold">{Math.round((quizScore / quizData.length) * 100)}%</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={clearForm} 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={() => { setActiveTab('notes'); clearForm(); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95"
                    >
                      Generate Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIServices;