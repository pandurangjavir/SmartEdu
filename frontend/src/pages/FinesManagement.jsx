import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  CurrencyRupeeIcon,
  CheckBadgeIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';

const FinesManagement = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [studentQuery, setStudentQuery] = useState('');

  // New fine form state
  const [newFine, setNewFine] = useState({
    student_id: '',
    reason: '',
    amount: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [finesRes, studentsRes] = await Promise.all([
        axios.get('/api/fines'),
        axios.get('/api/students')
      ]);
      setFines(finesRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      toast.error('Failed to load fines data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueFine = async (e) => {
    e.preventDefault();
    try {
      if (!newFine.student_id || !newFine.reason || !newFine.amount) {
        toast.error('Please fill in all fields');
        return;
      }
      
      await axios.post('/api/fines', newFine);
      toast.success('Fine issued successfully');
      setShowIssueModal(false);
      setNewFine({ student_id: '', reason: '', amount: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to issue fine');
    }
  };

  const handleApproveFine = async (fineId) => {
    try {
      await axios.post(`/api/fines/${fineId}/approve`);
      toast.success('Fine payment approved');
      setShowReceiptModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve fine');
    }
  };

  const handleDeleteFine = async (fineId) => {
    if (window.confirm('Are you sure you want to delete this fine record?')) {
      try {
        await axios.delete(`/api/fines/${fineId}`);
        toast.success('Fine deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete fine');
      }
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-red-50 text-red-700 border-red-200',
      'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200',
      'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const style = styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${style}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Derive unique classes from students for the filter dropdown
  const uniqueClasses = [...new Set(students.map(s => s.class_name).filter(Boolean))].sort();

  // Filter fines based on selected class
  const filteredFines = classFilter 
    ? fines.filter(f => f.class_name === classFilter)
    : fines;

  const filteredStudents = studentQuery === '' 
    ? students 
    : students.filter((s) => 
        (s.name || '').toLowerCase().includes(studentQuery.toLowerCase()) ||
        (s.roll_no || '').toLowerCase().includes(studentQuery.toLowerCase()) ||
        (s.class_name || '').toLowerCase().includes(studentQuery.toLowerCase())
      );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fines Management</h1>
            <p className="text-red-100 mt-1 opacity-90">Issue fines and approve payments.</p>
          </div>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Issue New Fine
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Class:</label>
          <select 
            value={classFilter} 
            onChange={(e) => setClassFilter(e.target.value)}
            className="border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 text-sm py-2"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{filteredFines.length}</span> fine(s)
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No fines found.
                  </td>
                </tr>
              ) : (
                filteredFines.map(fine => (
                  <tr key={fine.fine_id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{fine.student_name}</div>
                      <div className="text-xs text-gray-500">{fine.student_roll}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {fine.class_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {fine.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">₹{fine.amount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(fine.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fine.issued_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {fine.receipt_data && fine.status === 'Pending Approval' && (
                          <button 
                            onClick={() => {
                              setSelectedReceipt(fine);
                              setShowReceiptModal(true);
                            }}
                            className="text-amber-600 hover:text-amber-900"
                            title="Verify Receipt"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        )}
                        {fine.receipt_data && fine.status === 'Approved' && (
                          <button 
                            onClick={() => {
                              setSelectedReceipt(fine);
                              setShowReceiptModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Receipt"
                          >
                            <EyeIcon className="h-5 w-5 fill-current" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteFine(fine.fine_id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Fine"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Issue New Fine</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleIssueFine} className="p-6 space-y-4">
              <div className="relative z-20">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <Combobox value={newFine.student_id} onChange={(val) => setNewFine({...newFine, student_id: val})}>
                  <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-gray-50 text-left border border-gray-200 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 sm:text-sm">
                      <Combobox.Input
                        className="w-full border-none py-2.5 pr-10 pl-3 text-sm leading-5 text-gray-900 focus:ring-0 bg-transparent outline-none"
                        displayValue={(studentId) => {
                          if (!studentId) return "";
                          const s = students.find((st) => st.student_id === studentId);
                          return s ? `${s.roll_no} - ${s.name || `Student ${s.student_id}`} ${s.class_name ? `(${s.class_name})` : ''}` : "";
                        }}
                        onChange={(event) => setStudentQuery(event.target.value)}
                        placeholder="Search student by name, roll no, or class..."
                        required={!newFine.student_id}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                      {filteredStudents.length === 0 && studentQuery !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredStudents.map((s) => (
                          <Combobox.Option
                            key={s.student_id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-red-600 text-white' : 'text-gray-900'
                              }`
                            }
                            value={s.student_id}
                          >
                            {({ selected, active }) => (
                              <div className="flex items-center">
                                {selected && (
                                  <span className={`flex items-center mr-2 ${active ? 'text-white' : 'text-red-500'}`}>
                                    <CheckBadgeIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {s.roll_no} - {s.name || `Student ${s.student_id}`} {s.class_name ? `(${s.class_name})` : ''}
                                </span>
                              </div>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for fine</label>
                <input 
                  type="text" 
                  value={newFine.reason}
                  onChange={(e) => setNewFine({...newFine, reason: e.target.value})}
                  className="w-full border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50"
                  placeholder="e.g. Absent without permission, Library overdue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newFine.amount}
                  onChange={(e) => setNewFine({...newFine, amount: e.target.value})}
                  className="w-full border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50"
                  placeholder="e.g. 500"
                  min="1"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  Issue Fine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Verification Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Verify Payment Receipt</h3>
              <button 
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-bold text-gray-900">{selectedReceipt.student_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Fine Amount</p>
                  <p className="font-bold text-gray-900">₹{selectedReceipt.amount}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2 mb-6 flex justify-center">
                <img 
                  src={selectedReceipt.receipt_data} 
                  alt="Payment Receipt" 
                  className="max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null; 
                    // Use a stable dummy image data URL or simpler fallback
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18a0b0d3e23%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18a0b0d3e23%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22100.828125%22%20y%3D%22159.6%22%3EInvalid%20Image%20Data%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>

              {selectedReceipt.status === 'Pending Approval' && (
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => {
                      setShowReceiptModal(false);
                      setSelectedReceipt(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleApproveFine(selectedReceipt.fine_id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center"
                  >
                    <CheckBadgeIcon className="w-5 h-5 mr-1" />
                    Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinesManagement;
