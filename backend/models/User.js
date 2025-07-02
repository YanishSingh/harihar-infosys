const mongoose = require('mongoose');

// Sub-schema for each branch office
const branchSchema = new mongoose.Schema({
  province: {
    type: String,
    required: true  // e.g. "Province No. 3"
  },
  city: {
    type: String,
    required: true  // e.g. "Kathmandu"
  },
  municipality: {
    type: String,
    required: true  // e.g. "Kathmandu Metropolitan"
  },
  place: {
    type: String,
    required: true  // e.g. "Baneshwor"
  },
  phone: {
    type: String,
    required: true  // branch-specific phone
  },
  isHeadOffice: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Validator: Companies must have at least one branch and exactly one head office
function branchesValidator(arr) {
  if (this.role !== 'Company') return true;
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const headCount = arr.filter(b => b.isHeadOffice).length;
  return headCount === 1;
}

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['Admin', 'Technician', 'Company'],
    required: true
  },

  // Common
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },

  // Company-specific
  companyName: {
    type: String,
    required: function() { return this.role === 'Company'; }
  },
  businessType: {
    type: String,
    required: function() { return this.role === 'Company'; }
  },
  vatOrPan: {
    type: String,
    required: function() { return this.role === 'Company'; }
  },
  branches: {
    type: [branchSchema],
    validate: [branchesValidator, 'Companies must have at least one branch and exactly one head office.']
  },

  // Approval
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'Company';
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
