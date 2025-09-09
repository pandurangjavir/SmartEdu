import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BellIcon, 
  CalendarIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentServices = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    notifications: [],
    events: [],
    marks: [],
    attendance: [],
    fees: [],
    attendanceDefaulters: [],
    feesDefaulters: []
  });
  const [defaultersView, setDefaultersView] = useState('attendance'); // 'attendance' | 'fees'
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch only what is needed for the active tab to keep it fast and reliable
      if (activeTab === 'events') {
        const res = await axios.get('/api/events');
        const events = Array.isArray(res?.data?.events) ? res.data.events : (Array.isArray(res?.data) ? res.data : []);
        setData(prev => ({ ...prev, events }));
      } else if (activeTab === 'notifications') {
        const res = await axios.get('/api/notifications');
        const notifications = Array.isArray(res?.data?.notifications) ? res.data.notifications : (Array.isArray(res?.data) ? res.data : []);
        setData(prev => ({ ...prev, notifications }));
      } else if (activeTab === 'marks') {
        const res = await axios.get('/api/marks');
        const marks = Array.isArray(res?.data?.marks) ? res.data.marks : (Array.isArray(res?.data) ? res.data : []);
        setData(prev => ({ ...prev, marks }));
      } else if (activeTab === 'attendance') {
        const res = await axios.get('/api/attendance');
        const attendance = Array.isArray(res?.data?.attendance) ? res.data.attendance : (Array.isArray(res?.data) ? res.data : []);
        setData(prev => ({ ...prev, attendance }));
      } else if (activeTab === 'fees') {
        const res = await axios.get('/api/fees');
        const fees = Array.isArray(res?.data?.fees) ? res.data.fees : (Array.isArray(res?.data) ? res.data : []);
        setData(prev => ({ ...prev, fees }));
      } else if (activeTab === 'defaulters' && isHOD()) {
        // Fetch attendance and fees defaulters across SY/TY/BE in parallel
        const years = ['sy','ty','be'];
        const [attSY, attTY, attBE] = await Promise.all(years.map(y => axios.get(`/api/hod/attendance-defaulters/cse/${y.toUpperCase()}`)));
        const [feeSY, feeTY, feeBE] = await Promise.all(years.map(y => axios.get(`/api/hod/fees-defaulters/cse/${y.toUpperCase()}`)));
        const attendanceDefaulters = []
          .concat(Array.isArray(attSY?.data) ? attSY.data.map(r => ({ ...r, year: 'SY' })) : attSY?.data?.rows || [])
          .concat(Array.isArray(attTY?.data) ? attTY.data.map(r => ({ ...r, year: 'TY' })) : attTY?.data?.rows || [])
          .concat(Array.isArray(attBE?.data) ? attBE.data.map(r => ({ ...r, year: 'BE' })) : attBE?.data?.rows || []);
        const feesDefaulters = []
          .concat(Array.isArray(feeSY?.data) ? feeSY.data.map(r => ({ ...r, year: 'SY' })) : feeSY?.data?.rows || [])
          .concat(Array.isArray(feeTY?.data) ? feeTY.data.map(r => ({ ...r, year: 'TY' })) : feeTY?.data?.rows || [])
          .concat(Array.isArray(feeBE?.data) ? feeBE.data.map(r => ({ ...r, year: 'BE' })) : feeBE?.data?.rows || []);
        setData(prev => ({ ...prev, attendanceDefaulters, feesDefaulters }));
      } else {
        // Fallback: hydrate everything for the first load or unknown tab
        const response = await axios.get('/api/all');
        const notifications = Array.isArray(response?.data?.notifications) ? response.data.notifications : [];
        const events = Array.isArray(response?.data?.events) ? response.data.events : [];
        const marks = Array.isArray(response?.data?.marks) ? response.data.marks : [];
        const attendance = Array.isArray(response?.data?.attendance) ? response.data.attendance : [];
        const fees = Array.isArray(response?.data?.fees) ? response.data.fees : [];
        setData(prev => ({ ...prev, notifications, events, marks, attendance, fees }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegistration = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`);
      toast.success('Successfully registered for event!');
      fetchData();
    } catch (error) {
      toast.error('Failed to register for event');
    }
  };

  // Helper functions for role-based access
  const isStudent = () => user?.role === 'student';
  const isTeacher = () => user?.role === 'teacher';
  const isHOD = () => user?.role === 'hod';
  const isPrincipal = () => user?.role === 'principal';
  const canEdit = () => isHOD() || isPrincipal();

  // Edit functions
  const handleEdit = (item, type) => {
    // Normalize edit form specifically for marks rows (we only edit marks + exam type)
    if (type === 'marks') {
      setEditingItem({ ...item, type });
      setEditForm({
        examType: item.exam_type || '',
        subject1: item.subject1 || '',
        subject1Marks: Number(item.subject1_marks ?? 0),
        subject2: item.subject2 || '',
        subject2Marks: Number(item.subject2_marks ?? 0),
        subject3: item.subject3 || '',
        subject3Marks: Number(item.subject3_marks ?? 0),
        subject4: item.subject4 || '',
        subject4Marks: Number(item.subject4_marks ?? 0),
        subject5: item.subject5 || '',
        subject5Marks: Number(item.subject5_marks ?? 0),
      });
      return;
    }

    // Default mapping for other types
    setEditingItem({ ...item, type });
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    try {
      const { type, id, year } = editingItem;
      let endpoint = '';
      
      if (type === 'marks') endpoint = '/api/marks';
      else if (type === 'attendance') endpoint = '/api/attendance';
      else if (type === 'fees') endpoint = '/api/fees';
      
      await axios.put(endpoint, { ...editForm, [type + 'Id']: id, year });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
      setEditingItem(null);
      setEditForm({});
      fetchData();
    } catch (error) {
      toast.error('Failed to update data');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  // Group helpers for HOD/Principal views
  const groupBy = (arr, keyFn) => arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const tabs = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'View your notifications and announcements'
    },
    {
      id: 'events',
      name: 'Events',
      icon: CalendarIcon,
      description: 'Browse and register for upcoming events'
    },
    {
      id: 'marks',
      name: 'Marks',
      icon: AcademicCapIcon,
      description: 'View your academic performance'
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: ChartBarIcon,
      description: 'Track your attendance records'
    },
    {
      id: 'fees',
      name: 'Fees',
      icon: CurrencyDollarIcon,
      description: 'View your fee payment status'
    },
    ...(isHOD() ? [{
      id: 'defaulters',
      name: 'Defaulters',
      icon: ChartBarIcon,
      description: 'Generate attendance and fees defaulters'
    }] : [])
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-4">
            {data.notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any notifications yet.</p>
              </div>
            ) : (
              data.notifications.map((notification) => (
                <div key={notification.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notification.type === 'exam' ? 'bg-red-100 text-red-800' :
                          notification.type === 'project' ? 'bg-purple-100 text-purple-800' :
                          notification.type === 'event' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'academic' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2 leading-relaxed">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-3 flex items-center">
                        <BellIcon className="h-4 w-4 mr-1" />
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            {data.events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new events.</p>
              </div>
            ) : (
              data.events.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 mt-2 leading-relaxed">{event.description}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {event.branch && (
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {event.branch}
                            </span>
                          </div>
                        )}
                      </div>
                      {event.registration_link && (
                        <a 
                          href={event.registration_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Registration Link →
                        </a>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {isStudent() ? (
                    <button
                      onClick={() => handleEventRegistration(event.id)}
                      disabled={event.is_registered}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        event.is_registered
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
                      }`}
                    >
                          {event.is_registered ? '✓ Registered' : 'Register'}
                    </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Registrations</p>
                          <p className="text-lg font-semibold text-primary-600">{event.registration_count || 0}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'marks':
        return (
          <div className="space-y-4">
            {data.marks?.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No marks available</h3>
                <p className="mt-1 text-sm text-gray-500">Marks will appear here once they are published.</p>
              </div>
            ) : (
              <>
                {isStudent() && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.marks, m => m.semester || 'Unknown')).map(([semKey, semGroup]) => (
                      <div key={`sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {!isStudent() && (
                                <>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                </>
                              )}
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub1</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub2</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub3</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub4</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub5</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                              {canEdit() && <th className="px-4 py-3" />}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {semGroup.map((m) => (
                              <tr key={`m-${m.id}`} className="hover:bg-gray-50">
                                {!isStudent() && (
                                  <>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.student_roll_no}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.student_name}</td>
                                  </>
                                )}
                                <td className="px-4 py-3 text-sm text-gray-900">{m.exam_type}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.academic_year}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.subject1 ? `${m.subject1}: ${m.subject1_marks}/${m.subject1_total}` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.subject2 ? `${m.subject2}: ${m.subject2_marks}/${m.subject2_total}` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.subject3 ? `${m.subject3}: ${m.subject3_marks}/${m.subject3_total}` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.subject4 ? `${m.subject4}: ${m.subject4_marks}/${m.subject4_total}` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{m.subject5 ? `${m.subject5}: ${m.subject5_marks}/${m.subject5_total}` : '-'}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{m.total_marks}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-primary-700">{m.total_percentage}%</td>
                                {canEdit() && (
                                  <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleEdit(m, 'marks')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}

                {(isHOD() || isPrincipal() || isTeacher()) && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.marks, m => m.year || 'Unknown')).map(([yearKey, yearGroup]) => (
                      <div key={`year-${yearKey}`} className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800">Year: {yearKey}</h3>
                        {Object.entries(groupBy(yearGroup, m => m.semester || 'Unknown')).map(([semKey, semGroup]) => (
                          <div key={`year-${yearKey}-sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub1</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub2</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub3</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub4</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub5</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {semGroup.map((m) => (
                                  <tr key={`m-${m.id}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.student_roll_no}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.student_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.exam_type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.academic_year}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.subject1 ? `${m.subject1}: ${m.subject1_marks}/${m.subject1_total}` : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.subject2 ? `${m.subject2}: ${m.subject2_marks}/${m.subject2_total}` : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.subject3 ? `${m.subject3}: ${m.subject3_marks}/${m.subject3_total}` : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.subject4 ? `${m.subject4}: ${m.subject4_marks}/${m.subject4_total}` : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{m.subject5 ? `${m.subject5}: ${m.subject5_marks}/${m.subject5_total}` : '-'}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{m.total_marks}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-primary-700">{m.total_percentage}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-4">
            {data.attendance.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                <p className="mt-1 text-sm text-gray-500">Attendance records will appear here.</p>
              </div>
            ) : (
              <>
                {isStudent() && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.attendance, a => a.semester || 'Unknown')).map(([semKey, semGroup]) => (
                      <div key={`att-sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub1</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub2</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub3</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub4</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub5</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Classes</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {semGroup.map((a) => (
                              <tr key={`a-${a.id}`} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{a.academic_year}</td>
                                <td className="px-4 py-3 text-xs text-gray-900">
                                  {a.subject1_theory ? `${a.subject1_theory}: ${a.subject1_theory_present}/${a.subject1_theory_total}` : '-'}
                                  {a.subject1_practical ? `, ${a.subject1_practical}: ${a.subject1_practical_present}/${a.subject1_practical_total}` : ''}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900">
                                  {a.subject2_theory ? `${a.subject2_theory}: ${a.subject2_theory_present}/${a.subject2_theory_total}` : '-'}
                                  {a.subject2_practical ? `, ${a.subject2_practical}: ${a.subject2_practical_present}/${a.subject2_practical_total}` : ''}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900">
                                  {a.subject3_theory ? `${a.subject3_theory}: ${a.subject3_theory_present}/${a.subject3_theory_total}` : '-'}
                                  {a.subject3_practical ? `, ${a.subject3_practical}: ${a.subject3_practical_present}/${a.subject3_practical_total}` : ''}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900">
                                  {a.subject4_theory ? `${a.subject4_theory}: ${a.subject4_theory_present}/${a.subject4_theory_total}` : '-'}
                                  {a.subject4_practical ? `, ${a.subject4_practical}: ${a.subject4_practical_present}/${a.subject4_practical_total}` : ''}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-900">
                                  {a.subject5_theory ? `${a.subject5_theory}: ${a.subject5_theory_present}/${a.subject5_theory_total}` : '-'}
                                  {a.subject5_practical ? `, ${a.subject5_practical}: ${a.subject5_practical_present}/${a.subject5_practical_total}` : ''}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{a.total_present}/{a.total_classes}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-primary-700">{a.total_percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}

                {(isHOD() || isPrincipal() || isTeacher()) && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.attendance, a => a.year || 'Unknown')).map(([yearKey, yearGroup]) => (
                      <div key={`att-year-${yearKey}`} className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800">Year: {yearKey}</h3>
                        {Object.entries(groupBy(yearGroup, a => a.semester || 'Unknown')).map(([semKey, semGroup]) => (
                          <div key={`att-year-${yearKey}-sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub1</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub2</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub3</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub4</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub5</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Classes</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                                  {canEdit() && <th className="px-4 py-3" />}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {semGroup.map((a) => (
                                  <tr key={`a-${a.id}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{a.student_roll_no}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{a.student_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{a.academic_year}</td>
                                    <td className="px-4 py-3 text-xs text-gray-900">
                                      {a.subject1_theory ? `${a.subject1_theory}: ${a.subject1_theory_present}/${a.subject1_theory_total}` : '-'}
                                      {a.subject1_practical ? `, ${a.subject1_practical}: ${a.subject1_practical_present}/${a.subject1_practical_total}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-900">
                                      {a.subject2_theory ? `${a.subject2_theory}: ${a.subject2_theory_present}/${a.subject2_theory_total}` : '-'}
                                      {a.subject2_practical ? `, ${a.subject2_practical}: ${a.subject2_practical_present}/${a.subject2_practical_total}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-900">
                                      {a.subject3_theory ? `${a.subject3_theory}: ${a.subject3_theory_present}/${a.subject3_theory_total}` : '-'}
                                      {a.subject3_practical ? `, ${a.subject3_practical}: ${a.subject3_practical_present}/${a.subject3_practical_total}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-900">
                                      {a.subject4_theory ? `${a.subject4_theory}: ${a.subject4_theory_present}/${a.subject4_theory_total}` : '-'}
                                      {a.subject4_practical ? `, ${a.subject4_practical}: ${a.subject4_practical_present}/${a.subject4_practical_total}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-900">
                                      {a.subject5_theory ? `${a.subject5_theory}: ${a.subject5_theory_present}/${a.subject5_theory_total}` : '-'}
                                      {a.subject5_practical ? `, ${a.subject5_practical}: ${a.subject5_practical_present}/${a.subject5_practical_total}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{a.total_present}/{a.total_classes}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-primary-700">{a.total_percentage}%</td>
                                    {canEdit() && (
                                      <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(a, 'attendance')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-4">
            {data.fees.length === 0 ? (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fees records</h3>
                <p className="mt-1 text-sm text-gray-500">Fee records will appear here.</p>
              </div>
            ) : (
              <>
                {isStudent() && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.fees, f => f.semester || 'Unknown')).map(([semKey, semGroup]) => (
                      <div key={`fees-sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {semGroup.map((f) => (
                              <tr key={`f-${f.id}`} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{f.academic_year}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">₹{Number(f.total_fees).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">₹{Number(f.paid_fees).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-red-600">₹{Number(f.remaining_fees).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}

                {(isHOD() || isPrincipal() || isTeacher()) && (
                  <div className="space-y-6">
                    {Object.entries(groupBy(data.fees, f => f.year || 'Unknown')).map(([yearKey, yearGroup]) => (
                      <div key={`fees-year-${yearKey}`} className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800">Year: {yearKey}</h3>
                        {Object.entries(groupBy(yearGroup, f => f.semester || 'Unknown')).map(([semKey, semGroup]) => (
                          <div key={`fees-year-${yearKey}-sem-${semKey}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">Semester: {semKey}</div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                                  {canEdit() && <th className="px-4 py-3" />}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {semGroup.map((f) => (
                                  <tr key={`f-${f.id}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{f.student_roll_no}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{f.student_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{f.academic_year}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">₹{Number(f.total_fees).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">₹{Number(f.paid_fees).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-red-600">₹{Number(f.remaining_fees).toLocaleString()}</td>
                                    {canEdit() && (
                                      <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleEdit(f, 'fees')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'defaulters':
        return (
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDefaultersView('attendance')}
                className={`px-3 py-1 rounded-md text-sm ${defaultersView === 'attendance' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >Attendance</button>
              <button
                onClick={() => setDefaultersView('fees')}
                className={`px-3 py-1 rounded-md text-sm ${defaultersView === 'fees' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >Fees</button>
            </div>

            {defaultersView === 'attendance' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.attendanceDefaulters.length === 0 ? (
                      <tr><td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>No attendance defaulters</td></tr>
                    ) : (
                      data.attendanceDefaulters.map((r) => (
                        <tr key={`attdef-${r.id}-${r.year}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{r.student_roll_no || r.roll_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.student_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.year}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.semester}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.academic_year}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-red-600">{Number(r.total_percentage).toFixed(2)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.feesDefaulters.length === 0 ? (
                      <tr><td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>No fees defaulters</td></tr>
                    ) : (
                      data.feesDefaulters.map((r) => (
                        <tr key={`feedef-${r.id}-${r.year}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{r.student_roll_no || r.roll_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.student_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.year}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.semester}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.academic_year}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-red-600">₹{Number(r.remaining_fees).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    if (isStudent()) return 'Student Services';
    if (isTeacher()) return 'Student Management - View All';
    if (isHOD()) return 'Student Management - CSE Department';
    if (isPrincipal()) return 'Student Management - All Departments';
    return 'Student Services';
  };

  const getPageDescription = () => {
    if (isStudent()) return 'Access your academic information, events, and notifications';
    if (isTeacher()) return 'View all students\' academic information across all classes';
    if (isHOD()) return 'View and manage CSE department students\' academic information';
    if (isPrincipal()) return 'View and manage all departments\' students\' academic information';
    return 'Access academic information, events, and notifications';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        <p className="text-gray-600 mt-2">
          {getPageDescription()}
        </p>
        {!isStudent() && (
          <div className="mt-2 text-sm text-blue-600">
            {canEdit() ? 'You can edit student data by clicking the Edit button on each record.' : 'You can view all student data across all classes.'}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentServices; 