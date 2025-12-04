import mongoose from 'mongoose';

const approvalRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  module: {
    type: String,
    enum: ['leave', 'attendance', 'expense', 'travel', 'purchase'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  approvalFlow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalFlow',
    required: true
  },
  currentStep: {
    type: Number,
    default: 1
  },
  approvals: [{
    step: Number,
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comment: String,
    approvedAt: Date,
    rejectedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: Date,
  attachments: [{
    name: String,
    url: String
  }],
  history: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    performedAt: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

approvalRequestSchema.index({ requestId: 1 });
approvalRequestSchema.index({ requester: 1, status: 1 });

export default mongoose.model('ApprovalRequest', approvalRequestSchema);