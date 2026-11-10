import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { getPackage, createPackage, updatePackage, getDestinations } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminPackageForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    destination: '',
    description: '',
    durationDays: 4,
    durationNights: 3,
    pricePerTraveler: 15000,
    currency: 'INR',
    capacity: 20,
    averageRating: 4.8,
    images: '',
    inclusions: '',
    exclusions: '',
    departureDates: '2026-11-15, 2026-11-25, 2026-12-05, 2026-12-15',
    isPublished: true,
  });

  const [itinerary, setItinerary] = useState([
    {
      day: 1,
      title: 'Arrival & Welcome Dinner',
      description: 'Transfer to deluxe resort, welcome refreshments, and evening orientation dinner.',
      meals: 'Dinner included',
      accommodation: 'Deluxe Resort & Spa',
    },
    {
      day: 2,
      title: 'Guided Sightseeing & Exploration',
      description: 'Full day excursion covering famous landmarks, scenic viewpoints, and local market visits.',
      meals: 'Breakfast & Dinner',
      accommodation: 'Deluxe Resort & Spa',
    },
  ]);

  useEffect(() => {
    getDestinations().then((res) => {
      const destList = res.data.data || [];
      setDestinations(destList);
      if (!isEdit && destList.length > 0) {
        setForm((prev) => ({ ...prev, destination: destList[0]._id }));
      }
    });

    if (isEdit) {
      getPackage(id)
        .then((res) => {
          const p = res.data.data;
          setForm({
            title: p.title || '',
            slug: p.slug || '',
            destination: p.destination?._id || p.destination || '',
            description: p.description || '',
            durationDays: p.durationDays || 4,
            durationNights: p.durationNights || 3,
            pricePerTraveler: p.pricePerTraveler || 15000,
            currency: p.currency || 'INR',
            capacity: p.capacity || 20,
            averageRating: p.averageRating || 4.8,
            images: Array.isArray(p.images) ? p.images.join(', ') : '',
            inclusions: Array.isArray(p.inclusions) ? p.inclusions.join(', ') : '',
            exclusions: Array.isArray(p.exclusions) ? p.exclusions.join(', ') : '',
            departureDates: Array.isArray(p.departureDates) ? p.departureDates.join(', ') : '',
            isPublished: p.isPublished !== undefined ? p.isPublished : true,
          });
          if (p.itinerary && p.itinerary.length > 0) {
            setItinerary(p.itinerary);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('Package not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleAddItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        day: nextDay,
        title: `Day ${nextDay} Activity`,
        description: 'Scheduled scenic tours and leisure activities.',
        meals: 'Breakfast included',
        accommodation: 'Deluxe Resort & Spa',
      },
    ]);
  };

  const handleRemoveItineraryDay = (index) => {
    const next = itinerary.filter((_, i) => i !== index).map((item, i) => ({ ...item, day: i + 1 }));
    setItinerary(next);
  };

  const handleItineraryChange = (index, field, value) => {
    const next = [...itinerary];
    next[index][field] = value;
    setItinerary(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.pricePerTraveler || !form.durationDays) {
      toast.error('Please fill in all required package fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        durationDays: Number(form.durationDays),
        durationNights: Number(form.durationNights),
        pricePerTraveler: Number(form.pricePerTraveler),
        capacity: Number(form.capacity) || 20,
        averageRating: Number(form.averageRating) || 4.8,
        inclusions: form.inclusions ? form.inclusions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        exclusions: form.exclusions ? form.exclusions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        departureDates: form.departureDates ? form.departureDates.split(',').map((s) => s.trim()).filter(Boolean) : [],
        itinerary,
      };

      if (isEdit) {
        await updatePackage(id, payload);
        toast.success('Tour package updated successfully!');
      } else {
        await createPackage(payload);
        toast.success('Tour package created successfully!');
      }

      navigate('/admin/packages');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading tour package..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        to="/admin/packages"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Packages
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          {isEdit ? 'Edit Tour Package' : 'Create New Tour Package'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure complete pricing, duration, inclusions, and daily itinerary schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 text-xs">
        
        {/* Title & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Package Title <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ooty Nilgiri Tea & Heritage Escape"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 text-sm focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Destination <span className="text-teal-600">*</span>
            </label>
            <select
              required
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white focus:border-teal-500 text-sm"
            >
              <option value="">Select Destination</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing, Duration, Capacity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Price / Person (₹) <span className="text-teal-600">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.pricePerTraveler}
              onChange={(e) => setForm({ ...form, pricePerTraveler: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Days <span className="text-teal-600">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Nights
            </label>
            <input
              type="number"
              min="0"
              value={form.durationNights}
              onChange={(e) => setForm({ ...form, durationNights: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Capacity (Seats)
            </label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Package Description <span className="text-teal-600">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Highlight what makes this package special, included accommodations, and scenic wonders..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
          />
        </div>

        {/* Departure Dates & Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Departure Dates (Comma separated YYYY-MM-DD)
            </label>
            <input
              type="text"
              placeholder="2026-11-10, 2026-11-20, 2026-12-05"
              value={form.departureDates}
              onChange={(e) => setForm({ ...form, departureDates: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Image URLs (Comma separated HTTPS links)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Inclusions (Comma separated)
            </label>
            <textarea
              rows={2}
              placeholder="Deluxe resort stay, Daily breakfast & dinner, Private AC transfers, Guided tour"
              value={form.inclusions}
              onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Exclusions (Comma separated)
            </label>
            <textarea
              rows={2}
              placeholder="Airfare, Personal drinks, Camera entry fees, Optional activities"
              value={form.exclusions}
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Day-by-Day Itinerary Builder */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-navy-900">
                Day-by-Day Schedule Builder
              </h3>
              <p className="text-slate-400 text-[11px]">
                Define schedule, meal plans, and hotel details for each day.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddItineraryDay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
          </div>

          <div className="space-y-3">
            {itinerary.map((dayItem, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-teal-700 bg-teal-100/60 px-2.5 py-0.5 rounded-md">
                    Day {dayItem.day}
                  </span>
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryDay(index)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Day Title (e.g. Arrival & Evening Lake Walk)"
                    value={dayItem.title}
                    onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Meals (e.g. Breakfast & Dinner)"
                    value={dayItem.meals}
                    onChange={(e) => handleItineraryChange(index, 'meals', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Day Description..."
                  value={dayItem.description}
                  onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Publish checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="pkgPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="pkgPublished" className="font-semibold text-navy-900 cursor-pointer">
            Publish package live on public website
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/packages')}
            className="py-3 px-6 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : isEdit ? 'Update Package' : 'Create Package'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
