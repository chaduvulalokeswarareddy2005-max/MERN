import React, { useState } from 'react';
import { useDemoUser } from '../context/DemoUserContext';
import { X, Mail, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DemoLoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, user } = useDemoUser();
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    login(email, name);
    toast.success(`Welcome, ${name || email.split('@')[0]}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white text-center relative">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Demo Traveler Login</h3>
          <p className="text-teal-100 text-xs mt-1">
            Instant presentation access — no password or OTP required!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address <span className="text-teal-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. traveler@travelease.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Display Name (Optional)
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Alex Wanderer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
            >
              Continue to TravelEase
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 pt-1">
            Demonstration Mode: Session is saved to browser storage.
          </p>
        </form>
      </div>
    </div>
  );
}
