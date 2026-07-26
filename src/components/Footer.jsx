import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-text-main text-white py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white">
            <Heart className="h-6 w-6 text-accent-main fill-accent-main" />
            <span>Nirogitanman</span>
          </div>
          <p className="text-muted-main text-sm max-w-xs text-gray-300">
            A comprehensive, digital-first wellness platform assisting you with online doctor consultations, personalized diet plans, and guided medical insights.
          </p>
        </div>

        {/* Links: Services */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-accent-main">Services</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li><a href="#services" className="hover:text-primary transition-colors">Teleconsultation</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">Personal Diet Planning</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">Medicine Logbooks</a></li>
            <li><a href="#services" className="hover:text-primary transition-colors">Wellness Chatbot</a></li>
          </ul>
        </div>

        {/* Links: Support */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-accent-main">Support</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-accent-main">Contact</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-300">
            <li>Email: support@nirogitanman.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Location: New Delhi, India</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Nirogitanman. All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          Disclaimer: General health information only. Consult a physician for emergencies.
        </p>
      </div>
    </footer>
  );
}
