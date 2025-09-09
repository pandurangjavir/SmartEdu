import React from 'react';
import { UserPlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-primary-100 mt-1">Create, edit, and remove users and roles</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center"><UserGroupIcon className="h-5 w-5 mr-2"/> Users</h2>
          <button className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 inline-flex items-center"><UserPlusIcon className="h-4 w-4 mr-1"/> Add User</button>
        </div>
        <div className="p-6 text-sm text-gray-600">Coming soon: user table, search, role assignment, and removal.</div>
      </div>
    </div>
  );
};

export default AdminUsers; 