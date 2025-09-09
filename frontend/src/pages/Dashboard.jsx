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
  CogIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalNotes: 0,
    totalQuizzes: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load chat history for stats
      const chatResponse = await axios.get('/api/chatbot/history');
      const messages = chatResponse.data.messages || [];
      
      setStats({
        totalMessages: messages.length,
        totalNotes: 0, // Will be updated when notes feature is implemented
        totalQuizzes: 0, // Will be updated when quiz feature is implemented
        recentActivity: messages.slice(0, 5).map(msg => ({
          type: 'chat',
          content: msg.message.substring(0, 50) + '...',
          timestamp: msg.timestamp,
          icon: ChatBubbleLeftRightIcon
        }))
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Start Chat',
      description: 'Chat with AI assistant',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500',
      link: '/chatbot'
    },
    {
      title: 'AI Services',
      description: 'Generate notes, quizzes, and more',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/ai-services'
    },
    {
      title: 'Student Services',
      description: 'Access academic resources',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      link: '/student-services'
    },
    {
      title: 'Profile',
      description: 'Manage your account',
      icon: UserIcon,
      color: 'bg-orange-500',
      link: '/profile'
    }
  ];

  const features = [
    {
      title: 'AI Chatbot',
      description: 'Intelligent conversation with voice support',
      features: ['Text & Voice Chat', 'Smart Responses', 'Chat History', 'Voice Commands']
    },
    {
      title: 'AI Services',
      description: 'Powerful AI tools for learning',
      features: ['Notes Generation', 'Quiz Creation', 'Academic Q&A', 'Syllabus Summarizer']
    },
    {
      title: 'Student Services',
      description: 'Comprehensive academic support',
      features: ['Course Management', 'Attendance Tracking', 'Grade Monitoring', 'Event Registration']
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
              Ready to enhance your learning experience with AI-powered tools?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notes Generated</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quizzes Created</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Access your most used features</p>
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
          <h2 className="text-xl font-semibold text-gray-900">Platform Features</h2>
          <p className="text-gray-600 mt-1">Explore what SmartEdu AI can do for you</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    {index === 0 && <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600" />}
                    {index === 1 && <DocumentTextIcon className="h-5 w-5 text-primary-600" />}
                    {index === 2 && <AcademicCapIcon className="h-5 w-5 text-primary-600" />}
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
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 mt-1">Your latest interactions with the platform</p>
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
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Start by sending a message to the AI chatbot!</p>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">💬 Try the AI Chatbot:</span> Ask questions about your studies, get help with assignments, or just have a conversation.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">📝 Generate Notes:</span> Upload documents or paste content to create comprehensive study notes.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">🎯 Create Quizzes:</span> Turn your study materials into practice quizzes to test your knowledge.
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">🎤 Use Voice:</span> Try voice commands in the chatbot for hands-free interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 