const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Mock stats for the dashboard
router.get('/stats', async (req, res) => {
  try {
    let appointmentCount = 0;
    
    // Check local fallback file
    const appointmentsFilePath = path.join(__dirname, '../appointments.json');
    if (fs.existsSync(appointmentsFilePath)) {
      const data = fs.readFileSync(appointmentsFilePath);
      appointmentCount = JSON.parse(data).length;
    }

    // Mock other data as requested
    const stats = {
      appointments: appointmentCount,
      patients: appointmentCount + 120, // Mocked
      staff: 24,
      revenue: appointmentCount * 1500 + 45000,
      equipmentUsage: [
        { name: 'Laser Devices', value: 40 },
        { name: 'Skincare Inst.', value: 30 },
        { name: 'Diagnostic Tools', value: 20 },
        { name: 'Others', value: 10 },
      ],
      clinicOutcomes: [
        { month: 'Jan', recovery: 85, improvement: 70 },
        { month: 'Feb', recovery: 88, improvement: 75 },
        { month: 'Mar', recovery: 92, improvement: 80 },
        { month: 'Apr', recovery: 90, improvement: 85 },
      ],
      successMetrics: [
        { service: 'Laser Hair Removal', successRate: '98%', satisfaction: '4.9/5' },
        { service: 'Chemical Peel', successRate: '95%', satisfaction: '4.7/5' },
        { service: 'Dermal Fillers', successRate: '99%', satisfaction: '5.0/5' },
        { service: 'Acne Treatment', successRate: '92%', satisfaction: '4.5/5' },
      ]
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Hardcoded for demo/initial setup
  if (email === 'admin@clinic.com' && password === 'admin123') {
    res.json({ token: 'mock-jwt-token', user: { name: 'Admin', role: 'admin' } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
