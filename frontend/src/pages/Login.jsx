import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import LoginChatbot from '../components/LoginChatbot';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      };

      const result = await login(loginData);
      if (result.success && result.user) {
        toast.success('Login successful!');
        
        // Redirect based on the actual user role from backend
        const userRole = result.user.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'student') {
          navigate('/student');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Abstract Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10 animate-fade-in-up">
        {/* Glassmorphic Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
          
          <div className="text-center transition-all hover:scale-[1.02] duration-300">
            {/* Logo Icon */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 tracking-tight">
              SmartEdu Portal
            </h2>
            <p className="mt-2 text-xs font-medium text-indigo-300">
              Sign in to secure your session
            </p>
          </div>
          
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 bg-slate-900/50 border border-white/10 placeholder-gray-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-inner"
                  placeholder="Enter your institutional email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-4 py-3 bg-slate-900/50 border border-white/10 placeholder-gray-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm pr-12 shadow-inner"
                  placeholder="Enter your secure password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-2 h-10 w-10 flex items-center justify-center bg-transparent hover:bg-white/5 rounded-lg focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-indigo-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Sign in securely'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer Credit */}
        <p className="text-center text-xs text-indigo-300/50 uppercase tracking-widest font-bold mt-8">
          Secured by SmartEdu AI Core
        </p>

      </div>
      <LoginChatbot />
    </div>
  );
};

export default Login; 