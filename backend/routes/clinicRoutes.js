const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Patient = require('../models/Patient');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper for JSON fallback
const saveToLocal = (filename, data) => {
  const filePath = path.join(__dirname, `../data/${filename}.json`);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  
  let currentData = [];
  if (fs.existsSync(filePath)) {
    currentData = JSON.parse(fs.readFileSync(filePath));
  }
  currentData.push(data);
  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
};

const getLocalData = (filename) => {
  const filePath = path.join(__dirname, `../data/${filename}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
};

// --- DOCTORS ---
router.get('/doctors', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doctors = await Doctor.find();
      res.json(doctors);
    } else {
      res.json(getLocalData('doctors'));
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/doctors', async (req, res) => {
  const doctor = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const newDoctor = new Doctor(doctor);
      await newDoctor.save();
      res.status(201).json(newDoctor);
    } else {
      doctor._id = Date.now().toString();
      saveToLocal('doctors', doctor);
      res.status(201).json(doctor);
    }
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- NURSES ---
router.get('/nurses', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const nurses = await Nurse.find();
      res.json(nurses);
    } else {
      res.json(getLocalData('nurses'));
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/nurses', async (req, res) => {
  const nurse = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const newNurse = new Nurse(nurse);
      await newNurse.save();
      res.status(201).json(newNurse);
    } else {
      nurse._id = Date.now().toString();
      saveToLocal('nurses', nurse);
      res.status(201).json(nurse);
    }
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- PATIENTS ---
router.get('/patients', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const patients = await Patient.find();
      res.json(patients);
    } else {
      res.json(getLocalData('patients'));
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/patients', async (req, res) => {
  const patient = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const newPatient = new Patient(patient);
      await newPatient.save();
      res.status(201).json(newPatient);
    } else {
      patient._id = Date.now().toString();
      saveToLocal('patients', patient);
      res.status(201).json(patient);
    }
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- PHARMACY / PRODUCTS ---
router.get('/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find();
      res.json(products);
    } else {
      res.json(getLocalData('products'));
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/products', async (req, res) => {
  const product = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const newProduct = new Product(product);
      await newProduct.save();
      res.status(201).json(newProduct);
    } else {
      product._id = Date.now().toString();
      saveToLocal('products', product);
      res.status(201).json(product);
    }
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
