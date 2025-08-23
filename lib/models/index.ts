import mongoose, { InferSchemaType } from 'mongoose'

// =======================
// User Schema
// =======================
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
})
userSchema.index({ email: 1 })
export type UserDoc = InferSchemaType<typeof userSchema>

// =======================
// Page Schema
// =======================
const pageSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Sin título', trim: true },
  content: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: [
        'paragraph', 'heading1', 'heading2', 'heading3', 
        'bulletList', 'numberedList', 'quote', 'code', 
        'divider', 'image', 'video', 'callout', 'toggle', 
        'checklist', 'bookmark', 'math'
      ]
    },
    content: { type: String, default: '' },
    children: [{ type: mongoose.Schema.Types.Mixed }],
    formatting: {
      bold: { type: Boolean, default: false },
      italic: { type: Boolean, default: false },
      underline: { type: Boolean, default: false },
      strikethrough: { type: Boolean, default: false },
      code: { type: Boolean, default: false }
    }
  }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, maxlength: 10 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})
pageSchema.index({ userId: 1, createdAt: -1 })
pageSchema.index({ parentId: 1 })
pageSchema.index({ userId: 1, title: 'text', 'content.content': 'text' })
export type PageDoc = InferSchemaType<typeof pageSchema>

// =======================
// Comment Schema
// =======================
const commentSchema = new mongoose.Schema({
  blockId: { type: String, required: true },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true, trim: true },
  content: { type: String, required: true, maxlength: 1000 },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})
commentSchema.index({ pageId: 1, resolved: 1 })
commentSchema.index({ userId: 1 })
export type CommentDoc = InferSchemaType<typeof commentSchema>

// =======================
// Activity Log Schema
// =======================
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true, trim: true },
  action: { type: String, required: true, enum: ['created', 'updated', 'deleted', 'commented', 'shared'] },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  pageTitle: { type: String, required: true, trim: true },
  details: { type: String, maxlength: 500 },
  timestamp: { type: Date, default: Date.now }
})
activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ pageId: 1 })
export type ActivityLogDoc = InferSchemaType<typeof activityLogSchema>

// =======================
// Shared Page Schema
// =======================
const sharedPageSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  shareId: { type: String, required: true, unique: true },
  permissions: { type: String, enum: ['read', 'write'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null }
})
sharedPageSchema.index({ shareId: 1 })
sharedPageSchema.index({ pageId: 1 })
sharedPageSchema.index({ createdBy: 1 })
export type SharedPageDoc = InferSchemaType<typeof sharedPageSchema>

// =======================
// Workspace Schema
// =======================
const workspaceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  settings: {
    theme: { type: String, default: 'light', enum: ['light', 'dark'] },
    palette: { type: String, default: 'Lavanda' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})
workspaceSchema.index({ userId: 1 })
export type WorkspaceDoc = InferSchemaType<typeof workspaceSchema>

// =======================
// Export models
// =======================
export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Page = mongoose.models.Page || mongoose.model('Page', pageSchema)
export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema)
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema)
export const SharedPage = mongoose.models.SharedPage || mongoose.model('SharedPage', sharedPageSchema)
export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema)
