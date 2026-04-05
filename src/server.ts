import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './features/auth/auth.routes';
import recordsRoutes from './features/records/records.routes';
import dashboardRoutes from './features/dashboard/dashboard.routes';
import { globalErrorHandler } from './core/middlewares/error.middleware'; // <-- Import

const app = express();

app.use(helmet());
app.use(cors());   
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Finance API is running!' });
});

// VERY IMPORTANT: Error handling middleware goes AFTER all routes
app.use(globalErrorHandler);

export default app;