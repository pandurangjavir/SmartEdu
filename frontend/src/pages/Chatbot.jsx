import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  TrashIcon,
  SpeakerWaveIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const isVoiceModeRef = useRef(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ---------- Scroll ----------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // ---------- Proactive Alerts (on load) ----------
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/chatbot/alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.alerts && res.data.alerts.length > 0) {
          setAlerts(res.data.alerts);
        }
      } catch (e) {
        // Silently ignore — alerts are nice-to-have
      }
    };
    fetchAlerts();
  }, []);

  // ---------- Real-time Notification Polling (every 30s) ----------
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/notifications/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.unread_count > 0) {
          // Store in localStorage so the notification bell elsewhere can read it
          localStorage.setItem('unread_count', res.data.unread_count);
        }
      } catch (e) { /* silent */ }
    };
    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Web Speech API (Voice Input) ----------
  const startListening = useCallback((autoSend = false) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      toast.success(`🎤 Heard: "${transcript}"`);
      if (autoSend || isVoiceModeRef.current) {
        // Delay slightly to let the user see what was heard
        setTimeout(() => sendMessage(transcript), 500);
      }
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast.error('Voice recognition failed. Please try again.');
      }
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    if (!autoSend) toast.success('🎤 Listening... Speak now!');
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // ---------- Text-to-Speech ----------
  const speakMessage = (text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, '')); // strip markdown
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (isVoiceModeRef.current) {
        // Automatically start listening for the next turn
        setTimeout(() => startListening(true), 500);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  // ---------- Send Message ----------
  const sendMessage = async (overrideMessage = null) => {
    const messageContent = overrideMessage || inputMessage;
    if (!messageContent.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = messageContent;
    if (!overrideMessage) setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/chatbot', {
        message: messageToSend,
        user_id: user?.user_id || 1
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

      const aiText = response.data.response;
      const aiMessage = {
        id: Date.now() + 1,
        content: aiText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        intent: response.data.intent,
        confidence: response.data.confidence,
        sentiment: response.data.sentiment,
        customData: response.data.data
      };
      const updates = [aiMessage];

      if (response.data.table) {
        updates.push({
          id: Date.now() + 2,
          sender: 'ai',
          type: 'table',
          table: response.data.table,
          timestamp: new Date().toISOString()
        });
      }
      if (Array.isArray(response.data.tables)) {
        response.data.tables.forEach((tbl, idx) => {
          updates.push({
            id: Date.now() + 3 + idx,
            sender: 'ai',
            type: 'table',
            table: tbl,
            timestamp: new Date().toISOString()
          });
        });
      }
      setMessages(prev => [...prev, ...updates]);

      // If in Voice Mode, automatically speak the AI's response
      if (isVoiceModeRef.current) {
        speakMessage(aiText);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceMode = () => {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);
    isVoiceModeRef.current = nextMode;
    
    if (nextMode) {
      toast.success('🎙️ Voice Conversation Mode Active');
      // Greet the user to start the conversation
      const greeting = "Voice mode activated. I'm listening. How can I help you today?";
      speakMessage(greeting);
    } else {
      window.speechSynthesis.cancel();
      stopListening();
      toast('⌨️ Switched to Typing Mode');
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    toast.success('Chat history cleared!');
  };

  const dismissAlert = (idx) => {
    setAlerts(prev => prev.filter((_, i) => i !== idx));
  };

  const alertColors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };

  // ---------- Render ----------
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50/80 border-b border-gray-100 p-5 px-6 shrink-0">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight flex items-center gap-2">
              <span>SmartEdu</span>
              <span className="text-gray-400 font-medium">|</span>
              <span className="text-indigo-600">AI Assistant</span>
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Your intelligent academic companion
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoiceMode}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border ${
                isVoiceMode 
                  ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse' 
                  : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'
              }`}
            >
              <MicrophoneIcon className="h-4 w-4" />
              <span>{isVoiceMode ? 'Voice Mode: ON' : 'Switch to Voice Mode'}</span>
            </button>
            <button
              onClick={clearChatHistory}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all shadow-sm"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proactive Alert Strip */}
      {alerts.length > 0 && (
        <div className="px-4 py-2 space-y-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start justify-between px-4 py-2 rounded-xl border text-sm ${alertColors[alert.type] || alertColors.info}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">{alert.icon}</span>
                <div>
                  <span className="font-bold">{alert.title}:</span>{' '}
                  <span>{alert.message}</span>
                </div>
              </div>
              <button onClick={() => dismissAlert(idx)} className="ml-3 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 animate-fade-in-up">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                <PaperAirplaneIcon className="h-8 w-8 text-white -mt-0.5 ml-1" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">Welcome to SmartEdu AI Assistant!</p>
            <p className="text-gray-600 max-w-md mx-auto">Ask me anything about your fees, attendance, marks, events, or the college. You can also use your 🎤 microphone!</p>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
              {[
                ['💰', 'Fees', '"Show my fees"'],
                ['📈', 'Attendance', '"Show my attendance"'],
                ['📊', 'Marks', '"Show my marks"'],
                ['📅', 'Events', '"Show events"'],
                ['🏫', 'College Info', '"About SKNSCOE"'],
                ['🎓', 'Placement', '"Placement packages"'],
              ].map(([icon, title, example]) => (
                <button
                  key={title}
                  onClick={() => setInputMessage(example.replace(/"/g, ''))}
                  className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                >
                  <p className="font-semibold text-gray-900 mb-0.5">{icon} {title}</p>
                  <p className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">{example}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'table' ? (
              <div className="bg-white text-gray-900 shadow-md border border-gray-200 rounded-xl overflow-hidden max-w-[90%] md:max-w-2xl mt-2 mb-2">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {message.table?.title || 'Data Table'}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        {message.table?.columns?.map((col) => (
                          <th key={col.key} scope="col" className="px-4 py-3 font-semibold tracking-wider">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {message.table?.rows?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                          {message.table.columns.map((col) => (
                            <td key={col.key} className="px-4 py-3 whitespace-nowrap text-gray-700">
                              {row[col.key] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-right">
                  <p className="text-xs text-gray-400 font-medium">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ) : (
              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow-md border border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                      if (part.match(/https?:\/\/[^\s]+/)) {
                        return (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                            className={`font-semibold underline ${message.sender === 'user' ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}>
                            {part}
                          </a>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => speakMessage(message.content)}
                      disabled={isPlaying}
                      className="ml-2 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 transition-all"
                      title="Read aloud"
                    >
                      <SpeakerWaveIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Custom Data Cards */}
                {message.sender === 'ai' && message.customData && (
                  <div className="mt-4 w-full">
                    {/* Fee Card */}
                    {message.intent === 'fee_query' && message.customData.total_amount !== undefined && (
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-2xl p-5 shadow-sm mt-3 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 border-b border-blue-100/50 pb-3">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2 tracking-tight"><span className="text-xl">💳</span> Fee Summary</h4>
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${message.customData.due_amount <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {message.customData.due_amount <= 0 ? 'Fully Paid' : (message.customData.payment_status || 'Pending')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-xl border border-white shadow-sm">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Fee</p>
                            <p className="text-lg font-black text-slate-800">₹{parseFloat(message.customData.total_amount).toLocaleString()}</p>
                          </div>
                          <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-xl border border-white shadow-sm">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Paid Amount</p>
                            <p className="text-lg font-black text-emerald-600">₹{parseFloat(message.customData.paid_amount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-red-100/50 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                          <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Due Amount</p>
                              <p className="text-[#09090b] text-xs font-medium opacity-50">Remaining balance</p>
                          </div>
                          <p className="text-2xl font-black text-red-600 tracking-tight">₹{parseFloat(message.customData.due_amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Marks Card Grid */}
                    {message.intent === 'marks_query' && message.customData.marks && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {message.customData.marks.map((mark, i) => {
                          const obtained = parseFloat(mark.obtained_marks);
                          const total = parseFloat(mark.total_marks) || 100;
                          const percentage = total > 0 ? (obtained / total) * 100 : 0;
                          const isPass = percentage >= 35;
                          return (
                            <div key={i} className="animate-fade-in-up bg-white border text-slate-800 border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" style={{animationDelay: `${i * 50}ms`}}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm tracking-tight text-slate-700 w-[70%] truncate" title={mark.subject_name}>{mark.subject_name}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isPass ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                  {isPass ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black tracking-tighter text-slate-900">{obtained}</span>
                                <span className="text-xs text-slate-400 font-semibold">/ {total}</span>
                              </div>
                              <div className="flex justify-between items-center mt-3 mb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                                <span className={`text-[10px] font-black ${isPass ? 'text-emerald-600' : 'text-red-500'}`}>{percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${isPass ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} style={{ width: `${Math.min(100, percentage)}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Attendance Card Grid */}
                    {message.intent === 'attendance_query' && message.customData.attendance && (
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        {message.customData.attendance.map((att, i) => {
                          const percentage = att.total_classes > 0 ? (att.present_count / att.total_classes) * 100 : 0;
                          const isGood = percentage >= 75;
                          const isWarning = percentage >= 60 && percentage < 75;
                          const barColor = isGood ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : isWarning ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-rose-500';
                          return (
                            <div key={i} className="animate-fade-in-up bg-white border text-slate-800 border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:border-slate-300" style={{animationDelay: `${i * 50}ms`}}>
                              <div className="flex justify-between items-center mb-1.5">
                                <h4 className="font-bold text-sm tracking-tight text-slate-700 truncate mr-3">{att.subject_name}</h4>
                                <span className="font-black text-sm text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{percentage.toFixed(1)}%</span>
                              </div>
                              <div className="flex text-[11px] text-slate-500 font-semibold mb-3 gap-4 mt-1">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span><span className="text-slate-700">{att.present_count}</span> Present</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span><span className="text-slate-700">{att.absent_count}</span> Absent</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Fines List */}
                    {message.intent === 'fine_query' && message.customData.fines && (
                      <div className="space-y-3 mt-3">
                        {message.customData.fines.map((fine, i) => (
                          <div key={i} className="animate-fade-in-up flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all" style={{animationDelay: `${i * 50}ms`}}>
                            <div className="flex items-center gap-3.5">
                              <div className={`p-2 rounded-xl ${fine.status === 'Approved' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                <span className="text-xl inline-block">{fine.status === 'Approved' ? '✅' : '⚠️'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{fine.reason || 'Penalty'}</p>
                                <p className="text-[11px] text-slate-400 font-semibold tracking-wide mt-0.5">{fine.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-rose-600 tracking-tight">₹{parseFloat(fine.amount).toLocaleString()}</p>
                              <p className={`text-[9px] font-black tracking-widest uppercase mt-0.5 ${fine.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {fine.status === 'Approved' ? 'Cleared' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}



                <p className={`text-xs mt-2 opacity-60 ${message.sender === 'user' ? 'text-white' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-lg border border-gray-200 px-6 py-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-1">SmartEdu AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-gray-50/80 border-t border-gray-100 p-5 shrink-0">
        {isListening && (
          <div className="mb-3 flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-red-700">Listening... speak now, then click 🛑 to stop</span>
          </div>
        )}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fees, attendance, marks, college info..."
              className="w-full px-5 py-3.5 text-sm bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all shadow-sm"
              rows="1"
            />
          </div>
          <div className="flex space-x-2">
            {/* Voice Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? 'Stop listening' : 'Voice input (Web Speech)'}
              className={`h-[52px] w-[52px] flex items-center justify-center rounded-2xl focus:ring-2 transition-all shadow-md hover:shadow-lg ${
                isListening
                  ? 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 animate-pulse'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 focus:ring-indigo-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
            </button>
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="h-[52px] w-[52px] flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl hover:from-indigo-700 hover:to-violet-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <PaperAirplaneIcon className="h-5 w-5 -mt-0.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;