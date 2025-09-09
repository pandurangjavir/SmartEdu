import React from 'react';
import { DocumentPlusIcon, FolderIcon } from '@heroicons/react/24/outline';

const TeacherMaterials = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-primary-100 mt-1">Upload and manage notes and resources</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload Material</h2>
          <button className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Upload</button>
        </div>
        <div className="p-6 text-sm text-gray-600">
          Coming soon: drag-and-drop upload, file list with search/tags, and preview.
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center"><FolderIcon className="h-5 w-5 mr-2"/> My Library</h2>
        </div>
        <div className="p-6 text-sm text-gray-600">
          Coming soon: folders, filters, and sharing options.
        </div>
      </div>
    </div>
  );
};

export default TeacherMaterials; 