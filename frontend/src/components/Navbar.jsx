import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();

  const role = (user?.role || 'student').toLowerCase();
  const userName = user?.name || user?.first_name || 'User';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand (Left) */}
          <div className="flex items-center space-x-3 group cursor-pointer transition-all duration-300">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-white/20 rounded-xl mix-blend-overlay"></div>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 drop-shadow-sm">
                SmartEdu
              </span>
              <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest -mt-0.5 hidden sm:block">
                SKN Sinhgad Portal
              </span>
            </div>
          </div>

          {/* User Actions & Logout (Right) */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {user && (
              <>
                <div className="flex items-center">
                  <NotificationCenter />
                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent hidden sm:block mx-1"></div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full py-1 pl-4 pr-1.5 shadow-sm hover:shadow hover:bg-white hover:border-indigo-100 transition-all duration-300 cursor-default">
                    <div className="text-right hidden sm:block mr-3">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
                      {role && role.toLowerCase() !== userName.toLowerCase() && (
                        <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{role}</p>
                      )}
                    </div>
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                      <div className="w-full h-full bg-transparent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={logout} 
                    className="group relative flex items-center justify-center px-4 py-2 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold shadow-sm transition-all duration-200"
                    title="Logout"
                  >
                    <svg className="w-4 h-4 sm:mr-2 text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline-block">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
 