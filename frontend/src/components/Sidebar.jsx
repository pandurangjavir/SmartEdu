import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowLeftOnRectangleIcon,
  MicrophoneIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  SpeakerWaveIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Student Dashboard',
      href: '/student',
      icon: AcademicCapIcon,
      roles: ['student']
    },
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: BriefcaseIcon,
      roles: ['admin']
    },
    {
      name: 'AI Chat Assistant',
      href: '/chatbot',
      icon: ChatBubbleLeftRightIcon,
      roles: ['student', 'admin']
    },
    {
      name: 'Event Registration',
      href: '/event-registration',
      icon: CalendarDaysIcon,
      roles: ['student', 'admin']
    },
    {
      name: 'My Fines',
      href: '/student/fines',
      icon: DocumentTextIcon,
      roles: ['student']
    },
    {
      name: 'Admission Info',
      href: '/admission-info',
      icon: InformationCircleIcon,
      roles: ['student', 'admin']
    },
    {
      name: 'Student Services',
      href: '/student-services',
      icon: AcademicCapIcon,
      roles: ['student', 'admin']
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: UserGroupIcon,
      roles: ['admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      roles: ['student', 'admin']
    }
  ];

  let filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  // Admin-specific sidebar
  if (user?.role === 'admin') {
    filteredMenuItems = [
      { name: 'Admin Dashboard', href: '/admin', icon: BriefcaseIcon },
      { name: 'Manage Members', href: '/admin/members', icon: UserGroupIcon },
      { name: 'Student Services', href: '/student-services', icon: AcademicCapIcon },
      { name: 'Manage Fines', href: '/hod/fines', icon: DocumentTextIcon },
      { name: 'AI Chat Assistant', href: '/chatbot', icon: ChatBubbleLeftRightIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon }
    ];
  }

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col shadow-2xl transition-all duration-300 relative z-40">
      <div className="p-5 flex-1 overflow-y-auto mt-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Navigation
        </h3>
        <nav className="space-y-1.5">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-slate-300 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all duration-300 group"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 