// server.js
require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

// ─── IMPORT ROUTES ─────────────────────────────────────────────────────────
const authRoutes   = require('./routes/authRoutes');
const userRoutes   = require('./routes/userRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// ─── ERROR HANDLERS ────────────────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ─── CORS + COOKIES + BODY PARSING ────────────────────────────────────────
// 1) CORS must allow your frontend origin and credentials
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

// 2) Parse cookies on incoming requests
app.use(cookieParser());

// 3) Parse JSON bodies
app.use(express.json());

// ─── MOUNT ROUTES ─────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/', (_req, res) => res.send('Harihar Infosys Backend Running...'));

// ─── 404 & GLOBAL ERROR HANDLING ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── CONNECT TO MONGODB & START SERVER ────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/harihar-infosys';

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10_000,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
