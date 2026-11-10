import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-4xl sm:text-6xl font-black text-navy-900 tracking-tight">404</span>
          <h2 className="text-xl font-bold text-navy-900">Destination Off The Map</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page you're searching for doesn't exist or has traveled to another coordinate.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
