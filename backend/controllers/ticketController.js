const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendEmail } = require('../utils/notificationService');

/**
 * Generate a random ticket code: 2 letters [A–Z] + 4 digits [0000–9999]
 */
function generateTicketNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letterPart =
    letters.charAt(Math.floor(Math.random() * letters.length)) +
    letters.charAt(Math.floor(Math.random() * letters.length));
  const numberPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return letterPart + numberPart;
}

// @desc    Company creates a ticket
// @route   POST /api/tickets
// @access  Company
exports.createTicket = async (req, res) => {
  const { issueTitle, issueDescription, issueType, branchId, anyDeskId, requestorName } = req.body;

  if (req.user.role !== 'Company' || !req.user.isApproved) {
    return res.status(403).json({ message: 'Not authorized to create tickets' });
  }
  if (!issueTitle || !issueDescription || !issueType || !requestorName) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  let branchSnapshot;
  if (issueType === 'Physical') {
    if (!branchId) return res.status(400).json({ message: 'branchId is required for Physical tickets.' });
    const branch = req.user.branches.id(branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found.' });
    branchSnapshot = {
      branchId: branch._id,
      province: branch.province,
      city: branch.city,
      municipality: branch.municipality,
      place: branch.place,
      phone: branch.phone,
      isHeadOffice: branch.isHeadOffice
    };
  }
  if (issueType === 'Remote' && !anyDeskId) {
    return res.status(400).json({ message: 'anyDeskId is required for Remote tickets.' });
  }

  let ticketId, exists;
  do {
    ticketId = generateTicketNumber();
    exists = await Ticket.findOne({ ticketId });
  } while (exists);

  const ticket = await Ticket.create({
    ticketId,
    company: req.user._id,
    generatedBy: req.user._id,
    requestorName,
    issueTitle,
    issueDescription,
    issueType,
    branch: branchSnapshot,
    anyDeskId
  });

  // Optionally: send an email to admin when ticket is created (not required for core logic)
  if (process.env.ADMIN_EMAIL) {
    const subject = `Ticket [${ticket.ticketId}] - ${ticket.issueTitle}`;
    let html = `
      <h3>New Ticket Created</h3>
      <p><strong>Company:</strong> ${req.user.companyName}</p>
      <p><strong>Ticket Number:</strong> ${ticket.ticketId}</p>
      <p><strong>Title:</strong> ${ticket.issueTitle}</p>
      <p><strong>Description:</strong> ${ticket.issueDescription}</p>
      <p><strong>Person Facing Issue:</strong> ${ticket.requestorName}</p>
      <p><strong>Issue Type:</strong> ${ticket.issueType}</p>
    `;
    let text = `
Company: ${req.user.companyName}
Ticket Number: ${ticket.ticketId}
Title: ${ticket.issueTitle}
Description: ${ticket.issueDescription}
Person Facing Issue: ${ticket.requestorName}
Issue Type: ${ticket.issueType}
`;

    if (ticket.issueType === 'Physical' && ticket.branch) {
      const b = ticket.branch;
      html += `
        <p><strong>Branch Details:</strong><br/>
           Province: ${b.province}<br/>
           City: ${b.city}<br/>
           Municipality: ${b.municipality}<br/>
           Place: ${b.place}<br/>
           Phone: ${b.phone}
        </p>
      `;
      text += `Branch: ${b.province}, ${b.city}, ${b.municipality}, ${b.place} (Phone: ${b.phone})\n`;
    }

    sendEmail({ to: process.env.ADMIN_EMAIL, subject, text, html }).catch(console.error);
  }

  res.status(201).json(ticket);
};

// @desc    Company views their tickets (paginated & filterable by status)
// @route   GET /api/tickets/company
// @access  Company
exports.getCompanyTickets = async (req, res) => {
  let { page = 1, limit = 10, status } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const filter = { company: req.user._id };
  if (status) filter.status = status;

  const total = await Ticket.countDocuments(filter);
  const tickets = await Ticket
    .find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('assignedTo', 'name')
    .populate('logs.updatedBy', 'name');

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    data: tickets
  });
};

// @desc    Admin views all tickets (paginated & filterable by status, technician, company)
// @route   GET /api/tickets
// @access  Admin
exports.getAllTickets = async (req, res) => {
  let { page = 1, limit = 10, status, technicianId, companyId } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const filter = {};
  if (status) filter.status = status;
  if (technicianId) filter.assignedTo = technicianId;
  if (companyId) filter.company = companyId; // <-- THIS LINE ADDED

  const total = await Ticket.countDocuments(filter);
  const tickets = await Ticket
    .find(filter)
    .populate('company', 'companyName')
    .populate('assignedTo', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    data: tickets
  });
};


// @desc    Get single ticket by ID (for admin, technician, or company that owns the ticket)
// @route   GET /api/tickets/:id
// @access  Admin, Technician (assigned), Company (owns ticket)
exports.getTicketById = async (req, res) => {
  const ticketId = req.params.id;

  const ticket = await Ticket.findById(ticketId)
    .populate('assignedTo', 'name email')
    .populate('company', 'companyName email')
    .populate('logs.updatedBy', 'name email');

  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const user = req.user;
  if (
    user.role === 'Admin' ||
    (user.role === 'Technician' && ticket.assignedTo && ticket.assignedTo._id.equals(user._id)) ||
    (user.role === 'Company' && ticket.company && ticket.company._id.equals(user._id))
  ) {
    return res.json(ticket);
  }

  return res.status(403).json({ message: "Not authorized to view this ticket" });
};

// @desc    Admin assigns a technician
// @route   PUT /api/tickets/:id/assign
// @access  Admin
exports.assignTicket = async (req, res) => {
  const { technicianId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const techUser = await User.findById(technicianId);
  ticket.assignedTo = technicianId;
  ticket.status = 'Assigned';

  const techName = techUser ? techUser.name : technicianId;
  ticket.logs.push({
    updatedBy: req.user._id,
    updateNote: `Assigned to technician ${techName}`
  });
  await ticket.save();

  try {
    if (techUser && techUser.email) {
      await sendEmail({
        to: techUser.email,
        subject: `Ticket Dispatched: [${ticket.ticketId}] - ${ticket.issueTitle}`,
        text: `You have been assigned ticket ${ticket.ticketId}. Please review the details.`,
        html: `<p>You have been assigned ticket <b>${ticket.ticketId}</b>: <em>${ticket.issueTitle}</em>.</p>`
      });
    }
  } catch (err) {
    console.error('Error sending assignment email:', err);
  }

  res.json(ticket);
};

// @desc    Admin changes ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Admin
exports.changeStatus = async (req, res) => {
  const { status } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.status = status;
  ticket.logs.push({
    updatedBy: req.user._id,
    updateNote: `Status updated to "${status}"`,
    timestamp: new Date(),
  });
  await ticket.save();
  res.json(ticket);
};

// @desc    Technician updates ticket status/log
// @route   PUT /api/tickets/:id/status
// @access  Technician
exports.updateTicketStatus = async (req, res) => {
  const { status, updateNote } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (req.user.role !== 'Technician') {
    return res.status(403).json({ message: 'Not authorized to update status' });
  }

  ticket.status = status;
  ticket.logs.push({
    updatedBy: req.user._id,
    updateNote,
    displayName: req.user.name,
    timestamp: new Date(),
  });
  await ticket.save();

  // Email to company, if needed

  res.json(ticket);
};

// --- Add a log/update to a ticket ---
exports.addTicketLog = async (req, res) => {
  const ticketId = req.params.id;
  const { updateNote, displayName } = req.body;
  const user = req.user;

  if (!updateNote || !updateNote.trim()) {
    return res.status(400).json({ message: 'Update note required.' });
  }

  // Fetch ticket and company/requestor info
  const ticket = await Ticket.findById(ticketId)
    .populate('company', '_id companyName')
    .populate('assignedTo', '_id');

  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const canCompany =
    user.role === 'Company' &&
    ticket.company &&
    ticket.company._id.equals(user._id) &&
    ['Assigned', 'In Progress', 'Completed'].includes(ticket.status);

  const canTechnician =
    user.role === 'Technician' &&
    ticket.assignedTo &&
    ticket.assignedTo._id.equals(user._id);

  const canAdmin = user.role === 'Admin';

  if (!(canCompany || canTechnician || canAdmin)) {
    return res.status(403).json({ message: 'Not authorized to add logs for this ticket' });
  }

  // --- Use displayName from request, else fallback logic ---
  let finalDisplayName = displayName && displayName.trim();
  if (!finalDisplayName) {
    if (user.role === 'Company') {
      finalDisplayName = ticket.requestorName || ticket.company?.companyName || user.name;
    } else {
      finalDisplayName = user.name;
    }
  }

  ticket.logs.push({
    updatedBy: user._id,
    displayName: finalDisplayName,
    updateNote,
    timestamp: new Date(),
  });
  await ticket.save();

  res.status(201).json({ message: 'Log added', log: ticket.logs[ticket.logs.length - 1] });
};
