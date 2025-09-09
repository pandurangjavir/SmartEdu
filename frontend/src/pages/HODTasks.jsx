import React from 'react';
import { MegaphoneIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const HODTasks = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Tasks & Notices</h1>
        <p className="text-primary-100 mt-1">Assign department tasks and publish notices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center"><ClipboardDocumentListIcon className="h-5 w-5 mr-2"/> Assign Task</h2>
          </div>
          <div className="p-6 text-sm text-gray-600">Coming soon: task creation with assignees and due dates.</div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center"><MegaphoneIcon className="h-5 w-5 mr-2"/> Publish Notice</h2>
          </div>
          <div className="p-6 text-sm text-gray-600">Coming soon: notice editor with categories and approvals.</div>
        </div>
      </div>
    </div>
  );
};

export default HODTasks; 