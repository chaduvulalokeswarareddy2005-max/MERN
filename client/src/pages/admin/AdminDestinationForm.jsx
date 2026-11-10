import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Save,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { getDestination, createDestination, updateDestination } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDestinationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    country: 'India',
    region: '',
    category: 'Hill Station',
    description: '',
    estimatedDailyBudget: 3500,
    bestTimeToVisit: 'October to May',
    suggestedDuration: '3-4 Days',
    attractions: '',
    travelTips: '',
    images: '',
    isPublished: true,
  });

  const categories = ['Hill Station', 'Beaches', 'Cultural', 'Nature', 'Family', 'Adventure'];

  useEffect(() => {
    if (isEdit) {
      getDestination(id)
        .then((res) => {
          const d = res.data.data;
          setForm({
            name: d.name || '',
            slug: d.slug || '',
            country: d.country || '',
            region: d.region || '',
            category: d.category || 'Hill Station',
            description: d.description || '',
            estimatedDailyBudget: d.estimatedDailyBudget || 3000,
            bestTimeToVisit: d.bestTimeToVisit || '',
            suggestedDuration: d.suggestedDuration || '',
            attractions: Array.isArray(d.attractions) ? d.attractions.join(', ') : '',
            travelTips: Array.isArray(d.travelTips) ? d.travelTips.join(', ') : '',
            images: Array.isArray(d.images) ? d.images.join(', ') : '',
            isPublished: d.isPublished !== undefined ? d.isPublished : true,
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error('Destination not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.country || !form.category) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        estimatedDailyBudget: Number(form.estimatedDailyBudget) || 3000,
        attractions: form.attractions ? form.attractions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        travelTips: form.travelTips ? form.travelTips.split(',').map((s) => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (isEdit) {
        await updateDestination(id, payload);
        toast.success('Destination updated successfully!');
      } else {
        await createDestination(payload);
        toast.success('Destination created successfully!');
      }

      navigate('/admin/destinations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save destination');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading destination details..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        to="/admin/destinations"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Destinations
      </Link>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          {isEdit ? 'Edit Destination' : 'Add New Destination'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide complete location details, highlights, and high-res imagery for the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 text-xs">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Destination Name <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ooty, Manali, Bali"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 text-sm focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Custom URL Slug (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ooty, manali-himachal"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 text-sm focus:border-teal-500"
            />
          </div>
        </div>

        {/* Location & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Country <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. India"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              State / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Tamil Nadu, Himachal Pradesh"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Category <span className="text-teal-600">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white focus:border-teal-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Overview Description <span className="text-teal-600">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Detailed overview describing the landscape, vibe, and experiences..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
          />
        </div>

        {/* Duration, Budget, Best Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Daily Budget (₹)
            </label>
            <input
              type="number"
              min="0"
              value={form.estimatedDailyBudget}
              onChange={(e) => setForm({ ...form, estimatedDailyBudget: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Suggested Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 3-4 Days"
              value={form.suggestedDuration}
              onChange={(e) => setForm({ ...form, suggestedDuration: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Best Time to Visit
            </label>
            <input
              type="text"
              placeholder="e.g. October to June"
              value={form.bestTimeToVisit}
              onChange={(e) => setForm({ ...form, bestTimeToVisit: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Attractions */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Popular Attractions (Comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Doddabetta Peak, Botanical Gardens, Ooty Lake, Pykara Falls"
            value={form.attractions}
            onChange={(e) => setForm({ ...form, attractions: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
          />
        </div>

        {/* Travel Tips */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Travel Tips (Comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Carry light woolens, Book toy train tickets in advance, Try homemade chocolates"
            value={form.travelTips}
            onChange={(e) => setForm({ ...form, travelTips: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Image URLs (Comma separated HTTPS image links)
          </label>
          <input
            type="text"
            placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
          />
        </div>

        {/* Published status */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="isPublished" className="font-semibold text-navy-900 cursor-pointer">
            Publish publicly on TravelEase website
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/destinations')}
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
            <span>{submitting ? 'Saving...' : isEdit ? 'Update Destination' : 'Create Destination'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
