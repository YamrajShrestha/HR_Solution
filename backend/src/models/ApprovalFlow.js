import mongoose from 'mongoose';

const approvalFlowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  module: {
    type: String,
    enum: ['leave', 'attendance', 'expense', 'travel', 'purchase'],
    required: true
  },
  steps: [{
    step: { type: Number, required: true },
    approverType: {
      type: String,
      enum: ['manager', 'hr', 'specific-user', 'role-based'],
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    role: String,
    isParallel: { type: Boolean, default: false },
    requiredApprovals: { type: Number, default: 1 },
    conditions: [{
      field: String,
      operator: String,
      value: String
    }],
    actions: {
      autoApprove: { type: Boolean, default: false },
      autoReject: { type: Boolean, default: false },
      escalation: {
        enabled: { type: Boolean, default: false },
        afterHours: Number,
        escalateTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee'
        }
      }
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: String
}, {
  timestamps: true
});

export default mongoose.model('ApprovalFlow', approvalFlowSchema);