import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart, ArrowUpRight, Scale } from 'lucide-react';
import { useDemoUser } from '../context/DemoUserContext';
import { addFavorite, removeFavorite } from '../services/api';
import toast from 'react-hot-toast';

export default function DestinationCard({
  destination,
  isFavorite = false,
  onFavoriteChange,
  isComparing = false,
  onToggleCompare,
}) {
  const { user, isAuthenticated, openLoginModal } = useDemoUser();

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal(() => handleFavoriteToggle(e));
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(null, user.email, destination._id);
        toast.success(`Removed ${destination.name} from favorites`);
      } else {
        await addFavorite(user.email, destination._id);
        toast.success(`Saved ${destination.name} to favorites! ❤️`);
      }
      if (onFavoriteChange) onFavoriteChange(destination._id, !isFavorite);
    } catch {
      toast.error('Unable to update favorite');
    }
  };

  const imageSrc =
    destination.images && destination.images.length > 0
      ? destination.images[0]
      : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        isComparing ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-100'
      }`}
    >
      {/* Image container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-black/20" />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-sm text-navy-900 shadow-sm">
          {destination.category}
        </span>

        {/* Action icons: Favorite & Compare */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(destination);
              }}
              title={isComparing ? 'Remove from comparison' : 'Compare destination'}
              className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 text-xs font-bold ${
                isComparing
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-teal-600 shadow-sm'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleFavoriteToggle}
            title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
            className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 shadow-sm'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Overlay Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-xs text-slate-200 mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span className="truncate">
              {destination.region ? `${destination.region}, ` : ''}
              {destination.country}
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {destination.description}
        </p>

        {/* Key Attributes */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{destination.suggestedDuration || '3-5 Days'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Daily Budget</span>
            <span className="font-bold text-navy-900 text-sm">
              ₹{Number(destination.estimatedDailyBudget || 3000).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Link & Compare Toggle Button */}
        <div className="flex items-center gap-2">
          <Link
            to={`/destinations/${destination.slug || destination._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50/80 hover:bg-teal-600 hover:text-white transition-all duration-200"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(destination)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                isComparing
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Compare with other destinations"
            >
              {isComparing ? 'Comparing' : '+ Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
