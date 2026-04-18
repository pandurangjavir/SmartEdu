import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  CurrencyRupeeIcon,
  ArrowUpTrayIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const MyFines = () => {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/fines');
      setFines(res.data);
    } catch (error) {
      toast.error('Failed to load fines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptImage) {
      toast.error('Please select an image to upload');
      return;
    }

    try {
      await axios.post(`/api/fines/${selectedFine.fine_id}/pay`, {
        receipt_data: receiptImage
      });
      toast.success('Receipt uploaded successfully. Waiting for admin approval.');
      setShowUploadModal(false);
      setReceiptImage(null);
      setSelectedFine(null);
      fetchFines();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit receipt');
    }
  };

  const calculateTotalDue = () => {
    return fines
      .filter(f => f.status === 'Pending')
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: ExclamationCircleIcon, text: 'Payment Required' };
      case 'Pending Approval':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ClockIcon, text: 'Under Review' };
      case 'Approved':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckBadgeIcon, text: 'Cleared' };
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: ClockIcon, text: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalDue = calculateTotalDue();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-red-500 opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">My Fines</h1>
            <p className="text-gray-300 mt-1">Manage your disciplinary infractions and library dues.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 flex items-center justify-between md:justify-end min-w-[200px]">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Pending</p>
              <p className={`text-2xl font-black ${totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ₹{totalDue.toFixed(2)}
              </p>
            </div>
            <CurrencyRupeeIcon className={`w-8 h-8 ml-4 ${totalDue > 0 ? 'text-red-400/50' : 'text-emerald-400/50'}`} />
          </div>
        </div>
      </div>

      {/* Fines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fines.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
            <p className="text-gray-500 mt-1">You have no active fines or dues.</p>
          </div>
        ) : (
          fines.map(fine => {
            const statusConfig = getStatusConfig(fine.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={fine.fine_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className={`px-5 py-3 border-b border-gray-100 flex justify-between items-center ${fine.status === 'Pending' ? 'bg-red-50/50' : 'bg-gray-50/50'}`}>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {statusConfig.text}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{new Date(fine.issued_date).toLocaleDateString()}</span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4 flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Reason</p>
                    <p className="text-gray-600 text-sm">{fine.reason}</p>
                  </div>
                  
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Fine Amount</p>
                      <p className="text-2xl font-black text-gray-900">₹{fine.amount}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {fine.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedFine(fine);
                          setShowUploadModal(true);
                        }}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-lg hover:shadow-red-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Upload Payment Receipt
                      </button>
                    )}
                    
                    {fine.status === 'Pending Approval' && (
                      <div className="w-full text-center py-2.5 px-4 border border-amber-200 rounded-xl bg-amber-50 text-sm font-medium text-amber-700">
                        Admin is reviewing receipt
                      </div>
                    )}

                    {fine.status === 'Approved' && (
                      <div className="w-full text-center py-2.5 px-4 border border-emerald-200 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700 flex items-center justify-center gap-1">
                        <CheckBadgeIcon className="w-5 h-5" />
                        Cleared & Closed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedFine && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Pay Fine</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setReceiptImage(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <ExclamationCircleIcon className="w-6 h-6 rotate-45" /> {/* Close icon using Exclamation layout */}
              </button>
            </div>
            
            <form onSubmit={handleUploadReceipt} className="p-6">
              <div className="mb-6 bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-800 font-medium mb-1">Payment Instructions</p>
                <p className="text-xs text-red-600 mb-2">Please pay exactly <strong>₹{selectedFine.amount}</strong> to the college Accounts Department via cash or official UPI.</p>
                <p className="text-xs text-red-600">Once paid, upload a clear picture of your physical receipt or a screenshot of your successful UPI transaction below.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Receipt (Max 5MB)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-red-400 hover:bg-red-50/50 transition-colors">
                    <div className="space-y-1 text-center">
                      {receiptImage ? (
                        <div className="relative">
                          <img src={receiptImage} alt="Preview" className="mx-auto h-32 object-contain rounded-lg" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setReceiptImage(null); }}
                            className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 shadow-sm"
                          >
                            <ExclamationCircleIcon className="w-6 h-6 rotate-45" />
                          </button>
                        </div>
                      ) : (
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      
                      {!receiptImage && (
                        <>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowUploadModal(false);
                    setReceiptImage(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!receiptImage}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFines;
