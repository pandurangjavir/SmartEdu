import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import axios from 'axios';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#818cf8', '#4f46e5', '#7c3aed', '#4338ca', '#3730a3'];
const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#6366f1', negative: '#ef4444' };

const StatCard = ({ title, value, icon, subtitle, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-violet-600',
    emerald: 'from-emerald-500 to-green-600',
    rose: 'from-rose-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{subtitle}</span>
      </div>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{title}</p>
    </div>
  );
};

const ChatbotAnalytics = () => {
  const [chatData, setChatData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setError('Not authenticated'); setLoading(false); return; }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [chatRes, studentRes] = await Promise.all([
          axios.get('/api/analytics/chatbot', { headers }),
          axios.get('/api/analytics/students', { headers })
        ]);
        setChatData(chatRes.data);
        setStudentData(studentRes.data);
      } catch (e) {
        if (e.response?.status === 403) {
          setError('Admin access required. You must be logged in as an administrator to view analytics.');
        } else {
          setError(`Failed to load analytics: ${e.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-red-800 mb-2">Access Restricted</h2>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Prepare sentiment data with colors
  const sentimentData = (chatData?.sentiment_distribution || []).map(d => ({
    ...d,
    fill: SENTIMENT_COLORS[d.label] || '#6366f1'
  }));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          📊 SmartEdu Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Real-time insights from the chatbot and student performance data.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Chat Messages" value={chatData?.total_messages?.toLocaleString() || '—'} icon="💬" subtitle="All time" color="indigo" />
        <StatCard title="Registered Users" value={chatData?.total_users?.toLocaleString() || '—'} icon="👥" subtitle="Platform" color="emerald" />
        <StatCard title="Unique Intents Used" value={chatData?.intent_frequency?.length || '—'} icon="🧠" subtitle="NLP intents" color="amber" />
        <StatCard title="Student Subjects Tracked" value={studentData?.subject_performance?.length || '—'} icon="📚" subtitle="Academic" color="rose" />
      </div>

      {/* Row 1: Intent Pie + Sentiment Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Frequency Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">🎯 Top Chatbot Intents</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution of what students ask most</p>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chatData?.intent_frequency || []}
                dataKey="count"
                nameKey="intent"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ intent, percent }) => `${intent} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {(chatData?.intent_frequency || []).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">😊 Student Sentiment Analysis</h2>
          <p className="text-xs text-gray-400 mb-4">Emotional tone from chat messages (TextBlob NLP)</p>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
              >
                {sentimentData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Daily Volume Line + Fee Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Message Volume */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">📈 Daily Chatbot Usage</h2>
          <p className="text-xs text-gray-400 mb-4">Messages per day (last 7 days)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chatData?.daily_volume || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Payment Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">💳 Fee Payment Status</h2>
          <p className="text-xs text-gray-400 mb-4">Breakdown of student fee payment statuses</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={studentData?.fee_status || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
              >
                {(studentData?.fee_status || []).map((_, idx) => (
                  <Cell key={idx} fill={['#10b981', '#f59e0b', '#ef4444', '#6366f1'][idx % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Subject Performance Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">🏆 Subject Performance — Average Marks</h2>
        <p className="text-xs text-gray-400 mb-4">Average percentage per subject across all students</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={studentData?.subject_performance || []} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(value) => [`${value}%`, 'Avg Score']} />
            <Bar dataKey="avg_percentage" fill="#6366f1" radius={[6, 6, 0, 0]}>
              {(studentData?.subject_performance || []).map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Class Attendance Bar Chart */}
      {studentData?.class_attendance?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">🏫 Class-wise Average Attendance</h2>
          <p className="text-xs text-gray-400 mb-4">The red line marks the 75% threshold</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={studentData?.class_attendance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="class_name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Avg Attendance']} />
              {/* Reference line at 75% */}
              <Bar dataKey="avg_attendance" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pb-4">
        SmartEdu Analytics — Data from live MySQL database &amp; NLP chatbot logs
      </p>
    </div>
  );
};

export default ChatbotAnalytics;
