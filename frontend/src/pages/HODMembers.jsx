import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { UsersIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const YEAR_OPTIONS = ['SY', 'TY', 'Final'];
const BRANCHES = ['CSE', 'ENTC', 'CIVIL', 'MECH', 'ELECTRICAL'];

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const Input = (props) => (
  <input {...props} className={`w-full border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm ${props.className || ''}`} />
);

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    danger: 'bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white'
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
};

const HODMembers = () => {
  const { user } = useAuth();

  // Students
  const [year, setYear] = useState('SY');
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ roll_no: '', name: '', email: '', contact: '', username: '', admission_year: '' });
  const [studentEdit, setStudentEdit] = useState(null); // roll_no for edit
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [year]);

  const loadStudents = async () => {
    try {
      setStudentLoading(true);
      const currentBranch = (user?.branch || 'CSE');
      const { data } = await axios.get(`/api/hod/students/${currentBranch}/${year}`);
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setStudentLoading(false);
    }
  };

  const upsertStudent = async (e) => {
    e.preventDefault();
    try {
      if (studentEdit) {
        const currentBranch = (user?.branch || 'CSE');
        await axios.put(`/api/hod/students/${currentBranch}/${year}/${studentEdit}`, studentForm);
      } else {
        const currentBranch = (user?.branch || 'CSE');
        await axios.post(`/api/hod/students/${currentBranch}/${year}`, studentForm);
      }
      setStudentForm({ roll_no: '', name: '', email: '', contact: '', username: '', admission_year: '' });
      setStudentEdit(null);
      await loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const editStudent = (s) => {
    setStudentEdit(s.roll_no);
    setStudentForm({ roll_no: s.roll_no || '', name: s.name || '', email: s.email || '', contact: s.contact || '', username: s.username || '', admission_year: s.admission_year || '' });
  };
  const deleteStudent = async (rollNo) => {
    if (!confirm('Delete this student?')) return;
    try {
      const currentBranch = (user?.branch || 'CSE');
      await axios.delete(`/api/hod/students/${currentBranch}/${year}/${rollNo}`);
      await loadStudents();
    } catch (e) { console.error(e); }
  };

  const studentRows = useMemo(() => students.map((s) => (
    <tr key={s.roll_no} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.roll_no}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{s.contact}</td>
      <td className="px-4 py-3 text-sm">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">@{s.username}</span>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{s.admission_year || 'N/A'}</span>
      </td>
      <td className="px-4 py-3 text-sm text-right space-x-2">
        <Button variant="secondary" onClick={() => editStudent(s)} className="!px-2 hover:text-indigo-600 border-none shadow-none"><PencilSquareIcon className="h-4 w-4"/></Button>
        <Button variant="danger" onClick={() => deleteStudent(s.roll_no)} className="!px-2 border-none shadow-none"><TrashIcon className="h-4 w-4"/></Button>
      </td>
    </tr>
  )), [students]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Directory Management</h1>
          <p className="text-indigo-200 font-medium text-lg">Manage members and students in your department</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
              <UsersIcon className="h-6 w-6"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registered Students</h2>
              <p className="text-sm text-gray-500">View and edit student credentials</p>
            </div>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {YEAR_OPTIONS.map((y) => (
              <button key={y} onClick={() => setYear(y)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${year===y ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{y}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={upsertStudent} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!studentEdit && <Field label="Roll No"><Input value={studentForm.roll_no} onChange={(e)=>setStudentForm(v=>({ ...v, roll_no: e.target.value }))} required placeholder="e.g. S123" /></Field>}
              <Field label="Full Name"><Input value={studentForm.name} onChange={(e)=>setStudentForm(v=>({ ...v, name: e.target.value }))} required placeholder="John Doe" /></Field>
              <Field label="Email Address"><Input type="email" value={studentForm.email} onChange={(e)=>setStudentForm(v=>({ ...v, email: e.target.value }))} placeholder="john@example.com" /></Field>
              <Field label="Contact No"><Input value={studentForm.contact} onChange={(e)=>setStudentForm(v=>({ ...v, contact: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></Field>
              <Field label="Username"><Input value={studentForm.username} onChange={(e)=>setStudentForm(v=>({ ...v, username: e.target.value }))} required placeholder="user123" /></Field>
              <Field label="Admission Year"><Input value={studentForm.admission_year} onChange={(e)=>setStudentForm(v=>({ ...v, admission_year: e.target.value }))} placeholder="e.g. 2023" /></Field>
            </div>
            <div className="pt-2 flex justify-end items-center border-t border-gray-100">
              {studentEdit && <Button type="button" variant="secondary" onClick={() => {setStudentEdit(null); setStudentForm({ roll_no: '', name: '', email: '', contact: '', username: '', admission_year: '' });}} className="mr-3">Cancel</Button>}
              <Button type="submit"><PlusIcon className="h-5 w-5 mr-1.5"/>{studentEdit ? 'Save Changes' : 'Add New Student'}</Button>
            </div>
          </form>

          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full text-left bg-white">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3 text-center">Admission Yr</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentLoading ? (
                  <tr><td className="px-4 py-12 text-center text-sm font-semibold text-gray-500" colSpan={7}>Fetching records...</td></tr>
                ) : studentRows.length ? studentRows : (
                  <tr><td className="px-4 py-12 text-center text-sm font-semibold text-gray-500" colSpan={7}>No students found in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODMembers; 