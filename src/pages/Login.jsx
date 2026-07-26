import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { dbService } from '../dbService';
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || 'dashboard';

  const handleDemoLogin = async (demoEmail) => {
    setLoading(true);
    setError(null);
    try {
      await dbService.signIn(demoEmail, 'password123');
      navigate(`/${redirectPath}`);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dbService.signIn(email, password);
      navigate(`/${redirectPath}`);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl">
            <Heart className="h-7 w-7 text-accent-main fill-accent-main" />
            <span>Nirogitanman</span>
          </Link>
          <h2 className="text-2xl font-bold text-text-main mt-4">Welcome Back</h2>
          <p className="text-muted-main text-sm">Access your healthcare and wellness logs</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 rounded-[10px] text-sm border border-red-100 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-[10px] transition-colors mt-2 text-sm shadow-subtle flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border-main"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Demo Credentials</span>
          <div className="flex-grow border-t border-border-main"></div>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button 
            onClick={() => handleDemoLogin('patient@nirogitanman.com')}
            className="border border-border-main hover:bg-teal-50 hover:text-primary py-2 px-3 rounded-[10px] font-medium transition-colors"
          >
            Patient Demo
          </button>
          <button 
            onClick={() => handleDemoLogin('paid@nirogitanman.com')}
            className="border border-border-main hover:bg-cyan-50 hover:text-secondary py-2 px-3 rounded-[10px] font-medium transition-colors"
          >
            Paid User Demo
          </button>
          <button 
            onClick={() => handleDemoLogin('doctor@nirogitanman.com')}
            className="border border-border-main hover:bg-indigo-50 hover:text-indigo-700 py-2 px-3 rounded-[10px] font-medium transition-colors"
          >
            Doctor Demo
          </button>
          <button 
            onClick={() => handleDemoLogin('admin@nirogitanman.com')}
            className="border border-border-main hover:bg-amber-50 hover:text-accent-main py-2 px-3 rounded-[10px] font-medium transition-colors"
          >
            Admin Demo
          </button>
        </div>

        <p className="text-sm text-center text-muted-main mt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
