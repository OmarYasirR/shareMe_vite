import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
  },
  img: {
    data: Buffer,
    contentType: String
  },
  banner: {
    data: Buffer,
    contentType: String
  },
}, { 
  timestamps: true 
})

// Remove any custom validation for now
export default mongoose.model('User', userSchema)