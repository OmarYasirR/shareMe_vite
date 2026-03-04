import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import {pinsRoutes} from './Routes/pinRoutes.js'
import {userRoutes} from './Routes/userRoutes.js'
import cors from 'cors'
import path from 'path';

dotenv.config()

const app = express()


app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userId']
}))

// Handle preflight requests
app.options('*', cors())

app.use(express.json({ limit: '50mb' })) // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.use('/pins', pinsRoutes)
app.use('/user', userRoutes)



// Health check route
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running!' })
})

console.log(process.env.MONGO_URI)

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('listing on port #### ',process.env.PORT))
}).catch(err => console.log(err))