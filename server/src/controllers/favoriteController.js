const Favorite = require('../models/Favorite');
const Destination = require('../models/Destination');

// GET /api/v1/favorites?email=...
exports.getFavorites = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required',
      });
    }

    const favorites = await Favorite.find({ email: email.toLowerCase().trim() })
      .populate('destination')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/favorites
exports.addFavorite = async (req, res, next) => {
  try {
    const { email, destination } = req.body;

    if (!email || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Email and destination are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if destination exists
    const dest = await Destination.findById(destination);
    if (!dest) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    // Check if already favorited
    let favorite = await Favorite.findOne({
      email: normalizedEmail,
      destination,
    });

    if (favorite) {
      return res.status(200).json({
        success: true,
        message: 'Already in favorites',
        data: favorite,
      });
    }

    favorite = await Favorite.create({
      email: normalizedEmail,
      destination,
    });

    const populated = await Favorite.findById(favorite._id).populate('destination');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Added to favorites',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Already in favorites',
      });
    }
    next(error);
  }
};

// DELETE /api/v1/favorites/:id
// Also supports DELETE /api/v1/favorites?email=...&destination=...
exports.removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, destination } = req.query;

    if (id && id !== 'remove') {
      const deleted = await Favorite.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found',
        });
      }
      return res.json({
        success: true,
        message: 'Removed from favorites',
      });
    }

    if (email && destination) {
      await Favorite.findOneAndDelete({
        email: email.toLowerCase().trim(),
        destination,
      });
      return res.json({
        success: true,
        message: 'Removed from favorites',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Favorite ID or email & destination query params required',
    });
  } catch (error) {
    next(error);
  }
};
