import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    nationality: String,
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  employmentInfo: {
    department: { type: String, required: true },
    position: { type: String, required: true },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'intern'] },
    joinDate: { type: Date, required: true },
    probationEndDate: Date,
    confirmationDate: Date,
    resignationDate: Date,
    status: { type: String, enum: ['active', 'inactive', 'terminated', 'on-leave'], default: 'active' }
  },
  compensation: {
    basicSalary: Number,
    allowances: [{
      type: String,
      amount: Number
    }],
    currency: { type: String, default: 'USD' }
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  subordinates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  workLocation: {
    type: String,
    enum: ['office', 'remote', 'hybrid'],
    default: 'office'
  },
  skills: [String],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }]
}, {
  timestamps: true
});

employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'personalInfo.email': 1 });

export default mongoose.model('Employee', employeeSchema);