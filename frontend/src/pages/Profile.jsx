import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact_no: user?.contact_no || '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    const isEmail = (v) => !v || /\S+@\S+\.\S+/.test(v);
    const isContact = (v) => !v || /^\+?[0-9\-\s]{7,15}$/.test(v);
    if (!isEmail(formData.email)) {
      toast.error('Please enter a valid email.');
      setLoading(false);
      return;
    }
    if (!isContact(formData.contact_no)) {
      toast.error('Please enter a valid contact number.');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const updateData = {
        name: formData.name,
        email: formData.email,
        contact_no: formData.contact_no
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(`/api/users/${user.user_id}`, updateData);
      
      if (response.data.success) {
        // Update user context
        await updateProfile(updateData);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        toast.error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center space-x-5 mb-8 pb-8 border-b border-gray-100">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-white">
                {(user?.name || user?.first_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name || user?.first_name}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">
                {user?.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1.5 block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1.5 block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Contact
                </label>
                <input
                  type="tel"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1.5 block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1.5 block w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        contact_no: user?.contact_no || '',
                        password: ''
                      });
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg transition-all"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 