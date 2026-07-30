import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../dbService';
import { Heart, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [diet, setDiet] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // SECURITY FIX: role is NOT passed to Supabase metadata.
      // The DB trigger hardcodes 'patient' for all new signups.
      // The UI role toggle is kept for UX — stored as 'initial_role'
      // (a non-privileged field) so admins can review and promote doctors.
      await dbService.signUp(email, password, fullName, 'patient', { 
        age: age ? parseInt(age, 10) : null, 
        gender: gender || null, 
        bloodGroup: bloodGroup || null,
        phone: phone || null,
        diet: diet || null,
        address: address || null,
        initial_role: role   // informational only — not used for access control
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-text-main mt-4">Create Account</h2>
          <p className="text-muted-main text-sm">Join the Nirogitanman wellness network</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 rounded-[10px] text-sm border border-red-100 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Kumar"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-text-main">Age</label>
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-text-main">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
            >
              <option value="">Select (Optional)</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-text-main">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-text-main">Diet Preference</label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm"
              >
                <option value="">Select</option>
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your full address..."
              rows={3}
              className="w-full px-4 py-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-text-main">I am registering as a...</label>
            <p className="text-xs text-muted-main -mt-1">Doctors will be reviewed and promoted by an admin after signup.</p>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2.5 px-4 rounded-[10px] font-semibold text-sm border transition-all ${
                  role === 'patient'
                    ? 'border-primary bg-teal-50/50 text-primary'
                    : 'border-border-main hover:bg-gray-50 text-text-main'
                }`}
              >
                Patient / User
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-2.5 px-4 rounded-[10px] font-semibold text-sm border transition-all ${
                  role === 'doctor'
                    ? 'border-primary bg-teal-50/50 text-primary'
                    : 'border-border-main hover:bg-gray-50 text-text-main'
                }`}
              >
                Medical Doctor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-[10px] transition-colors mt-2 text-sm shadow-subtle flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-center text-muted-main mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
