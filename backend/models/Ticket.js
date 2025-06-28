// backend/models/Ticket.js

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

  // For Physical issues: snapshot of the chosen branch
  branch: {
    type: branchSnapshotSchema,
    required: function() { return this.issueType === 'Physical'; }
  },

  // For Remote issues: AnyDesk ID provided by the user
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
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
