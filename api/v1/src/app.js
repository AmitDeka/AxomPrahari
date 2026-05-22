import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import citizenRoutes from './routes/citizen.routes.js';
import adminRoutes from './routes/admin.routes.js';
import violationAdminRoutes from './routes/violation.admin.routes.js';
import reportCitizenRoutes from './routes/report.citizen.routes.js';
import reportAdminRoutes from './routes/report.admin.routes.js';
import citizenAdminRoutes from './routes/citizen.admin.routes.js';
import notificationRoutes from './routes/notification.admin.routes.js';

const app = express();


// 1. Global Security Shield - Helmet
app.use(helmet());

// 2. Strict CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://axomprahari.assam.gov.in', 'http://localhost:3000', 'http://localhost:5173']; 
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/citizen/reports', reportCitizenRoutes);
app.use('/api/v1/citizen', citizenRoutes);
app.use('/api/v1/admin/violations', violationAdminRoutes);
app.use('/api/v1/admin/reports', reportAdminRoutes);
app.use('/api/v1/admin/citizens', citizenAdminRoutes);
app.use('/api/v1/admin/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Axom Prahari API is running' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 3. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    message: isProduction && statusCode === 500 
      ? 'Internal Server Error' 
      : err.message,
    // Strictly prevent stack traces from leaking to the client in production mode
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
});

export default app;
