import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    type: { type: String, enum: ['office', 'remote', 'field'], default: 'office' },
    note: String,
    image: String
  },
  checkOut: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    type: { type: String, enum: ['office', 'remote', 'field'], default: 'office' },
    note: String,
    image: String
  },
  workHours: Number,
  overtimeHours: Number,
  breakHours: Number,
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
    default: 'present'
  },
  lateReason: String,
  isRemote: {
    type: Boolean,
    default: false
  },
  geoFencing: {
    isValid: { type: Boolean, default: true },
    violationReason: String
  }
}, {
  timestamps: true
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

export default mongoose.model('Attendance', attendanceSchema);