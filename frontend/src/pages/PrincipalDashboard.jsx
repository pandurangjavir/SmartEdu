import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MegaphoneIcon, UsersIcon, AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const BRANCHES = ['CSE', 'ENTC', 'CIVIL', 'MECH', 'AIDS', 'ELECTRICAL'];

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

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ departmentsCount: 0, totalTeachers: 0, totalHods: 0, totalStudents: 0, departments: [] });
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'hod' | 'teacher' | 'student' | 'announcement' | null
  const [viewBranch, setViewBranch] = useState('CSE');
  const [viewYear, setViewYear] = useState('SY');

  // Forms
  const [hodForm, setHodForm] = useState({ id: '', name: '', email: '', contact: '', username: '', password: '' });
  const [teacherForm, setTeacherForm] = useState({ id: '', name: '', email: '', contact: '', username: '', subject: '', password: '' });
  const [studentForm, setStudentForm] = useState({ year: 'SY', roll_no: '', name: '', email: '', contact: '', username: '', password: '', admission_year: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', target_audience: 'all' });
  const [announcementFilter, setAnnouncementFilter] = useState('all'); // 'all', 'general', 'department'
  const [busy, setBusy] = useState(false);
  const [hodList, setHodList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [announcementList, setAnnouncementList] = useState([]);
  const [hodSearch, setHodSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [hodPage, setHodPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 6;

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v || '');
  const isValidContact = (v) => !v || /^\+?[0-9\-\s]{7,15}$/.test(v);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/principal/stats');
        setStats(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, []);

  // Load lists when modal opens or filters change
  useEffect(() => {
    const loadHods = async () => {
      try { const { data } = await axios.get('/api/principal/hods', { params: { q: hodSearch, page: hodPage, pageSize: PAGE_SIZE, branch: selectedDept } }); setHodList((data && data.rows) || []); } catch (e) { console.error(e); }
    };
    const loadTeachers = async () => {
      try { const { data } = await axios.get(`/api/principal/teachers/${viewBranch}`, { params: { q: teacherSearch, page: teacherPage, pageSize: PAGE_SIZE } }); setTeacherList((data && data.rows) || []); } catch (e) { console.error(e); }
    };
    const loadStudents = async () => {
      try { const { data } = await axios.get(`/api/principal/students/${viewBranch}/${viewYear}`, { params: { q: studentSearch, page: studentPage, pageSize: PAGE_SIZE } }); setStudentList((data && data.rows) || []); } catch (e) { console.error(e); }
    };
    const loadAnnouncements = async () => {
      try { const { data } = await axios.get('/api/principal/announcements'); setAnnouncementList((data && data.rows) || []); } catch (e) { console.error(e); }
    };
    if (modal === 'hod') loadHods();
    if (modal === 'teacher') loadTeachers();
    if (modal === 'student') loadStudents();
    if (modal === 'announcement') loadAnnouncements();
  }, [modal, selectedDept, viewBranch, viewYear, hodSearch, teacherSearch, studentSearch, hodPage, teacherPage, studentPage]);

  const manageBlock = (title, description, onManage, disabled) => (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          {disabled && (
            <p className="text-xs text-amber-600 mt-1">No data configured for this branch.</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button disabled={disabled} onClick={onManage} className={`px-3 py-1.5 rounded text-sm ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>{title.includes('HOD') ? 'Manage' : 'View'}</button>
        </div>
      </div>
    </div>
  );

  const handleManageHod = () => {
    setModal('hod');
  };
  const handleViewTeachers = () => {
    setModal('teacher');
  };
  const handleViewStudents = () => {
    setModal('student');
  };
  const handleAnnouncement = () => {
    setModal('announcement');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Filter + paginate helpers
  const filterByQuery = (list, q, keys) => {
    const query = (q || '').toLowerCase();
    if (!query) return list;
    return (list || []).filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(query)));
  };
  const paginate = (list, page) => {
    const start = (page - 1) * PAGE_SIZE;
    return (list || []).slice(start, start + PAGE_SIZE);
  };
  const hodFiltered = filterByQuery(hodList, hodSearch, ['name', 'email', 'username', 'branch']);
  const teacherFiltered = filterByQuery(teacherList, teacherSearch, ['name', 'email', 'username', 'subject']);
  const studentFiltered = filterByQuery(studentList, studentSearch, ['roll_no', 'name', 'email', 'username']);
  const hodPaged = hodList; // server-paginated
  const teacherPaged = teacherList;
  const studentPaged = studentList;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SmartEdu</h1>
            <p className="text-primary-100">Welcome, {user?.name || user?.first_name || user?.username} (Principal)</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card icon={UserGroupIcon} label="Departments" value={stats.departmentsCount} />
        <Card icon={AcademicCapIcon} label="Teachers" value={stats.totalTeachers} />
        <Card icon={UsersIcon} label="Students" value={stats.totalStudents ?? 0} />
      </div>

      {/* Quick Actions */}
      <Section title="Quick Actions" subtitle="Perform common administrative tasks">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {manageBlock('Manage HOD', 'Add or assign HODs to departments', handleManageHod, false)}
          {manageBlock('View Teachers', 'View teachers by branch', handleViewTeachers, false)}
          {manageBlock('View Students', 'View students by branch and year', handleViewStudents, false)}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Make Announcement</h3>
                <p className="text-sm text-gray-500">Publish a notification to any audience</p>
              </div>
              <button onClick={handleAnnouncement} className="px-3 py-1.5 rounded text-sm bg-primary-600 text-white hover:bg-primary-700">Manage</button>
            </div>
          </div>
        </div>
      </Section>

      {/* Management Modals */}
      {modal === 'hod' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Manage HOD</h3>
              <button onClick={()=>setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                <select value={selectedDept} onChange={(e)=>setSelectedDept(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-700">Name</span>
                  <input value={hodForm.name} onChange={(e)=>setHodForm(v=>({ ...v, name: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <span className="text-sm text-gray-700">Email</span>
                  <input type="email" value={hodForm.email} onChange={(e)=>setHodForm(v=>({ ...v, email: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <span className="text-sm text-gray-700">Contact</span>
                  <input value={hodForm.contact} onChange={(e)=>setHodForm(v=>({ ...v, contact: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <span className="text-sm text-gray-700">Username</span>
                  <input value={hodForm.username} onChange={(e)=>setHodForm(v=>({ ...v, username: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <span className="text-sm text-gray-700">Password</span>
                  <input type="password" value={hodForm.password} onChange={(e)=>setHodForm(v=>({ ...v, password: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button disabled={busy || !hodForm.name || !isValidEmail(hodForm.email) || !hodForm.username} onClick={async ()=>{ try{ setBusy(true); await axios.post('/api/principal/hods', { ...hodForm, branch: selectedDept }); setHodForm({ id: '', name: '', email: '', contact: '', username: '', password: '' }); toast.success('HOD created'); } catch(e){ console.error(e); toast.error(e?.response?.data?.msg || 'Failed to create HOD'); } finally { setBusy(false); } }} className={`px-3 py-2 rounded text-sm ${busy ? 'opacity-70' : ''} bg-primary-600 text-white hover:bg-primary-700`}>{busy ? 'Please wait...' : 'Create'}</button>
                <input placeholder="HOD ID" value={hodForm.id} onChange={(e)=>setHodForm(v=>({ ...v, id: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                <button disabled={busy || !hodForm.id} onClick={async ()=>{ try{ setBusy(true); await axios.delete(`/api/principal/hods/${hodForm.id}`); setHodForm({ id: '', name: '', email: '', contact: '', username: '', password: '' }); toast.success('HOD deleted'); } catch(e){ console.error(e); toast.error(e?.response?.data?.msg || 'Failed to delete HOD'); } finally { setBusy(false); } }} className="px-3 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === 'teacher' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">View Teachers</h3>
              <button onClick={()=>setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                <select value={viewBranch} onChange={(e)=>setViewBranch(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {viewBranch !== 'CSE' && (
                  <p className="text-xs text-amber-600 mt-1">Only CSE branch data is available in the database.</p>
                )}
              </div>
              <div className="max-h-96 overflow-auto border rounded">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewBranch === 'CSE' ? (teacherList || []).map(t => (
                      <tr key={t.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{t.id}</td>
                        <td className="px-3 py-2 text-sm">{t.name}</td>
                        <td className="px-3 py-2 text-sm">{t.email}</td>
                        <td className="px-3 py-2 text-sm">{t.subject || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-8 text-center text-gray-500">No data available for {viewBranch} branch</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === 'student' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">View Students</h3>
              <button onClick={()=>setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                  <select value={viewBranch} onChange={(e)=>setViewBranch(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {viewBranch !== 'CSE' && (
                    <p className="text-xs text-amber-600 mt-1">Only CSE branch data is available in the database.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
                  <select value={viewYear} onChange={(e)=>setViewYear(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="SY">SY</option>
                    <option value="TY">TY</option>
                    <option value="BE">BE</option>
                  </select>
                </div>
              </div>
              <div className="max-h-96 overflow-auto border rounded">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="px-3 py-2">Roll No</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewBranch === 'CSE' ? (studentList || []).map(s => (
                      <tr key={s.roll_no} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{s.roll_no}</td>
                        <td className="px-3 py-2 text-sm">{s.name}</td>
                        <td className="px-3 py-2 text-sm">{s.email || '-'}</td>
                        <td className="px-3 py-2 text-sm">{viewYear}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-8 text-center text-gray-500">No data available for {viewBranch} branch</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {modal === 'announcement' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Manage Announcements</h3>
              <button onClick={()=>setModal(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Create Announcement Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Create New Announcement</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <span className="text-sm text-gray-700">Title</span>
                    <input value={announcementForm.title} onChange={(e)=>setAnnouncementForm(v=>({ ...v, title: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Enter announcement title" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Message</span>
                    <textarea value={announcementForm.message} onChange={(e)=>setAnnouncementForm(v=>({ ...v, message: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" rows="3" placeholder="Enter announcement message"></textarea>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Target Audience</span>
                    <select value={announcementForm.target_audience} onChange={(e)=>setAnnouncementForm(v=>({ ...v, target_audience: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      <option value="all">All Users</option>
                      <option value="students">Students Only</option>
                      <option value="teachers">Teachers Only</option>
                      <option value="hods">HODs Only</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button disabled={busy || !announcementForm.title || !announcementForm.message} onClick={async ()=>{ try{ setBusy(true); await axios.post('/api/principal/announcements', announcementForm); setAnnouncementForm({ title: '', message: '', target_audience: 'all' }); toast.success('Announcement created'); const { data } = await axios.get('/api/principal/announcements'); setAnnouncementList((data && data.rows) || []); } catch(e){ console.error(e); toast.error(e?.response?.data?.msg || 'Failed to create announcement'); } finally { setBusy(false); } }} className={`px-4 py-2 rounded text-sm ${busy ? 'opacity-70' : ''} bg-primary-600 text-white hover:bg-primary-700`}>{busy ? 'Please wait...' : 'Create Announcement'}</button>
                  </div>
                </div>
              </div>

              {/* List of Announcements */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">All Announcements</h4>
                      <p className="text-sm text-gray-600 mt-1">General announcements and department-specific notifications</p>
                    </div>
                    <select 
                      value={announcementFilter} 
                      onChange={(e) => setAnnouncementFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All</option>
                      <option value="general">General Only</option>
                      <option value="department">Department Only</option>
                    </select>
                  </div>
                </div>
                <div className="max-h-96 overflow-auto">
                  {(() => {
                    const filteredAnnouncements = announcementList.filter(announcement => {
                      if (announcementFilter === 'all') return true;
                      if (announcementFilter === 'general') return announcement.source === 'general';
                      if (announcementFilter === 'department') return announcement.source !== 'general';
                      return true;
                    });
                    
                    return filteredAnnouncements.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No announcements found</div>
                    ) : (
                      <div className="divide-y">
                        {filteredAnnouncements.map(announcement => (
                        <div key={`${announcement.source}-${announcement.id}`} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-gray-900">{announcement.title}</h5>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  announcement.source === 'general' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {announcement.source === 'general' ? 'General' : `${announcement.source} Dept`}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Target: {announcement.target_audience}</span>
                                <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                                {announcement.type && <span>Type: {announcement.type}</span>}
                              </div>
                            </div>
                            {announcement.source === 'general' && (
                              <button onClick={async ()=>{ try{ setBusy(true); await axios.delete(`/api/principal/announcements/${announcement.id}`); toast.success('Announcement deleted'); const { data } = await axios.get('/api/principal/announcements'); setAnnouncementList((data && data.rows) || []); } catch(e){ console.error(e); toast.error(e?.response?.data?.msg || 'Failed to delete announcement'); } finally { setBusy(false); } }} className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded">Delete</button>
                            )}
                            {announcement.source !== 'general' && (
                              <span className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded">Read Only</span>
                            )}
                          </div>
                        </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <Section title="Principal Features" subtitle="Platform capabilities at a glance">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="text-sm text-gray-700">Centralized department oversight</li>
          <li className="text-sm text-gray-700">HOD and staff management</li>
          <li className="text-sm text-gray-700">Cross-department analytics</li>
          <li className="text-sm text-gray-700">Institution-wide announcements</li>
        </ul>
      </Section>

      {/* Guidelines */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Principal Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700"><span className="font-medium">✔ Governance:</span> Maintain clear role boundaries and approvals.</p>
            <p className="text-sm text-gray-700"><span className="font-medium">📣 Communication:</span> Share updates regularly across departments.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700"><span className="font-medium">📊 Monitoring:</span> Track attendance and results across branches.</p>
            <p className="text-sm text-gray-700"><span className="font-medium">🔐 Security:</span> Uphold access control and data privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;