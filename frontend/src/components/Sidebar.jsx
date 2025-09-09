import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['student', 'teacher', 'admin', 'hod']
    },
    {
      name: 'Teacher Dashboard',
      href: '/teacher',
      icon: UserGroupIcon,
      roles: ['teacher']
    },
    {
      name: 'HOD Dashboard',
      href: '/hod',
      icon: BriefcaseIcon,
      roles: ['hod']
    },
    {
      name: 'AI Chatbot',
      href: '/chatbot',
      icon: ChatBubbleLeftRightIcon,
      roles: ['student', 'teacher', 'admin', 'hod']
    },
    {
      name: 'AI Services',
      href: '/ai-services',
      icon: SparklesIcon,
      roles: ['student', 'teacher', 'admin', 'hod']
    },
    {
      name: 'Student Services',
      href: '/student-services',
      icon: AcademicCapIcon,
      roles: ['student', 'teacher', 'admin', 'hod']
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
      roles: ['student', 'teacher', 'admin', 'hod']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 