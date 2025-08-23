import mongoose, { Mongoose } from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/notion-clone"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  } | undefined
}

// ✅ garantizamos que cached siempre tiene un valor
const cached: {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
} = global._mongooseCache ?? { conn: null, promise: null }

global._mongooseCache = cached

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
