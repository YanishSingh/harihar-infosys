// server.js ---------------------------------------------------------------
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

// ─── ROUTES ────────────────────────────────────────────────────────────────
const authRoutes   = require('./routes/authRoutes');
const userRoutes   = require('./routes/userRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// ─── ERROR HANDLERS ────────────────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

mongoose.set('strictQuery', false);          // silence deprecation warning

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ─── ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/tickets', ticketRoutes);

// Health-check
app.get('/', (_req, res) => res.send('Harihar Infosys Backend Running...'));

// ─── 404 NOT FOUND ─────────────────────────────────────────────────────────
app.use(notFound);

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── DATABASE & SERVER BOOTSTRAP ───────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/harihar-infosys';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10_000   // fail fast if DB unreachable
    });
    console.log('✅ MongoDB connected');

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);                       // crash-only philosophy
  }
}

startServer();

module.exports = app;                      // for unit / integration tests
