import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const QUICK_QUESTIONS = [
  { label: '💳 Fee Structure', text: 'What are the fees for B.Tech 2025-26?' },
  { label: '🎓 Branches', text: 'What courses are available at SKNSCOE?' },
  { label: '📋 Eligibility', text: 'What are the eligibility criteria for admission?' },
  { label: '📄 Documents', text: 'What documents are required for admission?' },
  { label: '🏆 Placements', text: 'What are the placement statistics?' },
  { label: '🎁 Scholarships', text: 'What scholarships are available?' },
  { label: '🏠 Hostel', text: 'Tell me about hostel facilities and fees' },
  { label: '📞 Contact', text: 'How to contact the admission office?' },
];

const LoginChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: "👋 Hello! I'm **SmartEdu Assistant** for SKN Sinhgad College.\n\nI can help you with admission info, fees, courses, placements and more!\n\n*Click a quick question below or type your own.*",
      sender: 'bot'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setHasNotif(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || inputMessage.trim();
    if (!msg || isLoading) return;

    const userMessage = { id: Date.now(), text: msg, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chatbot/public', { message: msg });
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response || 'Sorry, I could not process your request.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: '🔌 I\'m temporarily offline. Please contact the admission office at **+91 8275206048** or email **principal@sknscoe.ac.in**',
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like rendering (bold + newlines)
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={j}>{part.slice(1, -1)}</em>;
            }
            return <span key={j}>{part}</span>;
          })}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Ask about Admission"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {hasNotif && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-bounce">!</span>
          )}
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-ping opacity-30" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          className="bg-gray-900 border border-white/10 rounded-2xl w-[370px] h-[530px] flex flex-col overflow-hidden animate-fade-in-up">

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            className="p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-lg">🎓</div>
              <div>
                <h3 className="font-bold text-white text-sm">SmartEdu Assistant</h3>
                <p className="text-indigo-200 text-xs">SKN Sinhgad College — Admission Helpdesk</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs shrink-0 mr-2 mt-0.5">🎓</div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-gray-800 text-gray-100 border border-white/5 rounded-tl-sm'
                  }`}
                >
                  {renderText(message.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs shrink-0 mr-2 mt-0.5">🎓</div>
                <div className="bg-gray-800 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex space-x-1.5">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 shrink-0">
              <p className="text-gray-500 text-xs mb-2 px-1">Quick Questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="text-xs px-2.5 py-1.5 bg-gray-800 hover:bg-indigo-800 text-gray-300 hover:text-white border border-white/10 hover:border-indigo-500 rounded-xl transition-all"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about admission, fees, courses..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-white/10 text-white text-sm placeholder-gray-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-gray-600 text-[10px] mt-2">
              🏫 SKNSCOE Admission Helpdesk • Korti, Pandharpur
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginChatbot;
