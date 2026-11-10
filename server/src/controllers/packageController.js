const mongoose = require('mongoose');
const TourPackage = require('../models/TourPackage');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');

// GET /api/v1/packages
exports.getAllPackages = async (req, res, next) => {
  try {
    const {
      destination,
      category,
      minPrice,
      maxPrice,
      minDays,
      maxDays,
      search,
      sort,
      isPublished,
    } = req.query;

    const filter = {};

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    } else {
      filter.isPublished = true;
    }

    if (destination) {
      if (mongoose.Types.ObjectId.isValid(destination)) {
        filter.destination = destination;
      } else {
        // find destination by slug or name first
        const dest = await Destination.findOne({
          $or: [
            { slug: destination.toLowerCase() },
            { name: new RegExp(destination, 'i') },
          ],
        });
        if (dest) {
          filter.destination = dest._id;
        }
      }
    }

    if (minPrice || maxPrice) {
      filter.pricePerTraveler = {};
      if (minPrice) filter.pricePerTraveler.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerTraveler.$lte = Number(maxPrice);
    }

    if (minDays || maxDays) {
      filter.durationDays = {};
      if (minDays) filter.durationDays.$gte = Number(minDays);
      if (maxDays) filter.durationDays.$lte = Number(maxDays);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let query = TourPackage.find(filter).populate('destination');

    if (category && category !== 'All') {
      // We can filter populated destinations in memory or find matching destination IDs
      const matchingDestinations = await Destination.find({
        category: new RegExp(`^${category}$`, 'i'),
      }).select('_id');
      const destIds = matchingDestinations.map(d => d._id);
      filter.destination = { $in: destIds };
      query = TourPackage.find(filter).populate('destination');
    }

    if (sort === 'price-asc') {
      query = query.sort({ pricePerTraveler: 1 });
    } else if (sort === 'price-desc') {
      query = query.sort({ pricePerTraveler: -1 });
    } else if (sort === 'rating-desc') {
      query = query.sort({ averageRating: -1 });
    } else if (sort === 'duration-asc') {
      query = query.sort({ durationDays: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const packages = await query.exec();

    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/packages/:idOrSlug
exports.getPackageByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let tourPackage;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      tourPackage = await TourPackage.findById(idOrSlug).populate('destination');
    }
    if (!tourPackage) {
      tourPackage = await TourPackage.findOne({ slug: idOrSlug.toLowerCase() }).populate('destination');
    }

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found',
      });
    }

    res.json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/packages/:idOrSlug/availability?date=YYYY-MM-DD
exports.getPackageAvailability = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const { date } = req.query;

    let tourPackage;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      tourPackage = await TourPackage.findById(idOrSlug);
    }
    if (!tourPackage) {
      tourPackage = await TourPackage.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Departure date query parameter is required (YYYY-MM-DD)',
      });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Sum booked travelers on this date for confirmed bookings
    const bookings = await Booking.find({
      package: tourPackage._id,
      status: 'Confirmed',
      departureDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const bookedCount = bookings.reduce((sum, b) => sum + b.travelerCount, 0);
    const capacity = tourPackage.capacity || 20;
    const availableSpots = Math.max(0, capacity - bookedCount);

    res.json({
      success: true,
      packageId: tourPackage._id,
      date,
      capacity,
      bookedCount,
      availableSpots,
      isAvailable: availableSpots > 0,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/packages
exports.createPackage = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      destination,
      images,
      durationDays,
      durationNights,
      pricePerTraveler,
      currency,
      inclusions,
      exclusions,
      itinerary,
      departureDates,
      capacity,
      averageRating,
      isPublished,
    } = req.body;

    if (!title || !description || !destination || !durationDays || !pricePerTraveler) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, destination, durationDays, and pricePerTraveler are required',
      });
    }

    // Verify destination exists
    const dest = await Destination.findById(destination);
    if (!dest) {
      return res.status(400).json({
        success: false,
        message: 'Valid destination not found with provided ID',
      });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    const existing = await TourPackage.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Package with this title or slug already exists',
      });
    }

    const newPackage = await TourPackage.create({
      title,
      slug: finalSlug,
      description,
      destination,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      durationDays: Number(durationDays),
      durationNights: Number(durationNights) || Math.max(0, Number(durationDays) - 1),
      pricePerTraveler: Number(pricePerTraveler),
      currency: currency || 'INR',
      inclusions: Array.isArray(inclusions) ? inclusions : (inclusions ? inclusions.split(',').map(s => s.trim()) : []),
      exclusions: Array.isArray(exclusions) ? exclusions : (exclusions ? exclusions.split(',').map(s => s.trim()) : []),
      itinerary: Array.isArray(itinerary) ? itinerary : [],
      departureDates: Array.isArray(departureDates) ? departureDates : (departureDates ? departureDates.split(',').map(s => s.trim()) : []),
      capacity: Number(capacity) || 20,
      averageRating: Number(averageRating) || 4.8,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    res.status(201).json({
      success: true,
      data: newPackage,
      message: 'Tour package created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/packages/:id
exports.updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    if (updates.destination) {
      const dest = await Destination.findById(updates.destination);
      if (!dest) {
        return res.status(400).json({
          success: false,
          message: 'Destination not found',
        });
      }
    }

    if (typeof updates.inclusions === 'string') {
      updates.inclusions = updates.inclusions.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.exclusions === 'string') {
      updates.exclusions = updates.exclusions.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.images === 'string') {
      updates.images = updates.images.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.departureDates === 'string') {
      updates.departureDates = updates.departureDates.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updatedPackage = await TourPackage.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('destination');

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found',
      });
    }

    res.json({
      success: true,
      data: updatedPackage,
      message: 'Tour package updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/packages/:id
exports.deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tourPackage = await TourPackage.findById(id);

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found',
      });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      package: id,
      status: 'Confirmed',
    });

    if (activeBookings > 0) {
      // Instead of hard deleting, we can unpublish it so historical bookings stay safe
      tourPackage.isPublished = false;
      await tourPackage.save();
      return res.json({
        success: true,
        message: `Package has ${activeBookings} active booking(s). It has been unpublished to safeguard historical records.`,
      });
    }

    await TourPackage.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tour package deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
