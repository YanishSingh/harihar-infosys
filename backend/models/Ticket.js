const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const branchSnapshotSchema = new mongoose.Schema({
  branchId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  province:      { type: String, required: true },
  city:          { type: String, required: true },
  municipality:  { type: String, required: true },
  place:         { type: String, required: true },
  phone:         { type: String, required: true },
  isHeadOffice:  { type: Boolean, required: true }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestorName: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issueTitle: {
    type: String,
    required: true
  },
  issueDescription: {
    type: String,
    required: true
  },
  issueType: {
    type: String,
    enum: ['Remote', 'Physical'],
    required: true
  },
  branch: {
    type: branchSnapshotSchema,
    required: function() { return this.issueType === 'Physical'; }
  },
  anyDeskId: {
    type: String,
    required: function() { return this.issueType === 'Remote'; }
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  logs: [
    {
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updateNote: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      displayName: String
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
