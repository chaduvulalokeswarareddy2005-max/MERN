const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const TourPackage = require('../models/TourPackage');

// GET /api/v1/destinations
exports.getAllDestinations = async (req, res, next) => {
  try {
    const { category, country, region, search, sort, isPublished } = req.query;
    const filter = {};

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    } else {
      filter.isPublished = true;
    }

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (country) {
      filter.country = new RegExp(country, 'i');
    }

    if (region) {
      filter.region = new RegExp(region, 'i');
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Destination.find(filter);

    if (sort === 'budget-asc') {
      query = query.sort({ estimatedDailyBudget: 1 });
    } else if (sort === 'budget-desc') {
      query = query.sort({ estimatedDailyBudget: -1 });
    } else if (sort === 'name-desc') {
      query = query.sort({ name: -1 });
    } else {
      // default name-asc
      query = query.sort({ name: 1 });
    }

    const destinations = await query.exec();
    res.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/destinations/featured
exports.getFeaturedDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find({ isPublished: true })
      .limit(6)
      .exec();
    res.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/destinations/:idOrSlug
exports.getDestinationByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let destination;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      destination = await Destination.findById(idOrSlug);
    }
    if (!destination) {
      destination = await Destination.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    // Related tour packages
    const packages = await TourPackage.find({
      destination: destination._id,
      isPublished: true,
    });

    res.json({
      success: true,
      data: destination,
      relatedPackages: packages,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/destinations
exports.createDestination = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      country,
      region,
      category,
      images,
      attractions,
      bestTimeToVisit,
      suggestedDuration,
      estimatedDailyBudget,
      travelTips,
      isPublished,
    } = req.body;

    if (!name || !description || !country || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, country, and category are required',
      });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    const existing = await Destination.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Destination with this name or slug already exists',
      });
    }

    const destination = await Destination.create({
      name,
      slug: finalSlug,
      description,
      country,
      region,
      category,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      attractions: Array.isArray(attractions) ? attractions : (attractions ? attractions.split(',').map(s => s.trim()) : []),
      bestTimeToVisit: bestTimeToVisit || 'Year-round',
      suggestedDuration: suggestedDuration || '3-5 Days',
      estimatedDailyBudget: Number(estimatedDailyBudget) || 3000,
      travelTips: Array.isArray(travelTips) ? travelTips : (travelTips ? travelTips.split(',').map(s => s.trim()) : []),
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    res.status(201).json({
      success: true,
      data: destination,
      message: 'Destination created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/destinations/:id
exports.updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    if (typeof updates.attractions === 'string') {
      updates.attractions = updates.attractions.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.travelTips === 'string') {
      updates.travelTips = updates.travelTips.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.images === 'string') {
      updates.images = updates.images.split(',').map(s => s.trim()).filter(Boolean);
    }

    const destination = await Destination.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    res.json({
      success: true,
      data: destination,
      message: 'Destination updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/destinations/:id
exports.deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    res.json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
