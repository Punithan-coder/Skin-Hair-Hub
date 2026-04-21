const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');

const fs = require('fs');
const path = require('path');

// @route   POST /api/appointments
// @desc    Create a new appointment
router.post('/', async (req, res) => {
  try {
    const { patientName, email, phone, appointmentDate, message } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const newAppointment = new Appointment({
        patientName,
        email,
        phone,
        appointmentDate,
        message
      });

      const appointment = await newAppointment.save();
      
      // Send confirmation email
      try {
        await sendEmail({
          email: appointment.email,
          subject: 'Appointment Confirmation - MedService Clinic',
          name: appointment.patientName,
          date: new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          phone: appointment.phone,
          message: 'Your appointment has been received. We will contact you shortly to confirm the exact time.'
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr.message);
      }

      return res.status(201).json(appointment);
    } else {
      // Fallback: Save to local JSON file if MongoDB is down
      console.log('MongoDB not connected. Saving to local fallback file.');
      const appointmentsFilePath = path.join(__dirname, '../appointments.json');
      
      let appointments = [];
      if (fs.existsSync(appointmentsFilePath)) {
        const fileData = fs.readFileSync(appointmentsFilePath);
        appointments = JSON.parse(fileData);
      }
      
      const newAppointment = {
        id: Date.now().toString(),
        patientName,
        email,
        phone,
        appointmentDate,
        message,
        status: 'Requested',
        createdAt: new Date(),
        mode: 'fallback-json'
      };
      
      appointments.push(newAppointment);
      fs.writeFileSync(appointmentsFilePath, JSON.stringify(appointments, null, 2));
      
      // Still try to send email
      try {
        await sendEmail({
          email: newAppointment.email,
          subject: 'Appointment Confirmation (Local) - MedService Clinic',
          name: newAppointment.patientName,
          date: new Date(newAppointment.appointmentDate).toLocaleDateString(),
          phone: newAppointment.phone,
          message: 'Your appointment has been received (stored locally). We will contact you shortly.'
        });
      } catch (emailErr) {
        console.error('Email sending failed (fallback mode):', emailErr.message);
      }

      return res.status(201).json(newAppointment);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/appointments/requested
// @desc    Get all requested appointments
router.get('/requested', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const appointments = await Appointment.find({ status: 'Requested' }).sort({ createdAt: -1 });
      res.json(appointments);
    } else {
      const appointments = getLocalData('appointments').filter(a => a.status === 'Requested');
      res.json(appointments);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/appointments/scheduled
// @desc    Get all scheduled appointments
router.get('/scheduled', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const appointments = await Appointment.find({ status: 'Scheduled' }).sort({ appointmentDate: 1 });
      res.json(appointments);
    } else {
      const appointments = getLocalData('appointments').filter(a => a.status === 'Scheduled');
      res.json(appointments);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/appointments/confirm/:id
// @desc    Confirm and schedule an appointment
router.post('/confirm/:id', async (req, res) => {
  const { doctorName, assignedTime, appointmentDate } = req.body;
  try {
    let appointment;
    if (mongoose.connection.readyState === 1) {
      appointment = await Appointment.findById(req.params.id);
      if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

      appointment.status = 'Scheduled';
      appointment.doctorName = doctorName;
      appointment.assignedTime = assignedTime;
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      
      await appointment.save();
    } else {
      // Local fallback logic
      const appointmentsFilePath = path.join(__dirname, '../appointments.json');
      let appointments = JSON.parse(fs.readFileSync(appointmentsFilePath));
      const index = appointments.findIndex(a => a.id === req.params.id || a._id === req.params.id);
      
      if (index === -1) return res.status(404).json({ msg: 'Appointment not found' });
      
      appointments[index].status = 'Scheduled';
      appointments[index].doctorName = doctorName;
      appointments[index].assignedTime = assignedTime;
      if (appointmentDate) appointments[index].appointmentDate = appointmentDate;
      
      appointment = appointments[index];
      fs.writeFileSync(appointmentsFilePath, JSON.stringify(appointments, null, 2));
    }

    // Send detailed confirmation email
    try {
      await sendEmail({
        email: appointment.email,
        subject: 'Appointment Scheduled - Hair & Skin Clinic',
        name: appointment.patientName,
        date: new Date(appointment.appointmentDate).toLocaleDateString(),
        time: appointment.assignedTime,
        doctor: appointment.doctorName,
        message: `Your appointment has been officially scheduled. We look forward to seeing you!`
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete an appointment (Reject or Remove)
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
      await appointment.deleteOne();
    } else {
      const appointmentsFilePath = path.join(__dirname, '../appointments.json');
      let appointments = JSON.parse(fs.readFileSync(appointmentsFilePath));
      appointments = appointments.filter(a => a.id !== req.params.id && a._id !== req.params.id);
      fs.writeFileSync(appointmentsFilePath, JSON.stringify(appointments, null, 2));
    }
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper for local data
const getLocalData = (filename) => {
  const filePath = path.join(__dirname, `../${filename}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
};

module.exports = router;
