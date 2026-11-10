const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    meals: { type: String, default: 'Breakfast included' },
    accommodation: { type: String, default: 'Standard / Deluxe Hotel' },
  },
  { _id: false }
);

const tourPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
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
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: 1,
    },
    durationNights: {
      type: Number,
      required: [true, 'Duration in nights is required'],
      min: 0,
    },
    pricePerTraveler: {
      type: Number,
      required: [true, 'Price per traveler is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: [itineraryDaySchema],
      default: [],
    },
    departureDates: {
      type: [String], // Array of date strings like '2026-11-15'
      default: [],
    },
    capacity: {
      type: Number,
      default: 20,
      min: 1,
    },
    averageRating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 24,
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

tourPackageSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

module.exports = mongoose.model('TourPackage', tourPackageSchema);
