import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
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
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  BellIcon
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

// Ultra-Modern Glassmorphic DataTable Component
const DataTable = ({ data, type, onEdit, onDelete, onView }) => {
  const getColumns = () => {
    switch (type) {
      case 'students':
        return [
          { key: 'roll_no', label: 'Roll No' },
          { key: 'name', label: 'Student Name' },
          { key: 'email', label: 'Email Address' },
          { key: 'phone', label: 'Contact' },
          { key: 'admission_year', label: 'Batch Year' }
        ];
      case 'teachers':
        return [
          { key: 'name', label: 'Faculty Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Contact' },
          { key: 'department', label: 'Department' },
          { key: 'designation', label: 'Role' }
        ];
      case 'marks':
        return [
          { key: 'roll_no', label: 'Roll No' },
          { key: 'name', label: 'Student Name' },
          { key: 'total_marks', label: 'Total Score' },
          { key: 'percentage', label: 'Percentage' },
          { key: 'grade', label: 'Grade' }
        ];
      case 'attendance':
        return [
          { key: 'roll_no', label: 'Roll No' },
          { key: 'name', label: 'Student Name' },
          { key: 'total_present', label: 'Present Days' },
          { key: 'total_classes', label: 'Total Days' },
          { key: 'total_percentage', label: 'Attendance %' }
        ];
      default:
        return [];
    }
  };

  const columns = getColumns();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
        <p className="text-sm text-gray-500">There are currently no records to display here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-100/50 sm:rounded-2xl border border-gray-100/50 relative">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/60">
          <thead className="bg-slate-50/80 backdrop-blur-md">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Controls
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 bg-transparent">
            {data.map((item, index) => (
              <tr 
                key={item.id || item.roll_no || index} 
                className="hover:bg-indigo-50/30 transition-colors duration-200 group"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-900 transition-colors">
                      {column.key === 'percentage' || column.key === 'total_percentage' ? 
                        (item[column.key] ? `${parseFloat(item[column.key]).toFixed(2)}%` : '0%') : 
                        (item[column.key] || <span className="text-gray-400 italic">N/A</span>)}
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(item, type)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-all"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(item, type)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg transition-all"
                      title="Edit Record"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id || item.roll_no, type)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-all"
                      title="Delete Record"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// CRUD Modal Component
const CRUDModal = ({ type, modalType, data, setData, onSave, onClose }) => {
  const getFormFields = () => {
    switch (type) {
      case 'students':
        return [
          { key: 'roll_no', label: 'Roll Number', type: 'text', required: true },
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'parent_name', label: 'Parent Name', type: 'text' },
          { key: 'parent_phone', label: 'Parent Phone', type: 'tel' },
          { key: 'admission_year', label: 'Admission Year', type: 'number' },
          { key: 'blood_group', label: 'Blood Group', type: 'text' },
          { key: 'emergency_contact', label: 'Emergency Contact', type: 'tel' },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: modalType === 'create' }
        ];
      case 'teachers':
        return [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'qualification', label: 'Qualification', type: 'text' },
          { key: 'experience', label: 'Experience (Years)', type: 'number' },
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'designation', label: 'Designation', type: 'text' },
          { key: 'subject_expertise', label: 'Subject Expertise', type: 'text' },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: modalType === 'create' }
        ];
      case 'marks':
        return [
          { key: 'roll_no', label: 'Roll Number', type: 'text', required: true },
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'subject1_theory', label: 'Subject 1 Theory', type: 'number' },
          { key: 'subject1_practical', label: 'Subject 1 Practical', type: 'number' },
          { key: 'subject2_theory', label: 'Subject 2 Theory', type: 'number' },
          { key: 'subject2_practical', label: 'Subject 2 Practical', type: 'number' },
          { key: 'subject3_theory', label: 'Subject 3 Theory', type: 'number' },
          { key: 'subject3_practical', label: 'Subject 3 Practical', type: 'number' },
          { key: 'subject4_theory', label: 'Subject 4 Theory', type: 'number' },
          { key: 'subject4_practical', label: 'Subject 4 Practical', type: 'number' },
          { key: 'subject5_theory', label: 'Subject 5 Theory', type: 'number' },
          { key: 'subject5_practical', label: 'Subject 5 Practical', type: 'number' },
          { key: 'total_marks', label: 'Total Marks', type: 'number' },
          { key: 'percentage', label: 'Percentage', type: 'number' },
          { key: 'grade', label: 'Grade', type: 'text' }
        ];
      case 'attendance':
        return [
          { key: 'roll_no', label: 'Roll Number', type: 'text', required: true },
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'subject1_theory_present', label: 'Subject 1 Theory Present', type: 'number' },
          { key: 'subject1_theory_total', label: 'Subject 1 Theory Total', type: 'number' },
          { key: 'subject1_practical_present', label: 'Subject 1 Practical Present', type: 'number' },
          { key: 'subject1_practical_total', label: 'Subject 1 Practical Total', type: 'number' },
          { key: 'subject2_theory_present', label: 'Subject 2 Theory Present', type: 'number' },
          { key: 'subject2_theory_total', label: 'Subject 2 Theory Total', type: 'number' },
          { key: 'subject2_practical_present', label: 'Subject 2 Practical Present', type: 'number' },
          { key: 'subject2_practical_total', label: 'Subject 2 Practical Total', type: 'number' },
          { key: 'subject3_theory_present', label: 'Subject 3 Theory Present', type: 'number' },
          { key: 'subject3_theory_total', label: 'Subject 3 Theory Total', type: 'number' },
          { key: 'subject3_practical_present', label: 'Subject 3 Practical Present', type: 'number' },
          { key: 'subject3_practical_total', label: 'Subject 3 Practical Total', type: 'number' },
          { key: 'subject4_theory_present', label: 'Subject 4 Theory Present', type: 'number' },
          { key: 'subject4_theory_total', label: 'Subject 4 Theory Total', type: 'number' },
          { key: 'subject4_practical_present', label: 'Subject 4 Practical Present', type: 'number' },
          { key: 'subject4_practical_total', label: 'Subject 4 Practical Total', type: 'number' },
          { key: 'subject5_theory_present', label: 'Subject 5 Theory Present', type: 'number' },
          { key: 'subject5_theory_total', label: 'Subject 5 Theory Total', type: 'number' },
          { key: 'subject5_practical_present', label: 'Subject 5 Practical Present', type: 'number' },
          { key: 'subject5_practical_total', label: 'Subject 5 Practical Total', type: 'number' },
          { key: 'total_present', label: 'Total Present', type: 'number' },
          { key: 'total_classes', label: 'Total Classes', type: 'number' },
          { key: 'total_percentage', label: 'Total Percentage', type: 'number' }
        ];
      default:
        return [];
    }
  };

  const fields = getFormFields();
  const isReadOnly = modalType === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {modalType === 'create' ? 'Create' : modalType === 'edit' ? 'Edit' : 'View'} {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={data[field.key] || ''}
                    onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      isReadOnly ? 'bg-gray-100' : ''
                    }`}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {modalType === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HODDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departmentName: '',
    totalTeachers: 0,
    totalStudents: 0,
    pendingReports: 0,
    totalClasses: 0,
    attendanceRate: 0,
    recentActivity: [],
    notificationsCount: 0,
    eventsCount: 0,
    averageMarks: 0,
    lowAttendanceStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('overview');
  const [data, setData] = useState({
    students: [],
    teachers: [],
    marks: [],
    attendance: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);







  const loadDashboardData = async () => {
    try {
      // Fetch all students from database
      const studentsResponse = await axios.get('/api/students');
      const students = studentsResponse.data || [];
      const studentCount = students.length;
      
      // Fetch classes (only CSE department)
      const classesResponse = await axios.get('/api/classes?dept_id=1');
      const classes = classesResponse.data || [];
      const classCount = classes.length;
      
      // Calculate attendance rate using aggregated attendance API to avoid per-student requests
      let attendanceRate = 0;
      let lowAttendanceStudents = 0;
      try {
        const aggAttendanceRes = await axios.get('/api/student-services/attendance');
        const agg = aggAttendanceRes.data || [];
        // agg is an array grouped by class with students array containing 'total_percentage'
        let totalPercentage = 0;
        let attendStudentCount = 0;
        agg.forEach((cls) => {
          cls.students.forEach((s) => {
            const percentage = parseFloat(s.total_percentage || 0);
            if (!isNaN(percentage)) {
              totalPercentage += percentage;
              attendStudentCount++;
              // Count students with attendance < 75%
              if (percentage < 75) {
                lowAttendanceStudents++;
              }
            }
          });
        });
        attendanceRate = attendStudentCount > 0 ? Math.round(totalPercentage / attendStudentCount) : 0;
      } catch (err) {
        console.warn('Could not fetch aggregated attendance, falling back to 0', err);
        attendanceRate = 0;
      }
      
      // Fetch events for pending reports count
      const eventsResponse = await axios.get('/events');
      const events = eventsResponse.data || [];
      const upcomingEvents = events.filter(event => new Date(event.event_date) >= new Date()).length;
      
      // Fetch announcements
      let notificationsCount = 0;
      try {
        const announcementsRes = await axios.get('/api/announcements');
        const announcements = announcementsRes.data || [];
        notificationsCount = announcements.length;
      } catch (err) {
        console.warn('Could not fetch announcements', err);
      }

      // Fetch marks data for average calculation
      let averageMarks = 0;
      try {
        const marksRes = await axios.get('/api/student-services/marks');
        const marksData = marksRes.data || [];
        
        // Calculate average marks percentage across all students
        let totalPercentage = 0;
        let studentCount = 0;
        if (marksData && marksData.length > 0) {
          marksData.forEach((cls) => {
            if (cls.students && cls.students.length > 0) {
              cls.students.forEach((student) => {
                const percentage = parseFloat(student.percentage || 0);
                if (!isNaN(percentage) && percentage > 0) {
                  totalPercentage += percentage;
                  studentCount++;
                }
              });
            }
          });
        }
        averageMarks = studentCount > 0 ? Math.round(totalPercentage / studentCount) : 0;
      } catch (err) {
        console.warn('Could not fetch marks data for analysis', err);
      }
      
      setStats({
        departmentName: 'Computer Science & Engineering',
        totalTeachers: 0, // No teachers in current schema
        totalStudents: studentCount,
        pendingReports: upcomingEvents,
        totalClasses: classCount,
        attendanceRate: attendanceRate,
        notificationsCount: notificationsCount,
        eventsCount: events.length,
        averageMarks: averageMarks,
        lowAttendanceStudents: lowAttendanceStudents,
        recentActivity: [
          {
            type: 'students',
            content: `${studentCount} students enrolled in CSE`,
            timestamp: new Date().toISOString(),
            icon: UsersIcon
          },
          {
            type: 'attendance',
            content: `Overall attendance rate: ${attendanceRate}%`,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            icon: ChartBarIcon
          },
          {
            type: 'events',
            content: `${events.length} upcoming events`,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            icon: MegaphoneIcon
          }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback values
      setStats({
        departmentName: 'Computer Science & Engineering',
        totalTeachers: 0,
        totalStudents: 30,
        pendingReports: 6,
        totalClasses: 3,
        attendanceRate: 0,
        notificationsCount: 0,
        eventsCount: 0,
        averageMarks: 0,
        lowAttendanceStudents: 0,
        recentActivity: [
          {
            type: 'students',
            content: '30 students enrolled in CSE',
            timestamp: new Date().toISOString(),
            icon: UsersIcon
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Management actions are accessible on the HOD Members page

  const quickActions = [
    {
      title: 'AI Chatbot',
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
      title: 'Manage Fines',
      description: 'Issue and approve fines',
      icon: DocumentTextIcon,
      color: 'bg-red-500',
      link: '/hod/fines'
    },
    {
      title: 'Manage Members',
      description: 'Add, edit, and organize students',
      icon: UsersIcon,
      color: 'bg-purple-600',
      link: '/hod/members'
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
      description: 'Centralized control over students',
      features: ['Student Directory', 'Section/Class Mapping', 'Bulk Imports', 'Role Adjustments']
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-32 -mb-12 w-32 h-32 rounded-full bg-indigo-500 opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Department Administration</h1>
            <p className="text-indigo-200 font-medium text-lg">Welcome back, {user?.name || user?.first_name || user?.username} (HOD)</p>
          </div>
          <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">SKN Sinhgad College</p>
              <p className="text-xs text-indigo-200">Admin Portal v2.0</p>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-indigo-300 opacity-80" />
          </div>
        </div>
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Main Stats (Taking up 2/3 space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-blue-50 mr-4">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Department</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.departmentName}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-indigo-50 mr-4">
                <AcademicCapIcon className="h-8 w-8 text-indigo-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Enrolled Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions Hub</h2>
              <p className="text-sm text-gray-500 mt-1">Jump instantly to high-priority administrative tasks</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const ActionComponent = action.onClick ? 'button' : Link;
                  const actionProps = action.onClick 
                    ? { onClick: action.onClick, className: "group flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all text-left" }
                    : { to: action.link, className: "group flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all" };
                  
                  return (
                    <ActionComponent key={index} {...actionProps}>
                        <div className={`p-3 rounded-xl ${action.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                        </div>
                    </ActionComponent>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      

        {/* Right Col: Key Metrics (Taking up 1/3 space on large screens) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Key Metrics</h2>
                <p className="text-xs text-gray-500 mt-1">Real-time performance</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-6 space-y-4">
              
              {/* Average Attendance */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white shadow-sm group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-green-700">{stats.attendanceRate}%</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Avg Attendance</h3>
              </div>

              {/* Average Marks */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm group-hover:scale-110 transition-transform">
                    <AcademicCapIcon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-blue-700">{stats.averageMarks}%</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Avg Marks</h3>
              </div>

              {/* Low Attendance Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white shadow-sm group-hover:scale-110 transition-transform">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-orange-700">{stats.lowAttendanceStudents}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Low Attendance Users</h3>
              </div>

              {/* Notifications & Events Summary */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-xl font-bold text-indigo-600">{stats.notificationsCount}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mt-1">Notices</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-xl font-bold text-pink-600">{stats.totalClasses}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mt-1">Classes</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Admin Guidelines Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Guidelines</h2>
            <p className="text-sm text-gray-500 mt-1">Best practices for effective department management</p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
            <InformationCircleIcon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Management */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-5">
                <div className="p-3 rounded-xl bg-blue-500 shadow-sm mr-4">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Student Management</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Regularly update student information and academic records',
                  'Monitor low attendance students and take timely action',
                  'Verify fee payments and maintain accurate financial records',
                  'Add new students with complete information including roll numbers'
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <CheckBadgeIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Communication & Events */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-5">
                <div className="p-3 rounded-xl bg-purple-500 shadow-sm mr-4">
                  <MegaphoneIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Communication & Events</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Send clear and timely announcements to all students',
                  'Create and manage department events and workshops',
                  'Track event registrations and participant engagement',
                  'Use AI chatbot for student queries and support'
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <CheckBadgeIcon className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Analytics & Reporting */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-5">
                <div className="p-3 rounded-xl bg-emerald-500 shadow-sm mr-4">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Analytics & Reporting</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Review department key metrics regularly',
                  'Use attendance and marks data for informed decisions',
                  'Identify at-risk students early and provide support',
                  'Generate reports for academic quality improvement'
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <CheckBadgeIcon className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Task Management */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-5">
                <div className="p-3 rounded-xl bg-amber-500 shadow-sm mr-4">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Task Management</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Assign tasks with clear descriptions and deadlines',
                  'Monitor task progress and completion status',
                  'Provide feedback on completed tasks',
                  'Maintain organized workflow for department operations'
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <CheckBadgeIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Management moved to HODMembers page for a cleaner experience */}

      {/* Management moved to HODMembers page for a cleaner experience */}
    </div>
  );
};

export default HODDashboard; 