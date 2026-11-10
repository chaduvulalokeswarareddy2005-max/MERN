const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    day: { type: Number, default: 1 },
    date: { type: Date },
    time: { type: String, default: '09:00 AM' },
    title: { type: String, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    cost: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    category: { type: String, default: 'General' },
  },
  { _id: true }
);

const budgetExpensesSchema = new mongoose.Schema(
  {
    transportation: { type: Number, default: 0, min: 0 },
    accommodation: { type: Number, default: 0, min: 0 },
    food: { type: Number, default: 0, min: 0 },
    activities: { type: Number, default: 0, min: 0 },
    shopping: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const defaultChecklist = [
  { text: 'Prepare identification documents', completed: false, category: 'Documents' },
  { text: 'Pack clothes', completed: false, category: 'Packing' },
  { text: 'Prepare toiletries', completed: false, category: 'Packing' },
  { text: 'Arrange transportation', completed: false, category: 'Travel' },
  { text: 'Confirm accommodation details', completed: false, category: 'Booking' },
  { text: 'Carry chargers', completed: false, category: 'Electronics' },
  { text: 'Review the itinerary', completed: false, category: 'Planning' },
];

const tripSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    travelers: {
      type: Number,
      default: 1,
      min: 1,
    },
    targetBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    activities: {
      type: [activitySchema],
      default: [],
    },
    budgetExpenses: {
      type: budgetExpensesSchema,
      default: () => ({
        transportation: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        other: 0,
      }),
    },
    totalPlannedExpenses: {
      type: Number,
      default: 0,
    },
    checklist: {
      type: [checklistItemSchema],
      default: () => defaultChecklist.map(item => ({ ...item })),
    },
    linkedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Authoritative calculation before saving
tripSchema.pre('save', function (next) {
  if (this.budgetExpenses) {
    const b = this.budgetExpenses;
    const transportation = Math.round(Number(b.transportation) || 0);
    const accommodation = Math.round(Number(b.accommodation) || 0);
    const food = Math.round(Number(b.food) || 0);
    const activitiesExp = Math.round(Number(b.activities) || 0);
    const shopping = Math.round(Number(b.shopping) || 0);
    const other = Math.round(Number(b.other) || 0);

    this.budgetExpenses.transportation = transportation;
    this.budgetExpenses.accommodation = accommodation;
    this.budgetExpenses.food = food;
    this.budgetExpenses.activities = activitiesExp;
    this.budgetExpenses.shopping = shopping;
    this.budgetExpenses.other = other;

    this.totalPlannedExpenses = transportation + accommodation + food + activitiesExp + shopping + other;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
module.exports.defaultChecklist = defaultChecklist;
