import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const TeacherPerformance = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Student Performance</h1>
        <p className="text-primary-100 mt-1">Monitor class and individual progress</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center"><ChartBarIcon className="h-5 w-5 mr-2"/> Analytics</h2>
        </div>
        <div className="p-6 text-sm text-gray-600">Coming soon: charts for scores, attendance, and chatbot interactions.</div>
      </div>
    </div>
  );
};

export default TeacherPerformance; 