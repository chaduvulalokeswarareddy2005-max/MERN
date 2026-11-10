import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Users,
  Wallet,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ArrowLeft,
  Sparkles,
  CheckSquare,
  PieChart,
  ArrowUp,
  ArrowDown,
  FileText,
  Save,
  Plane,
  Building,
  Utensils,
  ShoppingBag,
  MoreHorizontal,
  ChevronRight,
  ListOrdered,
  Layers,
  Check,
  RefreshCw,
  ExternalLink,
  Tag
} from 'lucide-react';
import { getTrip, updateTrip, deleteTrip } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);

  // Tab State: 'overview' | 'itinerary' | 'budget' | 'checklist'
  const [activeTab, setActiveTab] = useState('itinerary');

  // Itinerary View State: 'day' | 'timeline'
  const [itineraryView, setItineraryView] = useState('day');
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');

  // Activity modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [activityForm, setActivityForm] = useState({
    day: 1,
    date: '',
    time: '09:00 AM',
    title: '',
    location: '',
    description: '',
    cost: 500,
    notes: '',
  });

  // Budget Calculator state (local editable copy)
  const [budgetForm, setBudgetForm] = useState({
    targetBudget: 0,
    transportation: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  });

  // Checklist state
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState('General');
  const [checklistFilter, setChecklistFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await getTrip(id);
      const data = res.data.data;
      setTrip(data);

      // Populate budget form from loaded trip data
      const b = data.budgetExpenses || {};
      const activitiesCostSum = (data.activities || []).reduce(
        (sum, a) => sum + (Number(a.cost) || 0),
        0
      );

      setBudgetForm({
        targetBudget: data.targetBudget || 0,
        transportation: b.transportation || 0,
        accommodation: b.accommodation || 0,
        food: b.food || 0,
        activities: b.activities !== undefined ? b.activities : activitiesCostSum,
        shopping: b.shopping || 0,
        other: b.other || 0,
      });
    } catch (err) {
      console.error('Error fetching trip', err);
      toast.error('Trip not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading your custom itinerary..." />;

  if (!trip) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Trip Not Found</h2>
        <Link
          to="/my-trips"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600"
        >
          Back to My Trips
        </Link>
      </div>
    );
  }

  // Calculate day metrics
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  // Helper: compute date string for a given day (1-indexed)
  const getDateForDay = (dayNum) => {
    const d = new Date(start);
    d.setDate(d.getDate() + (dayNum - 1));
    return d.toISOString().split('T')[0];
  };

  // Activities calculations
  const activities = trip.activities || [];
  const totalActivityCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

  // Budget calculations
  const currentExpenses = trip.budgetExpenses || {};
  const totalPlannedExpenses =
    Number(currentExpenses.transportation || 0) +
    Number(currentExpenses.accommodation || 0) +
    Number(currentExpenses.food || 0) +
    Number(currentExpenses.activities || 0) +
    Number(currentExpenses.shopping || 0) +
    Number(currentExpenses.other || 0);

  const targetBudget = Number(trip.targetBudget) || 0;
  const remainingBudget = targetBudget - totalPlannedExpenses;
  const budgetPercentage =
    targetBudget > 0 ? Math.min(100, Math.round((totalPlannedExpenses / targetBudget) * 100)) : 0;
  const perTravelerCost =
    trip.travelers > 0 ? Math.round(totalPlannedExpenses / trip.travelers) : totalPlannedExpenses;

  // Checklist calculations
  const checklist = trip.checklist || [];
  const completedTasksCount = checklist.filter((item) => item.completed).length;
  const totalTasksCount = checklist.length;
  const checklistPercentage =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // ----------------------------------------------------
  // ITINERARY BUILDER LOGIC
  // ----------------------------------------------------
  const handleOpenAddActivity = (dayNum = 1) => {
    setEditingActivityIndex(null);
    setActivityForm({
      day: dayNum,
      date: getDateForDay(dayNum),
      time: '09:00 AM',
      title: '',
      location: '',
      description: '',
      cost: 500,
      notes: '',
    });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity, index) => {
    setEditingActivityIndex(index);
    let dateStr = '';
    if (activity.date) {
      dateStr = new Date(activity.date).toISOString().split('T')[0];
    } else {
      dateStr = getDateForDay(activity.day || 1);
    }

    setActivityForm({
      day: activity.day || 1,
      date: dateStr,
      time: activity.time || '09:00 AM',
      title: activity.title || '',
      location: activity.location || '',
      description: activity.description || '',
      cost: activity.cost || 0,
      notes: activity.notes || '',
    });
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) {
      toast.error('Activity title is required');
      return;
    }

    // Validate activity date is between trip startDate and endDate
    if (activityForm.date) {
      const actDate = new Date(activityForm.date);
      const tripStart = new Date(trip.startDate);
      tripStart.setHours(0, 0, 0, 0);
      const tripEnd = new Date(trip.endDate);
      tripEnd.setHours(23, 59, 59, 999);

      if (actDate < tripStart || actDate > tripEnd) {
        toast.error(
          `Activity date must be between trip dates (${tripStart.toLocaleDateString()} to ${tripEnd.toLocaleDateString()})`
        );
        return;
      }
    }

    try {
      const updatedActivities = [...activities];
      const payload = {
        ...activityForm,
        cost: Math.round(Number(activityForm.cost) || 0),
        day: Number(activityForm.day) || 1,
      };

      if (editingActivityIndex !== null) {
        updatedActivities[editingActivityIndex] = payload;
      } else {
        updatedActivities.push(payload);
      }

      const res = await updateTrip(trip._id, { activities: updatedActivities });
      setTrip(res.data.data);
      setIsActivityModalOpen(false);
      toast.success(editingActivityIndex !== null ? 'Activity updated' : 'Activity added! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (index) => {
    try {
      const updatedActivities = activities.filter((_, i) => i !== index);
      const res = await updateTrip(trip._id, { activities: updatedActivities });
      setTrip(res.data.data);
      toast.success('Activity removed');
    } catch {
      toast.error('Failed to remove activity');
    }
  };

  const handleMoveActivity = async (index, direction) => {
    // direction: -1 (up) or 1 (down)
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    // Check if both activities belong to the same day
    const currentAct = activities[index];
    const targetAct = activities[targetIndex];

    const updated = [...activities];
    updated[index] = targetAct;
    updated[targetIndex] = currentAct;

    try {
      const res = await updateTrip(trip._id, { activities: updated });
      setTrip(res.data.data);
      toast.success('Activity order updated');
    } catch {
      toast.error('Failed to reorder activities');
    }
  };

  // ----------------------------------------------------
  // BUDGET CALCULATOR LOGIC
  // ----------------------------------------------------
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      setSavingBudget(true);
      const sanitizedExpenses = {
        transportation: Math.round(Number(budgetForm.transportation) || 0),
        accommodation: Math.round(Number(budgetForm.accommodation) || 0),
        food: Math.round(Number(budgetForm.food) || 0),
        activities: Math.round(Number(budgetForm.activities) || 0),
        shopping: Math.round(Number(budgetForm.shopping) || 0),
        other: Math.round(Number(budgetForm.other) || 0),
      };

      const res = await updateTrip(trip._id, {
        targetBudget: Math.round(Number(budgetForm.targetBudget) || 0),
        budgetExpenses: sanitizedExpenses,
      });

      setTrip(res.data.data);
      toast.success('Budget estimates saved to database! 💰');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update budget');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleSyncActivitiesCostToBudget = () => {
    setBudgetForm((prev) => ({
      ...prev,
      activities: totalActivityCost,
    }));
    toast.success(`Synced ₹${totalActivityCost.toLocaleString('en-IN')} from itinerary activities!`);
  };

  // ----------------------------------------------------
  // CHECKLIST LOGIC
  // ----------------------------------------------------
  const handleToggleChecklist = async (itemId) => {
    const updatedChecklist = checklist.map((item) =>
      item._id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      const res = await updateTrip(trip._id, { checklist: updatedChecklist });
      setTrip(res.data.data);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      text: newChecklistText.trim(),
      completed: false,
      category: newChecklistCategory || 'General',
    };

    try {
      const updatedChecklist = [...checklist, newItem];
      const res = await updateTrip(trip._id, { checklist: updatedChecklist });
      setTrip(res.data.data);
      setNewChecklistText('');
      toast.success('Task added to travel checklist!');
    } catch {
      toast.error('Failed to add checklist item');
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      const updatedChecklist = checklist.filter((item) => item._id !== itemId);
      const res = await updateTrip(trip._id, { checklist: updatedChecklist });
      setTrip(res.data.data);
      toast.success('Task removed');
    } catch {
      toast.error('Failed to remove task');
    }
  };

  const handleSaveEditChecklist = async (itemId) => {
    if (!editingChecklistText.trim()) return;
    try {
      const updatedChecklist = checklist.map((item) =>
        item._id === itemId ? { ...item, text: editingChecklistText.trim() } : item
      );
      const res = await updateTrip(trip._id, { checklist: updatedChecklist });
      setTrip(res.data.data);
      setEditingChecklistId(null);
      setEditingChecklistText('');
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteEntireTrip = async () => {
    if (!window.confirm(`Are you sure you want to delete trip "${trip.name}"?`)) return;
    try {
      await deleteTrip(trip._id);
      toast.success('Trip deleted');
      navigate('/my-trips');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  // Filter activities for day view
  const displayedActivities =
    selectedDayFilter === 'All'
      ? activities
      : activities.filter((a) => a.day === Number(selectedDayFilter));

  // Chronologically sorted activities for timeline view
  const timelineActivities = [...activities].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return (a.time || '').localeCompare(b.time || '');
  });

  // Filtered checklist
  const filteredChecklist = checklist.filter((item) => {
    if (checklistFilter === 'completed') return item.completed;
    if (checklistFilter === 'pending') return !item.completed;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/my-trips"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Planned Trips
        </Link>

        <button
          onClick={handleDeleteEntireTrip}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Trip</span>
        </button>
      </div>

      {/* Main Trip Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{totalDays} Days Trip</span>
            </span>

            {trip.linkedBooking && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tour Package Booked</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {trip.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>
                {start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
                {end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              <span>{trip.travelers} Traveler(s)</span>
            </div>

            {trip.destinations && trip.destinations.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{trip.destinations.map((d) => d.name || 'Destination').join(', ')}</span>
              </div>
            )}
          </div>

          {trip.notes && (
            <p className="text-xs text-slate-400 pt-2 border-t border-white/10 leading-relaxed font-normal">
              📝 Notes: {trip.notes}
            </p>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'itinerary'
              ? 'bg-navy-900 text-teal-300 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Interactive Itinerary ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'budget'
              ? 'bg-navy-900 text-teal-300 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Budget Calculator (₹{totalPlannedExpenses.toLocaleString('en-IN')})</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'checklist'
              ? 'bg-navy-900 text-teal-300 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>
            Travel Checklist ({completedTasksCount}/{totalTasksCount})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-navy-900 text-teal-300 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Trip Overview</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: ITINERARY BUILDER & TIMELINE                   */}
      {/* ==================================================== */}
      {activeTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Subheader: View switcher, Day filter, and Add Activity CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            
            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setItineraryView('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  itineraryView === 'day'
                    ? 'bg-white text-navy-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Day by Day</span>
              </button>
              <button
                onClick={() => setItineraryView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  itineraryView === 'timeline'
                    ? 'bg-white text-navy-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Chronological Timeline</span>
              </button>
            </div>

            {/* Total activities spend preview */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-500 font-medium">
                Activities Spend:{' '}
                <strong className="text-navy-900 font-bold">
                  ₹{totalActivityCost.toLocaleString('en-IN')}
                </strong>
              </span>

              <button
                onClick={() =>
                  handleOpenAddActivity(selectedDayFilter === 'All' ? 1 : Number(selectedDayFilter))
                }
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>

          {/* Day View */}
          {itineraryView === 'day' && (
            <div className="space-y-6">
              {/* Day filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                <button
                  onClick={() => setSelectedDayFilter('All')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                    selectedDayFilter === 'All'
                      ? 'bg-navy-900 text-teal-300 shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Days ({activities.length})
                </button>

                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                  const dayDate = getDateForDay(d);
                  const count = activities.filter((a) => a.day === d).length;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDayFilter(String(d))}
                      className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 flex items-center gap-2 ${
                        selectedDayFilter === String(d)
                          ? 'bg-navy-900 text-teal-300 shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Day {d}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({new Date(dayDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Activities Cards */}
              {displayedActivities.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 text-sm">No activities scheduled</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Add sightseeing visits, meals, transfers, or adventures to this day.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenAddActivity(
                        selectedDayFilter === 'All' ? 1 : Number(selectedDayFilter)
                      )
                    }
                    className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                  >
                    Add First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedActivities.map((act, idx) => {
                    const originalIndex = activities.findIndex((a) => a._id === act._id);
                    return (
                      <div
                        key={act._id || idx}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <span className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                            D{act.day}
                          </span>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {act.date && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                  <Calendar className="w-3 h-3 text-teal-600" />
                                  {new Date(act.date).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 text-teal-600" />
                                {act.time || 'All Day'}
                              </span>

                              {act.location && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                  <MapPin className="w-3 h-3 text-teal-600" />
                                  {act.location}
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-navy-900">{act.title}</h4>

                            {act.description && (
                              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                {act.description}
                              </p>
                            )}

                            {act.notes && (
                              <p className="text-[11px] text-amber-700 italic">
                                📌 {act.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cost, Reordering & Action buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Reordering Controls */}
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            <button
                              disabled={originalIndex === 0}
                              onClick={() => handleMoveActivity(originalIndex, -1)}
                              className="p-1 text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                              title="Move Activity Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={originalIndex === activities.length - 1}
                              onClick={() => handleMoveActivity(originalIndex, 1)}
                              className="p-1 text-slate-400 hover:text-navy-900 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                              title="Move Activity Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Est. Cost
                            </span>
                            <span className="font-bold text-navy-900 text-sm">
                              ₹{Number(act.cost || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditActivity(act, originalIndex)}
                              className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Activity"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(originalIndex)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Timeline View */}
          {itineraryView === 'timeline' && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  Chronological Trip Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete sequential schedule of all planned events from departure to return.
                </p>
              </div>

              {timelineActivities.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No activities in timeline. Click "Add Activity" above to schedule events.
                </p>
              ) : (
                <div className="relative border-l-2 border-teal-500/30 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
                  {timelineActivities.map((act, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-teal-50" />

                      <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/70 transition space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-md">
                              Day {act.day}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              {act.time || 'All Day'}
                            </span>
                            {act.date && (
                              <span className="text-xs text-slate-500">
                                • {new Date(act.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>

                          <span className="font-extrabold text-xs text-navy-900">
                            ₹{Number(act.cost || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-navy-900">{act.title}</h4>

                        {act.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{act.location}</span>
                          </div>
                        )}

                        {act.description && (
                          <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: TRIP BUDGET CALCULATOR                         */}
      {/* ==================================================== */}
      {activeTab === 'budget' && (
        <div className="space-y-8">
          
          {/* Key Budget Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Target Budget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Target Budget
              </span>
              <div className="text-2xl font-black text-navy-900 mt-1">
                ₹{targetBudget.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Vacation budget ceiling
              </span>
            </div>

            {/* Total Planned Expenses */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Planned Expenses
              </span>
              <div className="text-2xl font-black text-navy-900 mt-1">
                ₹{totalPlannedExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Sum of all 6 categories
              </span>
            </div>

            {/* Remaining Budget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Remaining Budget
              </span>
              <div
                className={`text-2xl font-black mt-1 ${
                  remainingBudget < 0 ? 'text-rose-600' : 'text-teal-700'
                }`}
              >
                ₹{remainingBudget.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {remainingBudget < 0 ? '⚠️ Exceeding planned target' : 'Available unallocated funds'}
              </span>
            </div>

            {/* Per-Traveler Cost */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Per-Traveler Share
              </span>
              <div className="text-2xl font-black text-navy-900 mt-1">
                ₹{perTravelerCost.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Divided across {trip.travelers} traveler(s)
              </span>
            </div>
          </div>

          {/* Budget Utilization Progress */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-navy-900">
              <span className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                Budget Utilization
              </span>
              <span className={budgetPercentage > 100 ? 'text-rose-600' : 'text-teal-700'}>
                {budgetPercentage}% allocated
              </span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 100
                    ? 'bg-rose-500'
                    : budgetPercentage > 85
                    ? 'bg-amber-500'
                    : 'bg-teal-600'
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>
          </div>

          {/* Linked Tour Package Callout (if booking exists) */}
          {trip.linkedBooking && (
            <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                  <span>Linked Tour Package Booking</span>
                </div>
                <h4 className="font-bold text-sm text-navy-900">
                  {trip.linkedBooking.packageTitleSnapshot}
                </h4>
                <p className="text-xs text-slate-500">
                  Booking Ref: <strong>{trip.linkedBooking.bookingReference}</strong> • {trip.linkedBooking.travelerCount} Travelers
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Package Cost (Paid Separately)
                </span>
                <span className="text-lg font-black text-emerald-800">
                  ₹{Number(trip.linkedBooking.totalAmount).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  ✓ Excluded from double counting
                </span>
              </div>
            </div>
          )}

          {/* Categorized Expense Form & Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Estimated Expense Categories
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust estimates for each trip category. All totals persist directly in MongoDB.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncActivitiesCostToBudget}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
                  title="Copy total estimated activity cost into Activities expense"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Itinerary Activities</span>
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
                {/* Target Budget Input */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    Overall Target Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={budgetForm.targetBudget}
                    onChange={(e) =>
                      setBudgetForm({ ...budgetForm, targetBudget: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-navy-900 text-sm focus:border-teal-500 bg-white"
                  />
                </div>

                {/* 6 Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Transportation */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-teal-600" />
                      <span>Transportation (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.transportation}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, transportation: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>

                  {/* Accommodation */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-teal-600" />
                      <span>Accommodation (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.accommodation}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, accommodation: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>

                  {/* Food */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-teal-600" />
                      <span>Food & Dining (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.food}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, food: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>

                  {/* Activities */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
                      <span>Activities & Sightseeing (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.activities}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, activities: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>

                  {/* Shopping */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                      <span>Shopping & Souvenirs (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.shopping}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, shopping: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>

                  {/* Other expenses */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <MoreHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Other / Emergency (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budgetForm.other}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, other: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-navy-900 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingBudget}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingBudget ? 'Saving Calculations...' : 'Save Budget Calculations'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Visual Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h4 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Expense Breakdown</span>
              </h4>

              {totalPlannedExpenses === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  Enter estimated amounts to see category proportions.
                </p>
              ) : (
                <div className="space-y-4 text-xs">
                  {[
                    { name: 'Transportation', amount: currentExpenses.transportation, color: 'bg-blue-500' },
                    { name: 'Accommodation', amount: currentExpenses.accommodation, color: 'bg-indigo-500' },
                    { name: 'Food & Dining', amount: currentExpenses.food, color: 'bg-emerald-500' },
                    { name: 'Activities', amount: currentExpenses.activities, color: 'bg-teal-500' },
                    { name: 'Shopping', amount: currentExpenses.shopping, color: 'bg-amber-500' },
                    { name: 'Other', amount: currentExpenses.other, color: 'bg-slate-400' },
                  ].map((cat) => {
                    const pct =
                      totalPlannedExpenses > 0
                        ? Math.round(((cat.amount || 0) / totalPlannedExpenses) * 100)
                        : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="font-bold text-navy-900">
                            ₹{(cat.amount || 0).toLocaleString('en-IN')}{' '}
                            <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: TRAVEL CHECKLIST                               */}
      {/* ==================================================== */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Header & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-navy-900">
                Pre-Trip Preparation Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stay organized before departure. Mark items done or add personalized tasks.
              </p>
            </div>

            {/* Counts Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                <strong>{completedTasksCount}</strong> of <strong>{totalTasksCount}</strong> completed
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-700 border border-teal-100">
                {checklistPercentage}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${checklistPercentage}%` }}
            />
          </div>

          {/* Add New Task Form */}
          <form
            onSubmit={handleAddChecklistItem}
            className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200"
          >
            <input
              type="text"
              placeholder="Add new task (e.g. Download offline maps, pack swimming goggles)..."
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-navy-900 focus:outline-none focus:border-teal-500"
            />

            <select
              value={newChecklistCategory}
              onChange={(e) => setNewChecklistCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="General">General</option>
              <option value="Documents">Documents</option>
              <option value="Packing">Packing</option>
              <option value="Travel">Travel</option>
              <option value="Booking">Booking</option>
              <option value="Electronics">Electronics</option>
              <option value="Planning">Planning</option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </form>

          {/* Checklist Filter Tabs */}
          <div className="flex items-center gap-2 text-xs">
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setChecklistFilter(f)}
                className={`px-3 py-1 rounded-full font-semibold capitalize transition ${
                  checklistFilter === f
                    ? 'bg-navy-900 text-teal-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Checklist Items List */}
          <div className="divide-y divide-slate-100">
            {filteredChecklist.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No tasks match the selected filter.
              </p>
            ) : (
              filteredChecklist.map((item) => (
                <div
                  key={item._id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(item._id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        item.completed
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 hover:border-teal-500 bg-white'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {editingChecklistId === item._id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingChecklistText}
                          onChange={(e) => setEditingChecklistText(e.target.value)}
                          className="flex-1 px-3 py-1 text-xs border border-teal-500 rounded-lg bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditChecklist(item._id)}
                          className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingChecklistId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 flex-1">
                        <span
                          className={`text-xs font-medium cursor-pointer transition ${
                            item.completed ? 'line-through text-slate-400' : 'text-navy-900'
                          }`}
                          onClick={() => handleToggleChecklist(item._id)}
                        >
                          {item.text}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {editingChecklistId !== item._id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingChecklistId(item._id);
                          setEditingChecklistText(item.text);
                        }}
                        className="p-1 text-slate-400 hover:text-navy-900 rounded"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChecklistItem(item._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: TRIP OVERVIEW                                  */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-navy-900">Trip Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">Duration</span>
                  <span className="text-base font-bold text-navy-900">{totalDays} Days</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">Travel Squad</span>
                  <span className="text-base font-bold text-navy-900">{trip.travelers} Traveler(s)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">Activities Count</span>
                  <span className="text-base font-bold text-navy-900">{activities.length} Events</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">Checklist Progress</span>
                  <span className="text-base font-bold text-navy-900">{checklistPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Destination Highlight */}
            {trip.destinations && trip.destinations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-navy-900">Primary Destination</h3>
                {trip.destinations.map((d) => (
                  <div key={d._id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-navy-900">{d.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{d.description}</p>
                    </div>
                    <Link
                      to={`/destinations/${d.slug || d._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-white border border-slate-200 hover:bg-slate-100 shrink-0"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-3">
                Quick Shortcuts
              </h4>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-navy-900 flex items-center justify-between transition"
                >
                  <span>Build Day Itinerary</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-navy-900 flex items-center justify-between transition"
                >
                  <span>Calculate Expenses</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 font-bold text-navy-900 flex items-center justify-between transition"
                >
                  <span>Review Travel Checklist</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT ACTIVITY                            */}
      {/* ==================================================== */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsActivityModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-navy-900 mb-4">
              {editingActivityIndex !== null ? 'Edit Itinerary Activity' : 'Add Itinerary Activity'}
            </h3>

            <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trip Day</label>
                  <select
                    value={activityForm.day}
                    onChange={(e) => {
                      const newDay = Number(e.target.value);
                      setActivityForm({
                        ...activityForm,
                        day: newDay,
                        date: getDateForDay(newDay),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900 bg-white"
                  >
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={start.toISOString().split('T')[0]}
                    max={end.toISOString().split('T')[0]}
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Activity Title <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Doddabetta Peak, Tea Factory Tour, Candlelight Dinner"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-navy-900 text-sm focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Optional Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={activityForm.time}
                    onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1200"
                    value={activityForm.cost}
                    onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ooty Lake, Pykara Waterfalls"
                  value={activityForm.location}
                  onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add details, tickets information, or meeting points..."
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, description: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium text-navy-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
