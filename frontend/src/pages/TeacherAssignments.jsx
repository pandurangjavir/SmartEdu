import React from 'react';
import { ClipboardDocumentListIcon, CalendarIcon } from '@heroicons/react/24/outline';

const TeacherAssignments = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Assignments & Quizzes</h1>
        <p className="text-primary-100 mt-1">Create, publish, and evaluate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center"><ClipboardDocumentListIcon className="h-5 w-5 mr-2"/> New Assignment</h2>
          </div>
          <div className="p-6 text-sm text-gray-600">Coming soon: assignment builder, attachments, grading rubric.</div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center"><CalendarIcon className="h-5 w-5 mr-2"/> Schedule Quiz</h2>
          </div>
          <div className="p-6 text-sm text-gray-600">Coming soon: quiz generator, schedule, time limits.</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments; 