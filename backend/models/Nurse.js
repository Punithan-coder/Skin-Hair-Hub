const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  assignments: [{
    task: String,
    date: Date,
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Nurse', nurseSchema);
