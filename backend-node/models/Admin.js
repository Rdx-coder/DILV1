const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function isStrongPassword(value = '') {
  // Minimum 12 chars with uppercase, lowercase, digit, and special character.
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/.test(String(value));
}

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        if (!this.isModified('password')) return true;
        return isStrongPassword(value);
      },
      message: 'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.'
    }
  },
  name: {
    type: String,
    default: 'Admin'
  },
  role: {
    type: String,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
Admin.isStrongPassword = isStrongPassword;

module.exports = Admin;
