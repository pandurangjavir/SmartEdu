import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';

const HODMembers = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Department Members</h1>
        <p className="text-primary-100 mt-1">Manage teachers and students</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center"><UsersIcon className="h-5 w-5 mr-2"/> Directory</h2>
        </div>
        <div className="p-6 text-sm text-gray-600">Coming soon: list, filters, bulk import, and role changes.</div>
      </div>
    </div>
  );
};

export default HODMembers; 