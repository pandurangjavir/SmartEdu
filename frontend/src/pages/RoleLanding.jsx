import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const roles = [
  {
    name: 'Admin',
    description: 'Manage users, departments, courses, and system settings',
    icon: ShieldCheckIcon,
    color: 'from-indigo-500 to-indigo-600',
    link: '/register/admin'
  },
  {
    name: 'HOD',
    description: 'Oversee department, approve reports, and review analytics',
    icon: BriefcaseIcon,
    color: 'from-purple-500 to-purple-600',
    link: '/register/hod'
  },
  {
    name: 'Teacher',
    description: 'Manage classes, attendance, materials, and assessments',
    icon: UserGroupIcon,
    color: 'from-green-500 to-green-600',
    link: '/register/teacher'
  },
  {
    name: 'Student',
    description: 'Access courses, materials, assignments, and results',
    icon: AcademicCapIcon,
    color: 'from-blue-500 to-blue-600',
    link: '/register/student'
  }
];

const RoleLanding = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to SmartEdu AI</h1>
          <p className="text-gray-600 mt-2">Choose your role to continue</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Link
              key={role.name}
              to={role.link}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} text-white flex items-center justify-center mb-4 transition-base`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Register as {role.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{role.description}</p>
                <div className="mt-4 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">Continue →</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-500">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RoleLanding; 