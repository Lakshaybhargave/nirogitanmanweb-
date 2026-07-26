import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../dbService';
import { Menu, X, Heart, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const currentUser = await dbService.getCurrentUser();
      setUser(currentUser);
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    await dbService.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50 border-b border-border-main py-4 px-6 md:px-12 flex items-center justify-between shadow-subtle">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
        <Heart className="h-7 w-7 text-accent-main fill-accent-main" />
        <span>Nirogitanman</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 font-medium text-text-main">
        <a href="/#services" className="hover:text-primary transition-colors">Services</a>
        <a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
        <a href="/#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
        <a href="/#faq" className="hover:text-primary transition-colors">FAQ</a>
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-[10px] font-semibold transition-all shadow-subtle"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="border border-border-main hover:bg-red-50 text-red-600 hover:text-red-700 p-2.5 rounded-[10px] transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-text-main font-semibold hover:text-primary transition-all px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-primary hover:bg-primary-hover text-white py-2.5 px-6 rounded-[10px] font-semibold transition-all shadow-subtle"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-text-main hover:text-primary transition-colors"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-[73px] left-0 w-full bg-white border-b border-border-main p-6 flex flex-col gap-5 shadow-lg md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <a 
            href="/#services" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-text-main hover:text-primary transition-colors"
          >
            Services
          </a>
          <a 
            href="/#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-text-main hover:text-primary transition-colors"
          >
            How It Works
          </a>
          <a 
            href="/#testimonials" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-text-main hover:text-primary transition-colors"
          >
            Testimonials
          </a>
          <a 
            href="/#faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium text-text-main hover:text-primary transition-colors"
          >
            FAQ
          </a>
          <hr className="border-border-main" />
          {user ? (
            <div className="flex flex-col gap-3">
              <Link 
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-[10px] font-semibold text-center"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Go to Dashboard</span>
              </Link>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="border border-red-200 text-red-600 py-3 rounded-[10px] font-semibold hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-semibold text-text-main py-3 border border-border-main rounded-[10px]"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-semibold bg-primary hover:bg-primary-hover text-white py-3 rounded-[10px]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
