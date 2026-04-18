import sys
import re

file_path = "c:\\smartEdu\\frontend\\src\\pages\\Chatbot.jsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the sendMessage function to attach customData
old_ai_message = """      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        intent: response.data.intent,
        confidence: response.data.confidence,
        sentiment: response.data.sentiment
      };"""

new_ai_message = """      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        intent: response.data.intent,
        confidence: response.data.confidence,
        sentiment: response.data.sentiment,
        customData: response.data.data
      };"""

content = content.replace(old_ai_message, new_ai_message)

# 2. Insert Custom React Cards in the render block
# Specifically, find the Sentiment Badge section and insert the custom cards right above it.
old_render_target = """                </div>

                {/* Intent / Sentiment Badge */}"""

new_render_target = """                </div>

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

                {/* Intent / Sentiment Badge */}"""

if old_render_target in content:
    content = content.replace(old_render_target, new_render_target)
else:
    print("WARNING: Render target not found in Chatbot.jsx")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactor Frontend complete.")
