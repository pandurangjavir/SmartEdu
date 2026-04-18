import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BookOpenIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const EducationalDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_classes: 0,
    total_subjects: 0,
    total_events: 0,
    upcoming_events: 0,
    unpaid_fees: 0,
    partial_fees: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [serviceStats, setServiceStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data in parallel to reduce total wait time
      const [statsRes, studentsRes, eventsRes, announcementsRes, servicesRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/students', { params: { limit: 5 } }),
        axios.get('/events', { params: { active_only: true, limit: 5 } }),
        axios.get('/api/announcements', { params: { active_only: true, limit: 5 } }),
        axios.get('/api/student-services/dashboard')
      ]);

      setStats(statsRes.data);
      setRecentStudents(studentsRes.data || []);
      setUpcomingEvents(eventsRes.data || []);
      setRecentAnnouncements(announcementsRes.data || []);
      setServiceStats(servicesRes.data?.class_stats || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case 'student':
        return 'Student Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'hod':
        return 'HOD Dashboard';
      case 'principal':
        return 'Principal Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Educational Dashboard';
    }
  };

  const getRoleBasedDescription = () => {
    switch (user?.role) {
      case 'student':
        return 'Your personalized academic dashboard';
      case 'teacher':
        return 'Manage your classes and students';
      case 'hod':
        return 'Oversee CSE department operations';
      case 'principal':
        return 'Monitor all department activities';
      case 'admin':
        return 'System administration and management';
      default:
        return 'Educational management system';
    }
  };

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

        <div className="relative z-10 p-6 md:p-8 flex flex-col items-start md:flex-row md:items-center justify-between bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-sm">
          <div className="mb-6 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
              {getRoleBasedTitle()}
            </h1>
            <p className="text-indigo-200/80 font-medium text-sm md:text-base leading-relaxed max-w-xl">{getRoleBasedDescription()}</p>
          </div>
          <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 shadow-inner">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white tracking-wide">{user?.name || user?.first_name || 'User'}</p>
              <p className="text-[10px] text-indigo-300/80 uppercase font-extrabold tracking-widest mt-0.5">{user?.role || 'User'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <AcademicCapIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 p-6 flex items-center hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600 mr-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <UserGroupIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Total Students</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.total_students || 0}</p>
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 p-6 flex items-center hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600 mr-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
            <BookOpenIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Active Classes</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.total_classes || 0}</p>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-all group">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600 mr-4 group-hover:scale-105 transition-transform">
            <ClipboardDocumentListIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Subjects</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_subjects || 0}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-all group">
          <div className="p-4 rounded-xl bg-orange-50 text-orange-600 mr-4 group-hover:scale-105 transition-transform">
            <CalendarDaysIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Upcoming Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcoming_events || 0}</p>
          </div>
        </div>

      </div>

      {/* Admin-only: Quick actions + progress overview */}
      {user?.role === 'admin' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Workspace Actions</h2>
              <p className="text-sm text-gray-500 mt-1">Jump to your most critical administrative tools</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Link to="/hod/members" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserGroupIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-700">Manage Members</h3>
                      <p className="text-xs text-gray-500 mt-1">Users & Access</p>
                    </div>
                  </div>
                </Link>

                <Link to="/admin/subjects" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ChartBarIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700">Curriculum</h3>
                      <p className="text-xs text-gray-500 mt-1">Subjects & Maps</p>
                    </div>
                  </div>
                </Link>

                <Link to="/student-services" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AcademicCapIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-700">Services</h3>
                      <p className="text-xs text-gray-500 mt-1">Marks & Attendance</p>
                    </div>
                  </div>
                </Link>

                <Link to="/event-registration" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-green-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarDaysIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-green-700">Events</h3>
                      <p className="text-xs text-gray-500 mt-1">Campus Activities</p>
                    </div>
                  </div>
                </Link>

                <Link to="/admission-info" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-orange-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpenIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-orange-700">Admissions</h3>
                      <p className="text-xs text-gray-500 mt-1">Updates & Rules</p>
                    </div>
                  </div>
                </Link>

                <Link to="/chatbot" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BellIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-700">AI Chatbot</h3>
                      <p className="text-xs text-gray-500 mt-1">Auto Assistant</p>
                    </div>
                  </div>
                </Link>

                <Link to="/hod/fines" className="group rounded-xl border border-gray-100 p-5 hover:bg-slate-50 hover:border-red-200 hover:shadow-md transition-all">
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-red-700">Manage Fines</h3>
                      <p className="text-xs text-gray-500 mt-1">Issue & Approve</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress summary by class */}
          {serviceStats && serviceStats.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 px-1 border-b border-gray-100 pb-2 mt-2">Class Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceStats.map((cls, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center bg-indigo-50/50 -mx-6 -mt-6 rounded-t-2xl px-6 py-4 border-b border-indigo-50 mb-2">
                       <h4 className="text-lg font-bold text-indigo-900">{cls.class_name}</h4>
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Class</span>
                    </div>
                    
                    {/* Marks */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider">Avg Marks</span>
                        <span className="font-bold text-blue-700">{cls.marks_pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-blue-50 rounded-full h-2">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, cls.marks_pct))}%` }}></div>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider">Attendance</span>
                        <span className="font-bold text-emerald-700">{cls.attendance_pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-emerald-50 rounded-full h-2">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, cls.attendance_pct))}%` }}></div>
                      </div>
                    </div>

                    {/* Fees */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider">Fees Paid</span>
                        <span className="font-bold text-purple-700">{cls.fees_pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-purple-50 rounded-full h-2">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, cls.fees_pct))}%` }}></div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Students</h2>
              <p className="text-sm text-gray-500 mt-1">Latest student registrations</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6">
            {recentStudents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-sm font-bold text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">Students will appear here once they register.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div key={student.student_id} className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all group">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-lg font-bold text-blue-700">
                          {student.roll_no?.charAt(0) || 'S'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {student.name || student.user?.name || student.user?.first_name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Roll No: <span className="font-semibold text-gray-700">{student.roll_no || 'N/A'}</span>
                        {student.class_name && (
                          <span className="ml-2 pl-2 border-l border-gray-300">
                            Class: <span className="font-semibold text-gray-700">{student.class_name}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-sm text-gray-500 mt-1">Campus events and activities</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-500">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-sm font-bold text-gray-900">No upcoming events</h3>
                <p className="mt-1 text-sm text-gray-500">Events will appear here when scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.event_id} className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-green-100 transition-all group">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <CalendarDaysIcon className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {event.event_type || 'Event'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Announcements</h2>
            <p className="text-sm text-gray-500 mt-1">Latest updates and notifications</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
            <BellIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="p-6">
          {recentAnnouncements.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-200">
              <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No announcements</h3>
              <p className="mt-1 text-sm text-gray-500">Announcements will appear here when published.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.announcement_id} className="p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-purple-100 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          announcement.priority === 'urgent' 
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : announcement.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {announcement.priority}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {new Date(announcement.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{announcement.title}</h3>
                      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{announcement.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationalDashboard;
