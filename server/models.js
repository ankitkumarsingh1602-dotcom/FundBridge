import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['donor', 'creator', 'admin'], default: 'donor' },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    location: { type: String, default: 'India' },
    bio: { type: String, default: 'Supporting transparent social impact.' },
    interests: [{ type: String }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
    badges: [{ type: String }],
    passportId: { type: String, unique: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.passportId) {
    this.passportId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  description: { type: String, default: '' },
  deadline: { type: String, default: '' },
  status: { type: String, enum: ['Upcoming', 'In Progress', 'Completed'], default: 'Upcoming' },
});

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  receiptUrl: { type: String, default: '' },
  verifiedByAdmin: { type: Boolean, default: true },
});

const updateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
});

const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  askedBy: { type: String, required: true },
  answer: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
});

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorName: { type: String, required: true },
    creatorRole: { type: String, default: 'Campaign Organizer' },
    creatorAvatar: { type: String, default: '' },
    shortDescription: { type: String, required: true },
    story: { type: String, required: true },
    beneficiary: { type: String, default: '' },
    targetAmount: { type: Number, required: true, min: 100 },
    raisedAmount: { type: Number, default: 0 },
    supportersCount: { type: Number, default: 0 },
    daysLeft: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['Active', 'Urgent', 'Completed', 'Paused', 'Pending'],
      default: 'Active',
    },
    isUrgent: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 75, min: 0, max: 100 },
    verificationDetails: {
      identity: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Not Submitted'], default: 'Pending' },
      documents: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Not Submitted'], default: 'Pending' },
      bank: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Not Submitted'], default: 'Pending' },
      transparency: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Not Submitted'], default: 'Verified' },
    },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    milestones: [milestoneSchema],
    expenses: [expenseSchema],
    updates: [updateSchema],
    qa: [qaSchema],
    reportedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const donationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    campaignTitle: { type: String, required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    donorName: { type: String, required: true },
    donorAvatar: { type: String, default: '' },
    amount: { type: Number, required: true, min: 10 },
    isAnonymous: { type: Boolean, default: false },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
    transactionRef: {
      type: String,
      default: () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
  },
  { timestamps: true }
);

const groupCircleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    campaignTitle: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    collectedAmount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [
      {
        name: { type: String, required: true },
        contributed: { type: Number, default: 0 },
        avatar: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['donation', 'milestone', 'verification', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export const Campaign = mongoose.model('Campaign', campaignSchema);
export const Donation = mongoose.model('Donation', donationSchema);
export const GroupCircle = mongoose.model('GroupCircle', groupCircleSchema);
export const Notification = mongoose.model('Notification', notificationSchema);