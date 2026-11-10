const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const { defaultChecklist } = require('../models/Trip');

// Helper to sanitize dates for comparison (start of day / end of day)
const getDayBounds = (dateStr) => {
  const d = new Date(dateStr);
  const start = new Date(d.setHours(0, 0, 0, 0));
  const end = new Date(d.setHours(23, 59, 59, 999));
  return { start, end };
};

// GET /api/v1/trips?email=...
exports.getTrips = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required to view your trips',
      });
    }

    const trips = await Trip.find({ email: email.toLowerCase().trim() })
      .populate('destinations')
      .populate('linkedBooking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/trips/:id
exports.getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let trip = await Trip.findById(id)
      .populate('destinations')
      .populate('linkedBooking');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // Auto-migrate: if older trip record doesn't have checklist or budgetExpenses
    let needsSave = false;
    if (!trip.checklist || trip.checklist.length === 0) {
      trip.checklist = defaultChecklist.map((item) => ({ ...item }));
      needsSave = true;
    }

    if (!trip.budgetExpenses) {
      const activitiesCost = (trip.activities || []).reduce((s, a) => s + (Number(a.cost) || 0), 0);
      trip.budgetExpenses = {
        transportation: 0,
        accommodation: 0,
        food: 0,
        activities: activitiesCost,
        shopping: 0,
        other: 0,
      };
      trip.totalPlannedExpenses = activitiesCost;
      needsSave = true;
    }

    // Auto-link any confirmed booking for this user matching the destination
    if (!trip.linkedBooking && trip.destinations && trip.destinations.length > 0) {
      const destIds = trip.destinations.map((d) => d._id);
      const matchingBooking = await Booking.findOne({
        email: trip.email,
        status: 'Confirmed',
        departureDate: {
          $gte: new Date(new Date(trip.startDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(trip.endDate).setHours(23, 59, 59, 999)),
        },
      }).populate('package');

      if (matchingBooking) {
        trip.linkedBooking = matchingBooking._id;
        needsSave = true;
      }
    }

    if (needsSave) {
      await trip.save();
      trip = await Trip.findById(id)
        .populate('destinations')
        .populate('linkedBooking');
    }

    res.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/trips
exports.createTrip = async (req, res, next) => {
  try {
    const {
      email,
      name,
      destinations,
      startDate,
      endDate,
      travelers,
      targetBudget,
      notes,
      activities,
      budgetExpenses,
      checklist,
      linkedBooking,
    } = req.body;

    if (!email || !name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Email, trip name, start date, and end date are required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Initial expenses
    const b = budgetExpenses || {};
    const transportation = Math.round(Number(b.transportation) || 0);
    const accommodation = Math.round(Number(b.accommodation) || 0);
    const food = Math.round(Number(b.food) || 0);
    const activitiesExp = Math.round(
      Number(b.activities) || (activities || []).reduce((s, a) => s + (Number(a.cost) || 0), 0)
    );
    const shopping = Math.round(Number(b.shopping) || 0);
    const other = Math.round(Number(b.other) || 0);
    const totalPlannedExpenses = transportation + accommodation + food + activitiesExp + shopping + other;

    const trip = await Trip.create({
      email: email.toLowerCase().trim(),
      name,
      destinations: destinations || [],
      startDate: start,
      endDate: end,
      travelers: Number(travelers) || 1,
      targetBudget: Math.round(Number(targetBudget) || 0),
      notes: notes || '',
      activities: activities || [],
      budgetExpenses: {
        transportation,
        accommodation,
        food,
        activities: activitiesExp,
        shopping,
        other,
      },
      totalPlannedExpenses,
      checklist: checklist && checklist.length > 0 ? checklist : defaultChecklist.map((c) => ({ ...c })),
      linkedBooking: linkedBooking || null,
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('destinations')
      .populate('linkedBooking');

    res.status(201).json({
      success: true,
      data: populatedTrip,
      message: 'Trip created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/trips/:id
exports.updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    const updates = { ...req.body };

    // Validate dates if updated
    const finalStart = updates.startDate ? new Date(updates.startDate) : trip.startDate;
    const finalEnd = updates.endDate ? new Date(updates.endDate) : trip.endDate;

    if (finalEnd < finalStart) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    if (updates.startDate) trip.startDate = finalStart;
    if (updates.endDate) trip.endDate = finalEnd;
    if (updates.name) trip.name = updates.name;
    if (updates.destinations) trip.destinations = updates.destinations;
    if (updates.travelers !== undefined) trip.travelers = Number(updates.travelers) || 1;
    if (updates.targetBudget !== undefined) trip.targetBudget = Math.round(Number(updates.targetBudget) || 0);
    if (updates.notes !== undefined) trip.notes = updates.notes;
    if (updates.linkedBooking !== undefined) trip.linkedBooking = updates.linkedBooking;

    // Validate and update activities
    if (updates.activities) {
      const tripStartBoundary = new Date(finalStart);
      tripStartBoundary.setHours(0, 0, 0, 0);
      const tripEndBoundary = new Date(finalEnd);
      tripEndBoundary.setHours(23, 59, 59, 999);

      for (const act of updates.activities) {
        if (!act.title || !act.title.trim()) {
          return res.status(400).json({
            success: false,
            message: 'All activities must have a valid title',
          });
        }

        // Validate activity date
        if (act.date) {
          const actDate = new Date(act.date);
          if (isNaN(actDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: `Invalid date format for activity "${act.title}"`,
            });
          }
          if (actDate < tripStartBoundary || actDate > tripEndBoundary) {
            return res.status(400).json({
              success: false,
              message: `Activity "${act.title}" date (${actDate.toISOString().split('T')[0]}) must be between trip dates (${tripStartBoundary.toISOString().split('T')[0]} to ${tripEndBoundary.toISOString().split('T')[0]})`,
            });
          }
        } else if (act.day) {
          // Compute date from trip start date + (day - 1)
          const computedDate = new Date(finalStart);
          computedDate.setDate(computedDate.getDate() + (Number(act.day) - 1));
          act.date = computedDate;
        }

        act.cost = Math.round(Number(act.cost) || 0);
      }

      trip.activities = updates.activities;
    }

    // Validate and update budgetExpenses
    if (updates.budgetExpenses) {
      const b = updates.budgetExpenses;
      const transportation = Math.round(Number(b.transportation) || 0);
      const accommodation = Math.round(Number(b.accommodation) || 0);
      const food = Math.round(Number(b.food) || 0);
      const activitiesExp = Math.round(Number(b.activities) || 0);
      const shopping = Math.round(Number(b.shopping) || 0);
      const other = Math.round(Number(b.other) || 0);

      trip.budgetExpenses = {
        transportation,
        accommodation,
        food,
        activities: activitiesExp,
        shopping,
        other,
      };

      trip.totalPlannedExpenses = transportation + accommodation + food + activitiesExp + shopping + other;
    } else if (updates.activities) {
      // If activities updated without explicit budgetExpenses change, update the activities expense category if desired
      const currentExpenses = trip.budgetExpenses || {};
      const newActivitiesSum = trip.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
      if (currentExpenses.activities === 0 || currentExpenses.activities !== newActivitiesSum) {
        currentExpenses.activities = newActivitiesSum;
        trip.budgetExpenses = currentExpenses;
        trip.totalPlannedExpenses =
          (currentExpenses.transportation || 0) +
          (currentExpenses.accommodation || 0) +
          (currentExpenses.food || 0) +
          newActivitiesSum +
          (currentExpenses.shopping || 0) +
          (currentExpenses.other || 0);
      }
    }

    // Update checklist if provided
    if (updates.checklist) {
      trip.checklist = updates.checklist;
    }

    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('destinations')
      .populate('linkedBooking');

    res.json({
      success: true,
      data: populated,
      message: 'Trip updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/trips/:id
exports.deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findByIdAndDelete(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
