import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Package,
  SlidersHorizontal,
  MapPin,
  Scale,
  X,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { getPackages, getDestinations } from '../services/api';
import PackageCard from '../components/PackageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [duration, setDuration] = useState(searchParams.get('duration') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'price-asc');

  const categories = ['All', 'Hill Station', 'Beaches', 'Cultural', 'Nature', 'Family', 'Adventure'];

  useEffect(() => {
    getDestinations().then((res) => {
      setDestinations(res.data.data || []);
    });
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (destination && destination !== 'All') params.destination = destination;
      if (category && category !== 'All') params.category = category;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      if (duration === 'short') {
        params.maxDays = 4;
      } else if (duration === 'medium') {
        params.minDays = 5;
        params.maxDays = 6;
      } else if (duration === 'long') {
        params.minDays = 7;
      }

      const res = await getPackages(params);
      setPackages(res.data.data || []);
    } catch (err) {
      console.error('Error fetching packages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [destination, category, sort, duration, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPackages();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDestination('All');
    setCategory('All');
    setMaxPrice('');
    setDuration('All');
    setSort('price-asc');
    setSearchParams({});
    getPackages({ sort: 'price-asc' }).then((res) => {
      setPackages(res.data.data || []);
    });
  };

  // Compare toggle
  const handleToggleCompare = (pkg) => {
    const exists = compareList.some((p) => p._id === pkg._id);
    if (exists) {
      setCompareList(compareList.filter((p) => p._id !== pkg._id));
      toast.success(`Removed "${pkg.title}" from comparison`);
    } else {
      if (compareList.length >= 3) {
        toast.error('You can compare up to 3 tour packages at once');
        return;
      }
      setCompareList([...compareList, pkg]);
      toast.success(`Added "${pkg.title}" to comparison (${compareList.length + 1}/3)`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Tour Packages</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Curated Holiday Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All-inclusive vacations with verified accommodations. Select any 3 packages to compare prices, inclusions, and itineraries side-by-side.
          </p>
        </div>

        <button
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages by title or inclusions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs sm:text-sm font-medium transition"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
          >
            Search Packages
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
          
          {/* Destination dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-navy-900 focus:border-teal-500"
            >
              <option value="All">All Destinations</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-navy-900 focus:border-teal-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Duration dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-navy-900 focus:border-teal-500"
            >
              <option value="All">Any Duration</option>
              <option value="short">1 - 4 Days (Short)</option>
              <option value="medium">5 - 6 Days (Standard)</option>
              <option value="long">7+ Days (Extended)</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Max Budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-navy-900 focus:border-teal-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
              <option value="duration-asc">Duration: Shortest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Count & Grid */}
      {loading ? (
        <LoadingSpinner message="Searching tour packages..." />
      ) : packages.length === 0 ? (
        <EmptyState
          title="No packages found"
          description="Try loosening your filters or resetting max budget."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-4 flex items-center justify-between">
            <span>
              Showing <span className="text-navy-900 font-bold">{packages.length}</span> curated tour packages
            </span>
            {compareList.length > 0 && (
              <span className="text-teal-700 font-bold">
                {compareList.length} package(s) selected for comparison
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                isComparing={compareList.some((p) => p._id === pkg._id)}
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
                Compare Packages ({compareList.length}/3)
              </span>
              <div className="flex items-center gap-2 mt-1">
                {compareList.map((p) => (
                  <span
                    key={p._id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-teal-200"
                  >
                    <span className="truncate max-w-[120px]">{p.title}</span>
                    <button
                      onClick={() => handleToggleCompare(p)}
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
                Tour Package Comparison
              </h3>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 w-1/4 font-bold text-slate-500 uppercase text-[10px]">
                      Feature
                    </th>
                    {compareList.map((p) => (
                      <th key={p._id} className="py-3 px-4 font-bold text-navy-900 text-sm">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="line-clamp-1">{p.title}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Price */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Price / Person</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 font-black text-navy-900 text-base">
                        ₹{Number(p.pricePerTraveler || 0).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Duration */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Duration</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-teal-600 inline mr-1" />
                        {p.durationDays} Days / {p.durationNights || p.durationDays - 1} Nights
                      </td>
                    ))}
                  </tr>

                  {/* Destination */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Destination</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 inline mr-1" />
                        {p.destination?.name || 'Featured Destination'}
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Rating & Reviews</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline mr-1" />
                        <span className="font-bold">{p.averageRating || '4.8'}</span>{' '}
                        <span className="text-slate-400">({p.reviewCount || 24} reviews)</span>
                      </td>
                    ))}
                  </tr>

                  {/* Departure Availability */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Departures & Capacity</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-600 space-y-1">
                        <div>
                          <strong className="text-navy-900">{p.capacity || 20}</strong> seats total capacity
                        </div>
                        {p.departureDates && p.departureDates.length > 0 && (
                          <div className="text-[11px] text-teal-700">
                            Next: {new Date(p.departureDates[0]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Inclusions */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Key Inclusions</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-600">
                        {p.inclusions && p.inclusions.length > 0 ? (
                          <ul className="space-y-1">
                            {p.inclusions.slice(0, 3).map((inc, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="line-clamp-1">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'Standard inclusions'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Exclusions */}
                  <tr>
                    <td className="py-3 px-4 bg-slate-50 font-bold text-slate-700">Key Exclusions</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-3 px-4 text-slate-600">
                        {p.exclusions && p.exclusions.length > 0 ? (
                          <ul className="space-y-1">
                            {p.exclusions.slice(0, 2).map((exc, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-rose-800">
                                <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="line-clamp-1">{exc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'Personal expenses'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="py-4 px-4 bg-slate-50 font-bold text-slate-700">Actions</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/packages/${p.slug || p._id}/book`}
                            className="py-2 px-3 text-center rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
                          >
                            Book Now
                          </Link>
                          <Link
                            to={`/packages/${p.slug || p._id}`}
                            className="py-1.5 px-3 text-center rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            View Details
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
