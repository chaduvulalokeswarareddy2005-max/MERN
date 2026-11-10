const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    attractions: {
      type: [String],
      default: [],
    },
    bestTimeToVisit: {
      type: String,
      default: 'Year-round',
    },
    suggestedDuration: {
      type: String,
      default: '3-5 Days',
    },
    estimatedDailyBudget: {
      type: Number,
      default: 3000,
    },
    travelTips: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Slugify helper if not provided
destinationSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

module.exports = mongoose.model('Destination', destinationSchema);
