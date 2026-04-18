import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AcademicCapIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">SmartEdu AL</span>
                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">SKN Sinhgad College</span>
              </div>
            </div>
            <div>
              <Link 
                to="/login" 
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Access Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Intelligent Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Assistant System</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            A comprehensive, AI-driven educational platform streamlining administrative workflows, attendance tracking, and student communication for SKN Sinhgad College of Engineering.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[800px] w-full pointer-events-none overflow-hidden -z-10 bg-slate-50">
           <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
           <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')]"></div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-20 bg-white relative z-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Capabilities</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Integrated tools designed for academic efficiency and real-time insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Contextual Chatbot</h3>
              <p className="text-gray-600 leading-relaxed">NLP-powered assistant capable of handling dynamic student queries regarding syllabus, fees, and department policies.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <PresentationChartLineIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Academic Dashboards</h3>
              <p className="text-gray-600 leading-relaxed">Centralized interfaces for administrators to monitor class-wise marks, attendance records, and faculty updates instantly.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event & Notification Hub</h3>
              <p className="text-gray-600 leading-relaxed">Streamlined campus communication system for broadcasting college events, academic deadlines, and direct administrative alerts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-white mb-4">
             <AcademicCapIcon className="h-6 w-6" />
             <span className="font-bold text-xl tracking-tight">SmartEdu AI</span>
          </div>
          <p className="text-gray-400 text-sm">Official Academic Virtual Assistant Project</p>
          <p className="text-gray-500 text-xs mt-6">© {new Date().getFullYear()} SKN Sinhgad College of Engineering. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
