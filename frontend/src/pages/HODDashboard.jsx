import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
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
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Card = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-primary-100 mr-3">
        <Icon className="h-6 w-6 text-primary-600"/>
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const HODDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departmentName: '',
    totalTeachers: 0,
    totalStudents: 0,
    pendingReports: 0,
    totalClasses: 0,
    attendanceRate: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'teacher' | 'student' | null
  const [busy, setBusy] = useState(false);
  
  // Forms
  const [teacherForm, setTeacherForm] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    contact: '', 
    username: '', 
    subject: '', 
    password: '' 
  });
  const [studentForm, setStudentForm] = useState({ 
    id: '', 
    roll_no: '', 
    name: '', 
    email: '', 
    contact: '', 
    username: '', 
    year: 'SY', 
    password: '' 
  });
  
  // Lists
  const [teacherList, setTeacherList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load lists when modal opens
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const department = user?.branch || 'CSE';
        const { data } = await axios.get(`/api/hod/teachers/${department}`, { 
          params: { q: teacherSearch } 
        });
        setTeacherList((data && data.rows) || []);
      } catch (e) { 
        console.error(e); 
        setTeacherList([]);
      }
    };
    const loadStudents = async () => {
      try {
        const department = user?.branch || 'CSE';
        const { data } = await axios.get(`/api/hod/students/${department}`, { 
          params: { q: studentSearch } 
        });
        setStudentList((data && data.rows) || []);
      } catch (e) { 
        console.error(e); 
        setStudentList([]);
      }
    };
    
    if (modal === 'teacher') loadTeachers();
    if (modal === 'student') loadStudents();
  }, [modal, teacherSearch, studentSearch, user?.branch]);

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v || '');
  const isValidContact = (v) => !v || /^\+?[0-9\-\s]{7,15}$/.test(v);

  const loadDashboardData = async () => {
    try {
      // Fetch department-specific data from database
      const department = user?.branch || 'CSE';
      
      // Fetch teacher count for the department
      const teachersResponse = await axios.get(`/api/hod/teachers/${department}/count`);
      const teacherCount = teachersResponse.data.count || 0;
      
      // Fetch student count for the department
      const studentsResponse = await axios.get(`/api/hod/students/${department}/count`);
      const studentCount = studentsResponse.data.count || 0;
      
      // Fetch department name
      const deptResponse = await axios.get(`/api/hod/department/${department}`);
      const departmentName = deptResponse.data.name || `${department} Department`;
      
      setStats({
        departmentName: departmentName,
        totalTeachers: teacherCount,
        totalStudents: studentCount,
        pendingReports: 0, // Will be implemented when reports feature is ready
        totalClasses: 0,
        attendanceRate: 0,
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
      // Fallback to placeholder values if API fails
      setStats({
        departmentName: user?.branch || 'CSE Department',
        totalTeachers: 0,
        totalStudents: 0,
        pendingReports: 0,
        totalClasses: 0,
        attendanceRate: 0,
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
    } finally {
      setLoading(false);
    }
  };

  const handleManageTeachers = () => {
    setModal('teacher');
  };

  const handleManageStudents = () => {
    setModal('student');
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
      title: 'Student Services',
      description: 'Access academic resources',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/student-services'
    },
    {
      title: 'Manage Teachers',
      description: 'Add, edit, or organize department teachers',
      icon: UsersIcon,
      color: 'bg-purple-500',
      onClick: handleManageTeachers
    },
    {
      title: 'Manage Students',
      description: 'Add, edit, or organize department students',
      icon: AcademicCapIcon,
      color: 'bg-orange-500',
      onClick: handleManageStudents
    },
    {
      title: 'Profile',
      description: 'Manage your account',
      icon: UserIcon,
      color: 'bg-gray-500',
      link: '/profile'
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
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SmartEdu</h1>
            <p className="text-primary-100">Welcome, {user?.name || user?.first_name || user?.username} (HOD)</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card icon={BuildingOfficeIcon} label="Department" value={stats.departmentName} />
        <Card icon={UsersIcon} label="Teachers" value={stats.totalTeachers} />
        <Card icon={AcademicCapIcon} label="Students" value={stats.totalStudents} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Access your most used features</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const ActionComponent = action.onClick ? 'button' : Link;
              const actionProps = action.onClick 
                ? { onClick: action.onClick, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 w-full text-left" }
                : { to: action.link, className: "group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200" };
              
              return (
                <ActionComponent key={index} {...actionProps}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </ActionComponent>
              );
            })}
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

      {/* Teacher Management Modal */}
      {modal === 'teacher' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Manage Teachers - {user?.branch || 'CSE'} Department</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Add Teacher Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Teacher</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-700">Name</span>
                    <input 
                      value={teacherForm.name} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, name: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter teacher name"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Email</span>
                    <input 
                      type="email" 
                      value={teacherForm.email} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, email: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Contact</span>
                    <input 
                      value={teacherForm.contact} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, contact: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Subject</span>
                    <input 
                      value={teacherForm.subject} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, subject: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter subject"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Username</span>
                    <input 
                      value={teacherForm.username} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, username: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Password</span>
                    <input 
                      type="password" 
                      value={teacherForm.password} 
                      onChange={(e) => setTeacherForm(v => ({ ...v, password: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button 
                    disabled={busy || !teacherForm.name || !isValidEmail(teacherForm.email) || !teacherForm.username} 
                    onClick={async () => {
                      try {
                        setBusy(true);
                        const department = user?.branch || 'CSE';
                        await axios.post('/api/hod/teachers', { ...teacherForm, branch: department });
                        setTeacherForm({ id: '', name: '', email: '', contact: '', username: '', subject: '', password: '' });
                        toast.success('Teacher added successfully');
                        // Reload teachers list
                        const { data } = await axios.get(`/api/hod/teachers/${department}`, { params: { q: teacherSearch } });
                        setTeacherList((data && data.rows) || []);
                        // Reload dashboard stats
                        loadDashboardData();
                      } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.msg || 'Failed to add teacher');
                      } finally {
                        setBusy(false);
                      }
                    }} 
                    className={`px-3 py-2 rounded text-sm ${busy ? 'opacity-70' : ''} bg-primary-600 text-white hover:bg-primary-700`}
                  >
                    {busy ? 'Adding...' : 'Add Teacher'}
                  </button>
                  <input 
                    placeholder="Teacher ID to delete" 
                    value={teacherForm.id} 
                    onChange={(e) => setTeacherForm(v => ({ ...v, id: e.target.value }))} 
                    className="border border-gray-300 rounded px-2 py-1 text-sm" 
                  />
                  <button 
                    disabled={busy || !teacherForm.id} 
                    onClick={async () => {
                      try {
                        setBusy(true);
                        await axios.delete(`/api/hod/teachers/${teacherForm.id}`);
                        setTeacherForm({ id: '', name: '', email: '', contact: '', username: '', subject: '', password: '' });
                        toast.success('Teacher deleted successfully');
                        // Reload teachers list
                        const department = user?.branch || 'CSE';
                        const { data } = await axios.get(`/api/hod/teachers/${department}`, { params: { q: teacherSearch } });
                        setTeacherList((data && data.rows) || []);
                        // Reload dashboard stats
                        loadDashboardData();
                      } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.msg || 'Failed to delete teacher');
                      } finally {
                        setBusy(false);
                      }
                    }} 
                    className="px-3 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Teachers List */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Department Teachers</h4>
                    <input 
                      placeholder="Search teachers..." 
                      value={teacherSearch} 
                      onChange={(e) => setTeacherSearch(e.target.value)} 
                      className="px-3 py-1 border border-gray-300 rounded text-sm" 
                    />
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherList.length > 0 ? teacherList.map(teacher => (
                        <tr key={teacher.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{teacher.id}</td>
                          <td className="px-3 py-2 text-sm">{teacher.name}</td>
                          <td className="px-3 py-2 text-sm">{teacher.email}</td>
                          <td className="px-3 py-2 text-sm">{teacher.subject || '-'}</td>
                          <td className="px-3 py-2 text-sm">{teacher.contact || '-'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-3 py-8 text-center text-gray-500">No teachers found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Management Modal */}
      {modal === 'student' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Manage Students - {user?.branch || 'CSE'} Department</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Add Student Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Student</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-700">Roll Number</span>
                    <input 
                      value={studentForm.roll_no} 
                      onChange={(e) => setStudentForm(v => ({ ...v, roll_no: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter roll number"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Name</span>
                    <input 
                      value={studentForm.name} 
                      onChange={(e) => setStudentForm(v => ({ ...v, name: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Email</span>
                    <input 
                      type="email" 
                      value={studentForm.email} 
                      onChange={(e) => setStudentForm(v => ({ ...v, email: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Year</span>
                    <select 
                      value={studentForm.year} 
                      onChange={(e) => setStudentForm(v => ({ ...v, year: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="SY">SY</option>
                      <option value="TY">TY</option>
                      <option value="BE">BE</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Contact</span>
                    <input 
                      value={studentForm.contact} 
                      onChange={(e) => setStudentForm(v => ({ ...v, contact: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Username</span>
                    <input 
                      value={studentForm.username} 
                      onChange={(e) => setStudentForm(v => ({ ...v, username: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-700">Password</span>
                    <input 
                      type="password" 
                      value={studentForm.password} 
                      onChange={(e) => setStudentForm(v => ({ ...v, password: e.target.value }))} 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button 
                    disabled={busy || !studentForm.roll_no || !studentForm.name || !isValidEmail(studentForm.email) || !studentForm.username} 
                    onClick={async () => {
                      try {
                        setBusy(true);
                        const department = user?.branch || 'CSE';
                        await axios.post('/api/hod/students', { ...studentForm, branch: department });
                        setStudentForm({ id: '', roll_no: '', name: '', email: '', contact: '', username: '', year: 'SY', password: '' });
                        toast.success('Student added successfully');
                        // Reload students list
                        const { data } = await axios.get(`/api/hod/students/${department}`, { params: { q: studentSearch } });
                        setStudentList((data && data.rows) || []);
                        // Reload dashboard stats
                        loadDashboardData();
                      } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.msg || 'Failed to add student');
                      } finally {
                        setBusy(false);
                      }
                    }} 
                    className={`px-3 py-2 rounded text-sm ${busy ? 'opacity-70' : ''} bg-primary-600 text-white hover:bg-primary-700`}
                  >
                    {busy ? 'Adding...' : 'Add Student'}
                  </button>
                  <input 
                    placeholder="Student ID to delete" 
                    value={studentForm.id} 
                    onChange={(e) => setStudentForm(v => ({ ...v, id: e.target.value }))} 
                    className="border border-gray-300 rounded px-2 py-1 text-sm" 
                  />
                  <button 
                    disabled={busy || !studentForm.id} 
                    onClick={async () => {
                      try {
                        setBusy(true);
                        await axios.delete(`/api/hod/students/${studentForm.id}`);
                        setStudentForm({ id: '', roll_no: '', name: '', email: '', contact: '', username: '', year: 'SY', password: '' });
                        toast.success('Student deleted successfully');
                        // Reload students list
                        const department = user?.branch || 'CSE';
                        const { data } = await axios.get(`/api/hod/students/${department}`, { params: { q: studentSearch } });
                        setStudentList((data && data.rows) || []);
                        // Reload dashboard stats
                        loadDashboardData();
                      } catch (e) {
                        console.error(e);
                        toast.error(e?.response?.data?.msg || 'Failed to delete student');
                      } finally {
                        setBusy(false);
                      }
                    }} 
                    className="px-3 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Students List */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Department Students</h4>
                    <input 
                      placeholder="Search students..." 
                      value={studentSearch} 
                      onChange={(e) => setStudentSearch(e.target.value)} 
                      className="px-3 py-1 border border-gray-300 rounded text-sm" 
                    />
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Roll No</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentList.length > 0 ? studentList.map(student => (
                        <tr key={student.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{student.id}</td>
                          <td className="px-3 py-2 text-sm">{student.roll_no}</td>
                          <td className="px-3 py-2 text-sm">{student.name}</td>
                          <td className="px-3 py-2 text-sm">{student.email}</td>
                          <td className="px-3 py-2 text-sm">{student.year}</td>
                          <td className="px-3 py-2 text-sm">{student.contact || '-'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-3 py-8 text-center text-gray-500">No students found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard; 