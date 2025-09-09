import React, { useEffect, useState } from 'react';
import { UserGroupIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [year, setYear] = useState('SY');
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [marksRows, setMarksRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [feesRows, setFeesRows] = useState([]);
  const [semester, setSemester] = useState('');

  const branch = 'cse'; // current implementation supports CSE branch
  const getRollNo = (r) => r.roll_no || r.student_roll_no || r.student_id || r.sid || r.id || '-';
  const groupBySemester = (rows) => {
    const groups = {};
    rows.forEach((r) => {
      const key = r.semester || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`/api/teachers/classes/${branch}/${year}`);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSubjects(list);
        if (list.length && !subject) setSubject(list[0]?.subject || '');
      } catch {}
    };
    fetchSubjects();
  }, [year]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subject) return;
      setLoading(true);
      try {
        const [marksRes, attRes, feesRes] = await Promise.all([
          axios.get(`/api/teachers/marks/${branch}/${year}/${encodeURIComponent(subject)}${semester ? `?semester=${encodeURIComponent(semester)}` : ''}`),
          axios.get(`/api/teachers/attendance/${branch}/${year}/${encodeURIComponent(subject)}${semester ? `?semester=${encodeURIComponent(semester)}` : ''}`),
          axios.get(`/api/teachers/fees/${branch}/${year}${semester ? `?semester=${encodeURIComponent(semester)}` : ''}`)
        ]);
        setMarksRows(Array.isArray(marksRes?.data) ? marksRes.data : []);
        setAttendanceRows(Array.isArray(attRes?.data) ? attRes.data : []);
        setFeesRows(Array.isArray(feesRes?.data) ? feesRes.data : []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [year, subject, semester]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Manage Attendance</h1>
        <p className="text-primary-100 mt-1">Mark, review, and edit class attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-semibold">—</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-semibold">—</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Late/Excused</p>
              <p className="text-2xl font-semibold">—</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Class/Subject Selector</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="SY">SY</option>
              <option value="TY">TY</option>
              <option value="BE">BE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="Sem 1">Sem 1</option>
              <option value="Sem 2">Sem 2</option>
              <option value="Sem 3">Sem 3</option>
              <option value="Sem 4">Sem 4</option>
              <option value="Sem 5">Sem 5</option>
              <option value="Sem 6">Sem 6</option>
              <option value="Sem 7">Sem 7</option>
              <option value="Sem 8">Sem 8</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              {subjects.map((s) => (
                <option key={s.subject} value={s.subject}>{s.subject}</option>
              ))}
              {subjects.length === 0 && <option value="">No subjects found</option>}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Marks - {subject || '—'} ({year})</h2>
          {loading && <span className="text-xs text-gray-500">Loading…</span>}
        </div>
        <div className="p-6 space-y-8">
          {Object.keys(groupBySemester(marksRows)).length === 0 ? (
            <div className="text-sm text-gray-500">No data</div>
          ) : (
            Object.entries(groupBySemester(marksRows)).map(([sem, rows]) => (
              <div key={`marks-${sem}`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{sem}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((r) => (
                        <tr key={`m-${r.id}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{r.roll_no || r.student_roll_no || r.student_id || r.sid || '-'}</td>
                          <td className="px-4 py-2 text-sm">{r.academic_year}</td>
                          <td className="px-4 py-2 text-sm">{r.subject1 === subject ? r.subject1_marks : r.subject2 === subject ? r.subject2_marks : r.subject3 === subject ? r.subject3_marks : r.subject4 === subject ? r.subject4_marks : r.subject5 === subject ? r.subject5_marks : '-'}</td>
                          <td className="px-4 py-2 text-sm">{r.total_marks}</td>
                          <td className="px-4 py-2 text-sm">{r.total_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendance - {subject || '—'} ({year})</h2>
          {loading && <span className="text-xs text-gray-500">Loading…</span>}
        </div>
        <div className="p-6 space-y-8">
          {Object.keys(groupBySemester(attendanceRows)).length === 0 ? (
            <div className="text-sm text-gray-500">No data</div>
          ) : (
            Object.entries(groupBySemester(attendanceRows)).map(([sem, rows]) => (
              <div key={`att-${sem}`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{sem}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present/Classes</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((r) => (
                        <tr key={`a-${r.id}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{getRollNo(r)}</td>
                          <td className="px-4 py-2 text-sm">{r.academic_year}</td>
                          <td className="px-4 py-2 text-sm">{r.total_present}/{r.total_classes}</td>
                          <td className="px-4 py-2 text-sm">{r.total_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Fees - ({year}) {semester && `| ${semester}`}</h2>
          {loading && <span className="text-xs text-gray-500">Loading…</span>}
        </div>
        <div className="p-6 space-y-8">
          {Object.keys(groupBySemester(feesRows)).length === 0 ? (
            <div className="text-sm text-gray-500">No data</div>
          ) : (
            Object.entries(groupBySemester(feesRows)).map(([sem, rows]) => (
              <div key={`fees-${sem}`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{sem}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((r) => (
                        <tr key={`f-${r.id}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{getRollNo(r)}</td>
                          <td className="px-4 py-2 text-sm">{r.academic_year}</td>
                          <td className="px-4 py-2 text-sm">₹{Number(r.total_fees || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">₹{Number(r.paid_fees || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">₹{Number(r.remaining_fees || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance; 