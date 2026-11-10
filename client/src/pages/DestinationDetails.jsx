import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Heart,
  CalendarPlus,
  Compass,
  CheckCircle,
  Lightbulb,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { getDestination, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { useDemoUser } from '../context/DemoUserContext';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function DestinationDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useDemoUser();

  const [destination, setDestination] = useState(null);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getDestination(slug);
        const dest = res.data.data;
        setDestination(dest);
        setRelatedPackages(res.data.relatedPackages || []);

        if (isAuthenticated && user?.email && dest?._id) {
          const favRes = await getFavorites(user.email);
          const hasFav = favRes.data.data?.some(
            (f) => (f.destination?._id || f.destination) === dest._id
          );
          setIsFavorite(!!hasFav);
        }
      } catch (err) {
        console.error('Failed to load destination details', err);
        toast.error('Destination not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, isAuthenticated, user?.email]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      openLoginModal(() => handleFavoriteToggle());
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(null, user.email, destination._id);
        setIsFavorite(false);
        toast.success(`Removed ${destination.name} from favorites`);
      } else {
        await addFavorite(user.email, destination._id);
        setIsFavorite(true);
        toast.success(`Added ${destination.name} to favorites! ❤️`);
      }
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const scrollToPackages = () => {
    const el = document.getElementById('related-packages-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner message="Loading destination details..." />;
  }

  if (!destination) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Destination Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested destination does not exist or has been removed.</p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Destinations
        </Link>
      </div>
    );
  }

  const images = destination.images && destination.images.length > 0
    ? destination.images
    : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="space-y-12 pb-20">
      {/* Top Breadcrumb & Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Link to="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link to="/destinations" className="hover:text-teal-600">Destinations</Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">{destination.name}</span>
        </div>

        {/* Hero Gallery Card */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl h-[400px] sm:h-[480px]">
          <img
            src={images[selectedImage]}
            alt={destination.name}
            className="w-full h-full object-cover animate-fadeIn"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-black/30" />

          {/* Top Floating Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-navy-900 shadow-md">
              {destination.category}
            </span>

            <button
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Hero Bottom Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-teal-300 font-medium mb-1">
                <MapPin className="w-4 h-4" />
                <span>{destination.region ? `${destination.region}, ` : ''}{destination.country}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {destination.name}
              </h1>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate(`/my-trips/new?destinationId=${destination._id}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/30 transition"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Plan a Trip</span>
              </button>

              <button
                onClick={scrollToPackages}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-navy-900 bg-white/95 hover:bg-white transition"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Explore Packages ({relatedPackages.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                  selectedImage === idx ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Overview & Fast Facts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column (2 Cols): Description, Attractions, Tips */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              About {destination.name}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {destination.description}
            </p>
          </div>

          {/* Popular Attractions */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Must-Visit Attractions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.attractions.map((spot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="text-xs font-semibold text-navy-900">{spot}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {destination.travelTips && destination.travelTips.length > 0 && (
            <div className="bg-amber-50/60 rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-sm">
              <h2 className="text-xl font-bold text-amber-950 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Insider Travel Tips
              </h2>
              <ul className="space-y-3">
                {destination.travelTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-amber-900 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar: Key Travel Details Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-navy-900 mb-5 border-b border-slate-100 pb-3">
              Destination At A Glance
            </h3>

            <div className="space-y-5 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Best Time to Visit</span>
                  <span className="font-bold text-navy-900 text-sm">
                    {destination.bestTimeToVisit || 'October to May'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Ideal Duration</span>
                  <span className="font-bold text-navy-900 text-sm">
                    {destination.suggestedDuration || '3-5 Days'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Estimated Daily Budget</span>
                  <span className="font-extrabold text-navy-900 text-sm">
                    ₹{Number(destination.estimatedDailyBudget || 3000).toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={() => navigate(`/my-trips/new?destinationId=${destination._id}`)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md transition"
              >
                Plan a Custom Trip
              </button>
              <button
                onClick={handleFavoriteToggle}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RELATED TOUR PACKAGES */}
      <section id="related-packages-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="border-t border-slate-200 pt-10">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Curated Holidays
            </span>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight mt-1">
              Tour Packages for {destination.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {relatedPackages.length > 0
                ? `Choose from ${relatedPackages.length} package(s) featuring this destination.`
                : 'No packaged tours currently configured for this destination.'}
            </p>
          </div>

          {relatedPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPackages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center max-w-md mx-auto">
              <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-4">You can still plan a personalized custom trip for this destination!</p>
              <button
                onClick={() => navigate(`/my-trips/new?destinationId=${destination._id}`)}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700"
              >
                Create Custom Trip
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
