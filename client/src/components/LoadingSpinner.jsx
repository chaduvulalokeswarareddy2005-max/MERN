import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading TravelEase data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
