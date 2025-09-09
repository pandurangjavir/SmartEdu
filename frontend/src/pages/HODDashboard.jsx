import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const HODDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    pendingReports: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Placeholder values; replace with API results when endpoints are ready
      setStats({
        totalTeachers: 12,
        totalStudents: 480,
        pendingReports: 3,
        recentActivity: [
          {
            type: 'report',
            content: 'Pending approval: Weekly report from Ms. Sharma',
            timestamp: new Date().toISOString(),
            icon: ClipboardDocumentCheckIcon
          },
          {
            type: 'notice',
            content: 'Published department notice: Lab schedule update',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            icon: MegaphoneIcon
          },
          {
            type: 'analytics',
            content: 'Reviewed attendance analytics for Semester 1',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            icon: ChartBarIcon
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
      title: 'Manage Teachers & Students',
      description: 'Add, edit, or organize department members',
      icon: UsersIcon,
      color: 'bg-purple-500',
      link: '/hod/members'
    },
    {
      title: 'Review Teacher Reports',
      description: 'Approve or request changes',
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-blue-500',
      link: '/hod/reports'
    },
    {
      title: 'Department Analytics',
      description: 'Attendance, results, chatbot usage',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      link: '/hod/analytics'
    },
    {
      title: 'Tasks & Notices',
      description: 'Assign tasks, publish notices & approvals',
      icon: MegaphoneIcon,
      color: 'bg-orange-500',
      link: '/hod/tasks'
    }
  ];

  const features = [
    {
      title: 'Department Management',
      description: 'Centralized control over teachers and students',
      features: ['Member Directory', 'Section/Class Mapping', 'Bulk Imports', 'Role Adjustments']
    },
    {
      title: 'Quality & Reporting',
      description: 'Oversee academic quality through reports',
      features: ['Weekly Reports', 'Syllabus Progress', 'Approvals Workflow', 'Feedback Loop']
    },
    {
      title: 'Insights & Operations',
      description: 'Actionable analytics and task coordination',
      features: ['Attendance Trends', 'Result Analysis', 'Chatbot Query Stats', 'Task Assignment']
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
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.first_name || user?.username} (HOD)</h1>
            <p className="text-primary-100 mt-2">Lead your department with clarity and data-driven insights.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <BriefcaseIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Essential department operations</p>
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
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{action.title}</h3>
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
          <h2 className="text-xl font-semibold text-gray-900">Department Features</h2>
          <p className="text-gray-600 mt-1">Tools to manage and scale your department</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    {index === 0 && <UsersIcon className="h-5 w-5 text-primary-600" />}
                    {index === 1 && <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />}
                    {index === 2 && <ChartBarIcon className="h-5 w-5 text-primary-600" />}
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
          <h2 className="text-xl font-semibold text-gray-900">Recent Department Activity</h2>
          <p className="text-gray-600 mt-1">Latest approvals, notices, and analytics checks</p>
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
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MegaphoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent department activity</p>
              <p className="text-sm text-gray-400">Start by reviewing reports or publishing a notice.</p>
            </div>
          )}
        </div>
      </div>

      {/* Guidance */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">HOD Guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700"><span className="font-medium">✔ Standardize Reporting:</span> Ensure teachers follow uniform reporting templates.</p>
            <p className="text-sm text-gray-700"><span className="font-medium">📣 Transparent Notices:</span> Keep all department notices accessible and timely.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700"><span className="font-medium">📊 Data-led Decisions:</span> Use analytics to spot trends and intervene early.</p>
            <p className="text-sm text-gray-700"><span className="font-medium">🤝 Delegate Smartly:</span> Assign tasks with clear owners and due dates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard; 