import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  MapPin,
  SlidersHorizontal,
  Scale,
  X,
  ArrowRight,
  ExternalLink,
  CalendarPlus,
  Check
} from 'lucide-react';
import { getDestinations, getFavorites } from '../services/api';
import { useDemoUser } from '../context/DemoUserContext';
import DestinationCard from '../components/DestinationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useDemoUser();

  const [destinations, setDestinations] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'name-asc');
  const [country, setCountry] = useState(searchParams.get('country') || 'All');

  const categories = ['All', 'Hill Station', 'Beaches', 'Cultural', 'Nature', 'Family', 'Adventure'];

  // Load user favorites
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      getFavorites(user.email)
        .then((res) => {
          const ids = new Set(res.data.data?.map((f) => f.destination?._id || f.destination));
          setFavoriteIds(ids);
        })
        .catch((err) => console.error('Error fetching favorites', err));
    } else {
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated, user?.email]);

  // Fetch destinations with filters
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (country && country !== 'All') params.country = country;
      if (sort) params.sort = sort;

      const res = await getDestinations(params);
      setDestinations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching destinations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [category, sort, country]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('name-asc');
    setCountry('All');
    setSearchParams({});
    getDestinations({ sort: 'name-asc' }).then((res) => {
      setDestinations(res.data.data || []);
    });
  };

  const handleFavoriteChange = (destId, isFav) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(destId);
      else next.delete(destId);
      return next;
    });
  };

  // Comparison toggle logic
  const handleToggleCompare = (dest) => {
    const exists = compareList.some((d) => d._id === dest._id);
    if (exists) {
      setCompareList(compareList.filter((d) => d._id !== dest._id));
      toast.success(`Removed ${dest.name} from comparison`);
    } else {
      if (compareList.length >= 3) {
        toast.error('You can compare up to 3 destinations at once');
        return;
      }
      setCompareList([...compareList, dest]);
      toast.success(`Added ${dest.name} to comparison (${compareList.length + 1}/3)`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Explore Destinations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Find Your Perfect Travel Spot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse handpicked holiday destinations across India and abroad. Select any 3 to compare features side-by-side.
          </p>
        </div>

        <button
          onClick={handleClearFilters}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination name, description or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-medium transition"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
          >
            Search
          </button>
        </form>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 ${
                category === cat
                  ? 'bg-navy-900 text-teal-300 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Country Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold">Sort by:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-navy-900 focus:outline-none focus:border-teal-500"
            >
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="budget-asc">Budget: Low to High</option>
              <option value="budget-desc">Budget: High to Low</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-semibold">Country:</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-navy-900 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Countries</option>
              <option value="India">India</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <LoadingSpinner message="Finding destinations..." />
      ) : destinations.length === 0 ? (
        <EmptyState
          title="No destinations match your filters"
          description="Try selecting a different category or resetting your search term."
          actionLabel="Reset Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-4 flex items-center justify-between">
            <span>
              Showing <span className="text-navy-900 font-bold">{destinations.length}</span> destinations
            </span>
            {compareList.length > 0 && (
              <span className="text-teal-700 font-bold">
                {compareList.length} selected for comparison
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                destination={dest}
                isFavorite={favoriteIds.has(dest._id)}
                onFavoriteChange={handleFavoriteChange}
                isComparing={compareList.some((d) => d._id === dest._id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Comparison Drawer */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-navy-950 text-white rounded-2xl p-4 shadow-2xl border border-teal-500/30 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">
                Compare Destinations ({compareList.length}/3)
              </span>
              <div className="flex items-center gap-2 mt-1">
                {compareList.map((d) => (
                  <span
                    key={d._id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-teal-200"
                  >
                    <span>{d.name}</span>
                    <button
                      onClick={() => handleToggleCompare(d)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareList([])}
              className="py-2 px-3 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="py-2 px-4 rounded-xl font-bold text-xs text-navy-950 bg-teal-400 hover:bg-teal-300 shadow-md transition"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Side-by-Side Analysis</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                Destination Comparison
              </h3>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 w-1/4 font-bold text-slate-500 uppercase text-[10px]">
                      Attribute
                    </th>
                    {compareList.map((d) => (
                      <th key={d._id} className="py-3 px-4 font-bold text-navy-900 text-sm">
                        <div className="flex items-center gap-2">
                          <img
                            src={d.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span>{d.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Location */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Location</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4 text-slate-600">
                        {d.region ? `${d.region}, ` : ''}{d.country}
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Category</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700">
                          {d.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Suggested Duration */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Suggested Duration</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4 text-slate-700 font-semibold">
                        {d.suggestedDuration || '3-5 Days'}
                      </td>
                    ))}
                  </tr>

                  {/* Estimated Daily Budget */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Estimated Daily Budget</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4 font-extrabold text-navy-900 text-sm">
                        ₹{Number(d.estimatedDailyBudget || 3000).toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                      </td>
                    ))}
                  </tr>

                  {/* Attractions */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Top Attractions</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4 text-slate-600">
                        {d.attractions && d.attractions.length > 0 ? (
                          <ul className="space-y-1">
                            {d.attractions.slice(0, 4).map((att, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                <span>{att}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'Local scenic spots'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Best Time to Visit */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Best Time to Visit</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-3 px-4 text-slate-600">
                        {d.bestTimeToVisit || 'Year-round'}
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="py-4 px-4 bg-slate-50 font-bold text-slate-700">Actions</td>
                    {compareList.map((d) => (
                      <td key={d._id} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/destinations/${d.slug || d._id}`}
                            className="py-2 px-3 text-center rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
                          >
                            Explore Destination
                          </Link>
                          <Link
                            to={`/my-trips/new?destinationId=${d._id}`}
                            className="py-1.5 px-3 text-center rounded-xl font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
                          >
                            Plan a Trip
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
