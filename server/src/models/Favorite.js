const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites for the same user and destination
favoriteSchema.index({ email: 1, destination: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
