import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowRight, Scale } from 'lucide-react';

export default function PackageCard({
  pkg,
  isComparing = false,
  onToggleCompare,
}) {
  const imageSrc =
    pkg.images && pkg.images.length > 0
      ? pkg.images[0]
      : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

  const destinationName =
    pkg.destination?.name || pkg.destinationSnapshot || 'Popular Destination';

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        isComparing ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-100'
      }`}
    >
      {/* Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Duration Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-navy-950/80 backdrop-blur-md text-white shadow-sm">
          <Clock className="w-3 h-3 text-teal-400" />
          <span>
            {pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N
          </span>
        </div>

        {/* Rating & Compare Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(pkg);
              }}
              title={isComparing ? 'Remove from comparison' : 'Compare tour package'}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 text-xs font-bold ${
                isComparing
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-teal-600 shadow-sm'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-sm text-slate-800 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{pkg.averageRating || '4.8'}</span>
            <span className="text-slate-400 font-normal">({pkg.reviewCount || 24})</span>
          </div>
        </div>

        {/* Destination Location tag */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="inline-flex items-center gap-1 text-xs text-teal-300 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{destinationName}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-navy-900 group-hover:text-teal-600 transition-colors line-clamp-1 mb-2">
            {pkg.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {pkg.description}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Per Traveler
            </span>
            <span className="text-lg font-extrabold text-navy-900">
              ₹{Number(pkg.pricePerTraveler || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(pkg)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                  isComparing
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Compare with other packages"
              >
                {isComparing ? 'Comparing' : '+ Compare'}
              </button>
            )}

            <Link
              to={`/packages/${pkg.slug || pkg._id}`}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Details
            </Link>
            <Link
              to={`/packages/${pkg.slug || pkg._id}/book`}
              className="inline-flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
            >
              <span>Book</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
