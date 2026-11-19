import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { User, Campaign, Donation, GroupCircle, Notification } from './models.js';
import { protect, optionalAuth, authorizeRoles } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FundBridge API', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }
    const safeRole = ['donor', 'creator'].includes(role) ? role : 'donor';
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: safeRole,
      badges: ['First Supporter'],
    });
    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

app.patch('/api/auth/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'bio', 'avatar', 'interests'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/wishlist/:campaignId', protect, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const exists = req.user.wishlist.some((id) => id.toString() === campaignId);
    if (exists) {
      req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== campaignId);
    } else {
      req.user.wishlist.push(campaignId);
    }
    await req.user.save();
    res.json({ wishlist: req.user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== CAMPAIGN ROUTES ====================
app.get('/api/campaigns', async (req, res) => {
  try {
    const { search, category, location, status, verified, sort } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (location && location !== 'All') filter.location = new RegExp(location, 'i');
    if (verified === 'true') filter.isVerified = true;
    if (status && status !== 'All') {
      if (status === 'Urgent') filter.isUrgent = true;
      else filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { shortDescription: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'most_funded') sortOption = { raisedAmount: -1 };
    if (sort === 'ending_soon') sortOption = { daysLeft: 1 };
    if (sort === 'popular') sortOption = { supportersCount: -1 };

    const campaigns = await Campaign.find(filter).sort(sortOption);
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    const donations = await Donation.find({ campaign: campaign._id }).sort({ createdAt: -1 }).limit(25);
    res.json({ campaign, donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/campaigns', protect, async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      creator: req.user._id,
      creatorName: req.user.name,
      creatorAvatar: req.user.avatar,
      status: 'Pending',
      isVerified: false,
      trustScore: 84,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Campaign Submitted for Review',
      message: `"${campaign.title}" is now live and queued for verification review.`,
      type: 'verification',
    });

    res.status(201).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/campaigns/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this campaign.' });
    }
    Object.assign(campaign, req.body);
    await campaign.save();
    res.json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/campaigns/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (campaign.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this campaign.' });
    }
    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== EXPENSES, MILESTONES, UPDATES & Q&A ====================
app.post('/api/campaigns/:id/expenses', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    campaign.expenses.push(req.body);
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/campaigns/:id/milestones', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    campaign.milestones.push(req.body);
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/campaigns/:id/milestones/:milestoneId', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    const milestone = campaign.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
    milestone.status = req.body.status || milestone.status;
    await campaign.save();
    res.json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/campaigns/:id/updates', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    campaign.updates.unshift(req.body);
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/campaigns/:id/qa', optionalAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    campaign.qa.push({
      question: req.body.question,
      askedBy: req.user ? req.user.name : req.body.askedBy || 'Community Visitor',
    });
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/campaigns/:id/qa/:qaId', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    const item = campaign.qa.id(req.params.qaId);
    if (!item) return res.status(404).json({ message: 'Question not found.' });
    item.answer = req.body.answer;
    await campaign.save();
    res.json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==================== DONATIONS & IMPACT PASSPORT ====================
app.post('/api/donations', optionalAuth, async (req, res) => {
  try {
    const { campaignId, amount, isAnonymous, message, donorName } = req.body;
    const numericAmount = Number(amount);
    if (!campaignId || !numericAmount || numericAmount < 10) {
      return res.status(400).json({ message: 'Valid campaignId and minimum ₹10 amount required.' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const finalDonorName = isAnonymous
      ? 'Anonymous Supporter'
      : req.user?.name || donorName || 'Generous Supporter';

    const donation = await Donation.create({
      campaign: campaign._id,
      campaignTitle: campaign.title,
      donor: req.user?._id || null,
      donorName: finalDonorName,
      donorAvatar: req.user?.avatar || '',
      amount: numericAmount,
      isAnonymous: Boolean(isAnonymous),
      message: message || '',
    });

    campaign.raisedAmount += numericAmount;
    campaign.supportersCount += 1;
    if (campaign.raisedAmount >= campaign.targetAmount && campaign.status !== 'Completed') {
      campaign.status = 'Completed';
    }
    await campaign.save();

    if (req.user) {
      const userDonations = await Donation.find({ donor: req.user._id });
      const totalGiven = userDonations.reduce((acc, d) => acc + d.amount, 0);
      const badgeSet = new Set(req.user.badges);
      badgeSet.add('First Supporter');
      if (userDonations.length >= 3) badgeSet.add('Helping Hand');
      if (totalGiven >= 10000) badgeSet.add('Community Hero');
      if (totalGiven >= 25000) badgeSet.add('Impact Champion');
      req.user.badges = Array.from(badgeSet);
      await req.user.save();
    }

    await Notification.create({
      user: campaign.creator,
      title: 'New Contribution Received',
      message: `${finalDonorName} contributed ₹${numericAmount.toLocaleString('en-IN')} to "${campaign.title}".`,
      type: 'donation',
    });

    res.status(201).json({ donation, campaign, badges: req.user?.badges || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/donations/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GROUP GIVING CIRCLES ====================
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await GroupCircle.find().sort({ createdAt: -1 });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/groups', protect, async (req, res) => {
  try {
    const { name, campaignId, targetAmount, initialContribution } = req.body;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const contrib = Number(initialContribution) || 0;
    const group = await GroupCircle.create({
      name,
      campaign: campaign._id,
      campaignTitle: campaign.title,
      targetAmount: Number(targetAmount),
      collectedAmount: contrib,
      createdBy: req.user._id,
      members: [{ name: req.user.name, contributed: contrib, avatar: req.user.avatar }],
    });

    res.status(201).json({ group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/groups/:id/contribute', protect, async (req, res) => {
  try {
    const group = await GroupCircle.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group circle not found.' });
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid contribution amount.' });

    group.members.push({ name: req.user.name, contributed: amount, avatar: req.user.avatar });
    group.collectedAmount += amount;
    await group.save();

    res.json({ group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==================== NOTIFICATIONS & ADMIN ====================
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/overview', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users, campaigns, donations] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Campaign.find().sort({ createdAt: -1 }),
      Donation.find().sort({ createdAt: -1 }),
    ]);
    res.json({
      stats: {
        totalUsers: users.length,
        totalCampaigns: campaigns.length,
        totalRaised: campaigns.reduce((sum, c) => sum + c.raisedAmount, 0),
        pendingVerifications: campaigns.filter((c) => !c.isVerified).length,
      },
      users,
      campaigns,
      donations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/admin/campaigns/:id/verify', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { isVerified, status, trustScore } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: Boolean(isVerified),
        status: status || (isVerified ? 'Active' : 'Pending'),
        trustScore: trustScore || (isVerified ? 95 : 65),
        'verificationDetails.identity': isVerified ? 'Verified' : 'Pending',
        'verificationDetails.documents': isVerified ? 'Verified' : 'Pending',
        'verificationDetails.bank': isVerified ? 'Verified' : 'Pending',
      },
      { new: true }
    );
    res.json({ campaign });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => console.log(`FundBridge API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });