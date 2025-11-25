const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const adminAuthRoutes = require('./src/routes/adminAuthRoutes');
const adminHotelRoutes = require('./src/routes/adminHotelRoutes');
const adminModuleRoutes = require('./src/routes/adminModuleRoutes');
const adminScheduleRoutes = require('./src/routes/adminScheduleRoutes');
const adminManagementRoutes = require('./src/routes/adminManagementRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const voucherRoutes = require('./src/routes/voucherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/hotels', adminHotelRoutes);
app.use('/api/admin/modules', adminModuleRoutes);
app.use('/api/admin/schedules', adminScheduleRoutes);
app.use('/api/admin/admins', adminManagementRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/vouchers', voucherRoutes);

// Public API for dropdowns (Reusing controllers but bypassing auth for these specific routes)
// Note: In a real app, we might want separate controllers or cleaner route structure.
const AdminHotelController = require('./src/controllers/adminHotelController');
const AdminModuleController = require('./src/controllers/adminModuleController');
const AdminScheduleController = require('./src/controllers/adminScheduleController');

app.get('/api/public/hotels', AdminHotelController.getAll);
app.get('/api/public/modules', AdminModuleController.getAll);
app.get('/api/public/schedules', AdminScheduleController.getAll);

// Public endpoint for admin registration (no auth required)
const AdminManagementController = require('./src/controllers/adminManagementController');
app.post('/api/public/register-admin', AdminManagementController.create);

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-register.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/admin/hotels', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-hotels.html'));
});

app.get('/admin/modules', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-modules.html'));
});

app.get('/admin/schedules', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-schedules.html'));
});

app.get('/admin/admins', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-admins.html'));
});

app.get('/admin/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-reports.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
