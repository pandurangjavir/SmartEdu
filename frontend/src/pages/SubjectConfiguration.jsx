import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const ALLOWED_TOTAL_VALUES = [25, 35, 50, 70, 100, 125];

const SubjectConfiguration = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // New subject state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ 
    subject_name: '', 
    subject_code: '', 
    credits: 4, 
    total_marks: 35,
    total_classes: 50,
    description: '' 
  });

  useEffect(() => {
    const load = async () => {
      try {
        const classesRes = await axios.get('/api/classes');
        setClasses(classesRes.data || []);
      } catch {
        setClasses([]);
      } finally {
        setInitializing(false);
      }
    };
    load();
  }, []);

  const loadClassSubjects = async (classId) => {
    if (!classId) {
      setClassSubjects([]);
      return;
    }
    setSubjectsLoading(true);
    try {
      const res = await axios.get(`/api/admin/classes/${classId}/subjects`);
      setClassSubjects(res.data || []);
    } catch (e) {
      setClassSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const addSubject = async () => {
    if (!selectedClassId || !newSubject.subject_name || !newSubject.subject_code) {
      toast.error('Name and Code are required');
      return;
    }
    try {
      await axios.post(`/api/admin/classes/${selectedClassId}/subjects`, newSubject);
      toast.success('Subject added successfully');
      setNewSubject({ subject_name: '', subject_code: '', credits: 4, total_marks: 35, total_classes: 50, description: '' });
      setShowAddForm(false);
      loadClassSubjects(selectedClassId);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to add subject');
    }
  };

  const deleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure? This will delete all marks and attendance for this subject!')) return;
    try {
      await axios.delete(`/api/admin/subjects/${subjectId}`);
      toast.success('Subject deleted');
      loadClassSubjects(selectedClassId);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to delete subject');
    }
  };

  const handleSubjectNameChange = (subjectId, value) => {
    setClassSubjects((prev) =>
      prev.map((s) => (s.subject_id === subjectId ? { ...s, subject_name: value } : s))
    );
  };

  const saveSubjectName = async (subjectId, subjectName) => {
    if (!subjectName) return;
    try {
      await axios.put(`/api/admin/subjects/${subjectId}`, { subject_name: subjectName });
      toast.success('Subject name updated');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update subject');
    }
  };

  const updateTotalsForSubject = async (subjectId, totalMarks, totalClasses) => {
    if (!selectedClassId || !subjectId) return;
    const classId = selectedClassId;
    try {
      if (totalMarks) {
        await axios.put(`/api/admin/classes/${classId}/subjects/${subjectId}/total-marks`, {
          total_marks: totalMarks
        });
      }
      if (totalClasses) {
        await axios.put(`/api/admin/classes/${classId}/subjects/${subjectId}/total-classes`, {
          total_classes: totalClasses
        });
      }
      toast.success('Totals updated for subject');
      setClassSubjects(prev => prev.map(s => 
        s.subject_id === subjectId ? {
          ...s,
          ...(totalMarks ? { total_marks: totalMarks } : {}),
          ...(totalClasses ? { total_classes: totalClasses } : {})
        } : s
      ));
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update totals');
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Subject Configuration</h1>
            <p className="text-primary-100 mt-2">
              Edit subject names and set default marks / total classes per class and subject.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Select Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedClassId(v);
                  loadClassSubjects(v);
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose class</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedClassId && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 flex items-center gap-2"
              >
                {showAddForm ? 'Cancel' : '+ Add Subject'}
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
              <h3 className="font-bold text-gray-800">Add New Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                  placeholder="Subject Name" 
                  className="border p-2 rounded text-sm"
                  value={newSubject.subject_name}
                  onChange={e => setNewSubject({...newSubject, subject_name: e.target.value})}
                />
                <input 
                  placeholder="Subject Code" 
                  className="border p-2 rounded text-sm"
                  value={newSubject.subject_code}
                  onChange={e => setNewSubject({...newSubject, subject_code: e.target.value})}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">Total Marks</label>
                  <select 
                    className="border p-2 rounded text-sm bg-white"
                    value={newSubject.total_marks}
                    onChange={e => setNewSubject({...newSubject, total_marks: parseInt(e.target.value)})}
                  >
                    {ALLOWED_TOTAL_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">Total Classes</label>
                  <select 
                    className="border p-2 rounded text-sm bg-white"
                    value={newSubject.total_classes}
                    onChange={e => setNewSubject({...newSubject, total_classes: parseInt(e.target.value)})}
                  >
                    {ALLOWED_TOTAL_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addSubject}
                    className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-blue-700 w-full"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {subjectsLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading subjects...</div>
          ) : !selectedClassId ? (
            <div className="py-4 text-sm text-gray-500">Select a class to configure subjects.</div>
          ) : classSubjects.length === 0 ? (
            <div className="py-4 text-sm text-gray-500">
              No subjects found for this class. They will appear here once created.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Subject Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-32">Total Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-32">Total Classes</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classSubjects.map((subj) => (
                    <tr key={subj.subject_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subj.subject_code}</td>
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="text"
                          value={subj.subject_name}
                          onChange={(e) =>
                            handleSubjectNameChange(subj.subject_id, e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={subj.total_marks || ''}
                          onChange={(e) =>
                            updateTotalsForSubject(
                              subj.subject_id,
                              Number(e.target.value) || 35,
                              null
                            )
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white font-medium text-slate-700"
                        >
                          {ALLOWED_TOTAL_VALUES.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={subj.total_classes || ''}
                          onChange={(e) =>
                            updateTotalsForSubject(
                              subj.subject_id,
                              null,
                              Number(e.target.value) || 50
                            )
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white font-medium text-slate-700"
                        >
                          {ALLOWED_TOTAL_VALUES.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => saveSubjectName(subj.subject_id, subj.subject_name)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Save Name
                          </button>
                          <button
                            onClick={() => deleteSubject(subj.subject_id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-600 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default SubjectConfiguration;

