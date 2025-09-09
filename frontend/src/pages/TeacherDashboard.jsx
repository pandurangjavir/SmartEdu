import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CalendarIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    totalMaterials: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load teacher-specific data
      // This will be updated when backend endpoints are implemented
      setStats({
        totalStudents: 45, // Placeholder - will come from API
        totalAssignments: 12, // Placeholder - will come from API
        totalMaterials: 8, // Placeholder - will come from API
        recentActivity: [
          {
            type: 'assignment',
            content: 'Graded Assignment #5 for Mathematics 101',
            timestamp: new Date().toISOString(),
            icon: ClipboardDocumentListIcon
          },
          {
            type: 'material',
            content: 'Uploaded new study notes for Physics',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            icon: DocumentPlusIcon
          },
          {
            type: 'attendance',
            content: 'Marked attendance for Class 10A',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            icon: UserGroupIcon
          }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Attendance',
      description: 'Mark and review student attendance',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/teacher/attendance'
    },
    {
      title: 'Upload Materials',
      description: 'Share study materials and notes',
      icon: DocumentPlusIcon,
      color: 'bg-green-500',
      link: '/teacher/materials'
    },
    {
      title: 'Create Assignments',
      description: 'Set up new assignments and tests',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      link: '/teacher/assignments'
    },
    {
      title: 'Student Performance',
      description: 'Monitor academic progress',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/teacher/performance'
    }
  ];

  const features = [
    {
      title: 'Student Management',
      description: 'Comprehensive student oversight tools',
      features: ['Attendance Tracking', 'Performance Monitoring', 'Assignment Management', 'Progress Reports']
    },
    {
      title: 'Content Management',
      description: 'Share and organize educational materials',
      features: ['Study Notes', 'Lecture Materials', 'Assignment Files', 'Resource Library']
    },
    {
      title: 'Assessment Tools',
      description: 'Create and manage evaluations',
      features: ['Quiz Creation', 'Assignment Setup', 'Grade Management', 'Performance Analytics']
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.first_name || user?.username}!</h1>
            <p className="text-primary-100 mt-2">
              Ready to empower your students with effective teaching tools and AI-powered insights?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Materials</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMaterials}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Access your most used teaching features</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Teaching Platform Features</h2>
          <p className="text-gray-600 mt-1">Explore what SmartEdu AI can do for your teaching</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    {index === 0 && <UserGroupIcon className="h-5 w-5 text-primary-600" />}
                    {index === 1 && <DocumentTextIcon className="h-5 w-5 text-primary-600" />}
                    {index === 2 && <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />}
                  </div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Teaching Activity</h2>
          <p className="text-gray-600 mt-1">Your latest interactions and updates</p>
        </div>
        <div className="p-6">
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent teaching activity</p>
              <p className="text-sm text-gray-400">Start by managing attendance or uploading materials!</p>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Tips & Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">📊 Track Attendance:</span> Monitor student attendance patterns and identify those who need additional support.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">📝 Share Materials:</span> Upload comprehensive study materials to help students prepare for classes and exams.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">🎯 Create Assignments:</span> Design engaging assignments and quizzes to assess student understanding.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">📈 Monitor Progress:</span> Use analytics to track student performance and provide targeted feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 