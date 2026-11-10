import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Calendar,
  Users,
  Wallet,
  FileText,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { createTrip, getDestinations } from '../services/api';
import { useDemoUser } from '../context/DemoUserContext';
import toast from 'react-hot-toast';

export default function TripNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useDemoUser();

  const [destinations, setDestinations] = useState([]);
  const [name, setName] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(
    searchParams.get('destinationId') || ''
  );

  // Set default dates (tomorrow and +4 days)
  const today = new Date();
  const defaultStart = new Date(today.setDate(today.getDate() + 1))
    .toISOString()
    .split('T')[0];
  const defaultEnd = new Date(today.setDate(today.getDate() + 4))
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [travelers, setTravelers] = useState(2);
  const [targetBudget, setTargetBudget] = useState(35000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDestinations().then((res) => {
      setDestinations(res.data.data || []);
      if (!selectedDestination && res.data.data?.length > 0) {
        setSelectedDestination(res.data.data[0]._id);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openLoginModal(() => handleSubmit(e));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createTrip({
        email: user.email,
        name: name || `${destinations.find((d) => d._id === selectedDestination)?.name || 'Custom'} Getaway`,
        destinations: selectedDestination ? [selectedDestination] : [],
        startDate,
        endDate,
        travelers: Number(travelers) || 1,
        targetBudget: Number(targetBudget) || 0,
        notes,
      });

      toast.success('Trip created! Start adding activities 🎉');
      navigate(`/my-trips/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        to="/my-trips"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Trips
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Plan a New Custom Trip
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define dates, squad size, target budget, and primary destination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5 text-xs">
        
        {/* Trip Name */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Trip Name <span className="text-teal-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ooty Scenic Weekend Retreat, Goa Friends Reunion..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 font-medium text-navy-900 focus:outline-none focus:border-teal-500 text-sm"
          />
        </div>

        {/* Destination selection */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Primary Destination
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 font-medium text-navy-900 focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Choose Destination (Optional)</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Start Date <span className="text-teal-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              End Date <span className="text-teal-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Travelers & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Number of Travelers
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                required
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Estimated Total Budget (₹)
            </label>
            <div className="relative">
              <Wallet className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                step="500"
                placeholder="e.g. 40000"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Trip Notes */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Trip Notes or Goals (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add general ideas, flight numbers, packing reminders..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Creating Trip...' : 'Create Trip & Start Itinerary'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}
