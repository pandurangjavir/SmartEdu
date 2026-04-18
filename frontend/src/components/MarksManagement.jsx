import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  AcademicCapIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import EducationalAPI from '../services/api';

const MarksManagement = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [editForm, setEditForm] = useState({
    obtained_marks: '',
    total_marks: 100
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMarkForm, setNewMarkForm] = useState({
    student_id: '',
    subject_id: '',
    obtained_marks: '',
    total_marks: 100
  });

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const response = await EducationalAPI.getStudentMarks(user?.user_id || 1);
      if (response.success) {
        setMarks(response.data);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to fetch marks');
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateMarks = (obtainedMarks, totalMarks) => {
    const errors = [];
    
    if (obtainedMarks < 0) {
      errors.push('Marks cannot be negative');
    }
    
    
    if (obtainedMarks > totalMarks) {
      errors.push(`Marks cannot exceed total marks (${totalMarks})`);
    }
    
    return errors;
  };

  const calculateGrade = (obtainedMarks, totalMarks) => {
    const percentage = (obtainedMarks / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const handleEditMark = (mark) => {
    setEditingMark(mark);
    setEditForm({
      obtained_marks: mark.obtained_marks,
      total_marks: mark.total_marks
    });
  };

  const handleSaveEdit = async () => {
    const errors = validateMarks(parseInt(editForm.obtained_marks), parseInt(editForm.total_marks));
    
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    try {
      const response = await EducationalAPI.updateStudentMarks(
        editingMark.student_id,
        editingMark.mark_id,
        {
          obtained_marks: parseInt(editForm.obtained_marks),
          total_marks: parseInt(editForm.total_marks)
        }
      );

      if (response.success) {
        toast.success('Marks updated successfully');
        setEditingMark(null);
        setEditForm({ obtained_marks: '', total_marks: 35 });
        fetchMarks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to update marks');
      console.error('Error updating marks:', error);
    }
  };

  const handleAddMark = async () => {
    const errors = validateMarks(parseInt(newMarkForm.obtained_marks), parseInt(newMarkForm.total_marks));
    
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    try {
      const response = await EducationalAPI.addStudentMarks(
        parseInt(newMarkForm.student_id),
        {
          subject_id: parseInt(newMarkForm.subject_id),
          obtained_marks: parseInt(newMarkForm.obtained_marks),
          total_marks: parseInt(newMarkForm.total_marks)
        }
      );

      if (response.success) {
        toast.success('Marks added successfully');
        setNewMarkForm({
          student_id: '',
          subject_id: '',
          obtained_marks: '',
          total_marks: 100
        });
        setShowAddForm(false);
        fetchMarks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to add marks');
      console.error('Error adding marks:', error);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
      {/* Header section with gradient and glow */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl border border-white/10 mb-8 p-6 md:p-8 flex items-center justify-between bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[60px] mix-blend-screen"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] mix-blend-screen"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
            Marks Management Console
          </h2>
          <p className="text-indigo-200/80 font-medium text-sm md:text-base leading-relaxed">
            Manage subject-wise evaluations securely and accurately
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="relative z-10 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5"
          >
            + Add New Evaluation
          </button>
        )}
      </div>

      {/* Minimum Marks Warning */}
      <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4 shadow-sm animate-fade-in-up">
        <div className="flex items-center">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg mr-3 shadow-sm">
            <ExclamationTriangleIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest">Academic Integrity Policy</h3>
            <p className="text-sm text-amber-700/80 mt-0.5 font-medium">
              Obtained marks should not exceed the total marks allocated for each evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Add Marks Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Marks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="number"
                value={newMarkForm.student_id}
                onChange={(e) => setNewMarkForm({ ...newMarkForm, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter student ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
              <input
                type="number"
                value={newMarkForm.subject_id}
                onChange={(e) => setNewMarkForm({ ...newMarkForm, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter subject ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obtained Marks</label>
              <input
                type="number"
                min="0"
                value={newMarkForm.obtained_marks}
                onChange={(e) => setNewMarkForm({ ...newMarkForm, obtained_marks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter obtained marks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={newMarkForm.total_marks}
                onChange={(e) => setNewMarkForm({ ...newMarkForm, total_marks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter total marks"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMark}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Marks
            </button>
          </div>
        </div>
      )}

      {/* Marks Table */}
      {marks.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/60">
              <thead className="bg-slate-50/80 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Ref</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Module</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Limit</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Controls</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80 bg-transparent">
                {marks.map((mark) => (
                  <tr key={mark.mark_id} className="hover:bg-indigo-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">STU-{mark.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {mark.subject_name || `Module ${mark.subject_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingMark?.mark_id === mark.mark_id ? (
                        <input
                          type="number"
                          min="0"
                          max={mark.total_marks}
                          value={editForm.obtained_marks}
                          onChange={(e) => setEditForm({ ...editForm, obtained_marks: e.target.value })}
                          className="w-20 px-2 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 bg-white shadow-inner"
                        />
                      ) : (
                        <span className={`text-sm font-black px-3 py-1.5 rounded-md ${mark.obtained_marks > (mark.total_marks || 35) ? 'text-rose-700 bg-rose-100 border border-rose-200' : 'text-slate-800 bg-slate-100'}`}>
                          {mark.obtained_marks}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingMark?.mark_id === mark.mark_id ? (
                        <input
                          type="number"
                          value={editForm.total_marks}
                          onChange={(e) => setEditForm({ ...editForm, total_marks: e.target.value })}
                          className="w-16 px-2 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-center text-slate-500 bg-white shadow-inner"
                          disabled
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">{mark.total_marks}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                      {mark.exam_date ? new Date(mark.exam_date).toLocaleDateString() : 'Pending'}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingMark?.mark_id === mark.mark_id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 rounded-lg transition-all"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingMark(null)}
                              className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition-all"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditMark(mark)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {marks.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <AcademicCapIcon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic Vault Empty</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Begin logging evaluations to populate the analytics dashboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarksManagement;
