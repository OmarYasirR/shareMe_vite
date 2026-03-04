import mongoose from 'mongoose'

const Schema = mongoose.Schema

const commentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true })

const pinsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  img: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  createdUser: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},
  save: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: {
    type: [String],
    default: []
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  category: {
    type: String,
    required: true
  }
}, { timestamps: true })

const Pins = mongoose.model('Pins', pinsSchema)

export default Pins