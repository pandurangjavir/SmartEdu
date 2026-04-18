import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BellIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notifications: 0,
    upcomingEvents: 0,
    marks_percentage: 0,
    attendance_percentage: 0,
    fees_percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch announcements for notifications
        try {
          const announcementsRes = await axios.get('/api/announcements');
          const announcements = announcementsRes.data || [];
          setStats((s) => ({ ...s, notifications: announcements.length }));
        } catch {}

        // Fetch upcoming events
        try {
          const eventsRes = await axios.get('/api/events');
          const events = eventsRes.data?.data || eventsRes.data || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = events.filter(event => {
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          });
          setStats((s) => ({ ...s, upcomingEvents: upcoming.length }));
        } catch {}

        // Fetch personal dashboard stats
        try {
          const statsRes = await axios.get('/api/students/me/dashboard-stats');
          if (statsRes.data) {
            setStats((s) => ({
              ...s,
              marks_percentage: statsRes.data.marks_percentage || 0,
              attendance_percentage: statsRes.data.attendance_percentage || 0,
              fees_percentage: statsRes.data.fees_percentage || 0,
            }));
          }
        } catch (err) {
            console.error("Failed fetching personal stats", err);
        }

      } finally {
        setLoading(false);
      }
    };
    if (user) {
      load();
    }
  }, [user]);

  const quickActions = [
    {
      title: 'AI Chatbot',
      description: 'Ask questions and get help',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      link: '/chatbot'
    },
    {
      title: 'AI Services',
      description: 'Generate notes and quizzes',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/ai-services'
    },
    {
      title: 'Student Services',
      description: 'Courses, attendance, grades',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      link: '/student-services'
    },
    {
      title: 'Event Registration',
      description: 'Join campus activities',
      icon: CalendarDaysIcon,
      color: 'bg-orange-500',
      link: '/event-registration'
    },
    {
      title: 'My Fines',
      description: 'View and pay your fines',
      icon: DocumentTextIcon,
      color: 'bg-red-500',
      link: '/student/fines'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl border border-white/10 mb-8">
        {/* Abstract shapes & lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[25%] w-[80%] h-[120%] bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-[80px] rounded-full mix-blend-screen"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[60px] mix-blend-screen"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] mix-blend-screen"></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] opacity-10"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-between bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
              Welcome, {user?.first_name || user?.name || user?.username}!
            </h1>
            <p className="text-indigo-200/80 font-medium text-sm md:text-base leading-relaxed">Your personalized student dashboard</p>
          </div>
          <div className="hidden md:flex items-center space-x-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 shadow-inner">
            <div className="text-right">
              <p className="text-sm font-bold text-white tracking-wide">Student</p>
              <p className="text-[10px] text-indigo-300/80 uppercase font-extrabold tracking-widest mt-0.5">Portal</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30">
              <AcademicCapIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center hover:shadow-md transition-all group">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4 group-hover:scale-105 transition-transform shadow-sm">
              <BellIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Notifications</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.notifications}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center hover:shadow-md transition-all group">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 mr-4 group-hover:scale-105 transition-transform shadow-sm">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Upcoming Events</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-gray-100/60 overflow-hidden mt-6 hover:shadow-lg transition-shadow duration-300">
        <div className="p-5 border-b border-gray-100 bg-slate-50/80 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-gray-900">My Progress Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Track your personalized academic performance</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
            {/* Marks Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle 
                    cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-indigo-500 transition-all duration-1000 ease-in-out drop-shadow-sm"
                    strokeDasharray={`${stats.marks_percentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{stats.marks_percentage}%</span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Marks</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Overall Score</p>
            </div>

            {/* Attendance Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle 
                    cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-emerald-500 transition-all duration-1000 ease-in-out drop-shadow-sm"
                    strokeDasharray={`${stats.attendance_percentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{stats.attendance_percentage}%</span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Attendance</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Present Days</p>
            </div>

            {/* Fees Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle 
                    cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-purple-500 transition-all duration-1000 ease-in-out drop-shadow-sm"
                    strokeDasharray={`${stats.fees_percentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{stats.fees_percentage}%</span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Fees Paid</h3>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Clearance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="relative group bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col items-start justify-between min-h-[150px]"
            >
              {/* Decorative background glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${action.color} -mr-6 -mt-6 group-hover:scale-[2] transition-transform duration-700 ease-out`}></div>
              
              <div className={`p-3 rounded-xl text-white shadow-sm ${action.color} group-hover:scale-110 transition-transform duration-300 z-10`}>
                <action.icon className="h-6 w-6" />
              </div>
              
              <div className="mt-4 z-10">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{action.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Extended Features List */}
      <div className="mt-8 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Subtle top border gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Modules</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Explore specialized academic and communication tools</p>
            </div>
            <Link to="/student-services" className="mt-4 md:mt-0 px-5 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-600 hover:text-white transition-colors duration-300 self-start md:self-auto shadow-sm">
              View All Services →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {/* Academic Core */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-r-lg"></div>
              <h4 className="text-base font-bold text-slate-800 mb-5 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Academic Core
              </h4>
              <div className="space-y-3">
                <Link to="/student-services" className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="p-2.5 bg-blue-100/50 text-blue-600 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Marks & Results</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">View detailed semester-wise performance analytics.</p>
                  </div>
                </Link>
                <div className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                  <div className="p-2.5 bg-emerald-100/50 text-emerald-600 rounded-lg mr-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                    <ChartBarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Attendance Registry</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Daily tracking of subject-wise class attendance.</p>
                  </div>
                </div>
                <div className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                  <div className="p-2.5 bg-purple-100/50 text-purple-600 rounded-lg mr-3 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                    <DocumentTextIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Financial / Fees</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Monitor fee installments and download receipts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campus & AI */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-orange-500 rounded-r-lg"></div>
              <h4 className="text-base font-bold text-slate-800 mb-5 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-rose-600" />
                Campus & AI
              </h4>
              <div className="space-y-3">
                <Link to="/messages" className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="p-2.5 bg-rose-100/50 text-rose-600 rounded-lg mr-3 group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                    <BellIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-rose-700 transition-colors">Important Alerts</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Critical notices and department announcements.</p>
                  </div>
                </Link>
                <Link to="/event-registration" className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="p-2.5 bg-amber-100/50 text-amber-600 rounded-lg mr-3 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Events Portal</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Browse and register for upcoming college activities.</p>
                  </div>
                </Link>
                <Link to="/chatbot" className="group flex items-start p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="p-2.5 bg-indigo-100/50 text-indigo-600 rounded-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Smart AI Assistant</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">24/7 intelligent help for syllabus and queries.</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


