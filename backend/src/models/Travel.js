import mongoose from 'mongoose';

const travelSchema = new mongoose.Schema({
  travelId: {
    type: String,
    required: true,
    unique: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  destination: {
    country: String,
    city: String,
    address: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  transportation: {
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'taxi', 'other']
    },
    details: String,
    cost: Number
  },
  accommodation: {
    type: {
      type: String,
      enum: ['hotel', 'guesthouse', 'apartment', 'other']
    },
    details: String,
    cost: Number
  },
  dailyAllowance: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    days: Number
  },
  totalEstimatedCost: Number,
  advanceAmount: Number,
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'draft'
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalDate: Date,
  rejectionReason: String,
  itinerary: [{
    date: Date,
    activity: String,
    location: String,
    cost: Number
  }],
  documents: [{
    name: String,
    type: String,
    url: String
  }],
  actualExpenses: [{
    category: String,
    amount: Number,
    date: Date,
    receipt: String,
    description: String
  }],
  isInternational: {
    type: Boolean,
    default: false
  },
  visaRequired: {
    type: Boolean,
    default: false
  },
  visaStatus: {
    type: String,
    enum: ['not-required', 'applied', 'approved', 'rejected']
  }
}, {
  timestamps: true
});

travelSchema.index({ travelId: 1 });
travelSchema.index({ employee: 1, startDate: 1 });

export default mongoose.model('Travel', travelSchema);