// SANMATI CONSTRUCTIONS ERP - Node.js Express Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', apiRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    app: "SANMATI CONSTRUCTIONS ERP API",
    location: "Kolhapur, Maharashtra, India",
    version: "2.6.0",
    status: "Healthy"
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SANMATI CONSTRUCTIONS ERP Backend Server`);
  console.log(`📍 Location: Kolhapur, Maharashtra, India`);
  console.log(`⚡ Listening on port: ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
