import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { getAdminDestinations, deleteDestination, updateDestination } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await getAdminDestinations();
      setDestinations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching admin destinations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete destination "${name}"?`)) return;
    try {
      await deleteDestination(id);
      toast.success('Destination deleted successfully');
      fetchDestinations();
    } catch {
      toast.error('Failed to delete destination');
    }
  };

  const handleTogglePublish = async (dest) => {
    try {
      await updateDestination(dest._id, { isPublished: !dest.isPublished });
      toast.success(
        dest.isPublished ? 'Destination unpublished' : 'Destination published live!'
      );
      fetchDestinations();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Admin Overview
        </Link>
        <span>/</span>
        <span className="text-navy-900 font-bold">Destinations</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Destination Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, or remove destinations visible on the public platform.
          </p>
        </div>

        <Link
          to="/admin/destinations/new"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Destination</span>
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading destinations..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Daily Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {destinations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={d.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div>
                          <span className="font-bold text-navy-900 block text-sm">
                            {d.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            /{d.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {d.region ? `${d.region}, ` : ''}{d.country}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {d.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-navy-900">
                      ₹{Number(d.estimatedDailyBudget || 3000).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(d)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          d.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {d.isPublished ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{d.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/destinations/${d.slug || d._id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-navy-900 rounded-lg hover:bg-slate-100 transition"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/destinations/${d._id}/edit`}
                          className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition"
                          title="Edit Destination"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(d._id, d.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
