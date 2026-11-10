import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mountain,
  Palmtree,
  Compass,
  Landmark,
  Trees,
  Users
} from 'lucide-react';
import { getFeaturedDestinations, getPackages } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [destRes, pkgRes] = await Promise.all([
          getFeaturedDestinations(),
          getPackages({ limit: 6 }),
        ]);
        setDestinations(destRes.data.data || []);
        setPackages(pkgRes.data.data?.slice(0, 6) || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/destinations');
    }
  };

  const categories = [
    { name: 'Hill Station', icon: Mountain, count: 'Ooty, Manali, Kashmir', color: 'from-blue-500 to-indigo-600' },
    { name: 'Beaches', icon: Palmtree, count: 'Goa, Bali', color: 'from-teal-400 to-emerald-600' },
    { name: 'Cultural', icon: Landmark, count: 'Jaipur Heritage', color: 'from-amber-400 to-orange-500' },
    { name: 'Nature', icon: Trees, count: 'Kerala Backwaters', color: 'from-emerald-500 to-green-700' },
    { name: 'Family', icon: Users, count: 'Singapore Wonders', color: 'from-purple-500 to-pink-600' },
    { name: 'Adventure', icon: Compass, count: 'Solang & Parvati', color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85"
            alt="Scenic Landscape"
            className="w-full h-full object-cover object-center scale-105 animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/70 to-navy-900/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MERN Stack Travel & Tour Planning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
            Discover the World, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">
              Your Way.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal">
            Personalize your dream itineraries, explore top holiday destinations like Ooty, Manali, Goa & Bali, and confirm bookings seamlessly.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-white/40 flex flex-col sm:flex-row gap-2.5"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
              <Search className="w-5 h-5 text-teal-600 shrink-0" />
              <input
                type="text"
                placeholder="Where to next? Try 'Ooty', 'Goa', 'Manali'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-navy-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Search Tours</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick CTA Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
            <span>Popular quick searches:</span>
            {['Ooty', 'Manali', 'Goa', 'Kerala', 'Bali'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/destinations?search=${tag}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Handpicked Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Popular Holiday Escapes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From misty Nilgiri hills to sun-kissed Goan shores and exotic Bali temples.
            </p>
          </div>
          <Link
            to="/destinations"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            <span>Explore all destinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading popular destinations..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* TRAVEL CATEGORIES */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Browse by Vibe
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
              Curated Travel Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your travel mood to discover the best suited retreats and getaways.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => navigate(`/destinations?category=${encodeURIComponent(cat.name)}`)}
                  className="group flex flex-col items-center p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-500 transition-all text-center"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED TOUR PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All-Inclusive Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Featured Tour Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Carefully crafted itineraries with verified stays, transfers, and sightseeing.
            </p>
          </div>
          <Link
            to="/packages"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
          >
            <span>View all tour packages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading tour packages..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE TRAVELEASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Why TravelEase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
              Effortless Tour Planning Made For You
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Experience transparent booking, interactive day-by-day itineraries, and real database persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Curated Itineraries</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Handcrafted multi-day tour packages with full schedules, meals, and deluxe stays.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Personal Trip Planner</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add daily activities, budget trackers, and notes tailored to your travel squad.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Instant Demo Bookings</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero hassle reservations with instant confirmation codes and live capacity validation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Full MERN Integration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connected end-to-end to Express & MongoDB with live admin management tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 rounded-3xl bg-teal-50 border border-teal-100 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-md shadow-teal-600/20">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mb-2">
            Ready to Plan Your Next Adventure?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mb-6 leading-relaxed">
            Create your custom trip itinerary or reserve your favorite tour package today with instant confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/my-trips/new"
              className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition"
            >
              Start Planning Trip
            </Link>
            <Link
              to="/packages"
              className="py-3 px-6 rounded-xl text-xs font-bold text-navy-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition"
            >
              Browse Tour Packages
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
