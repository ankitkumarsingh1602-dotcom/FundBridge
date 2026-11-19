import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Campaign, Donation, GroupCircle } from './models.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Campaign.deleteMany({}),
      Donation.deleteMany({}),
      GroupCircle.deleteMany({}),
    ]);

    const [donor, creator, admin] = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'donor@fundbridge.org',
        phone: '+91 98765 43210',
        password: 'Password123!',
        role: 'donor',
        location: 'Bengaluru, Karnataka',
        badges: ['First Supporter', 'Helping Hand', 'Community Hero'],
      },
      {
        name: 'Dr. Meera Nair',
        email: 'creator@fundbridge.org',
        phone: '+91 98201 55443',
        password: 'Password123!',
        role: 'creator',
        location: 'Kochi, Kerala',
        badges: ['First Supporter'],
      },
      {
        name: 'Vikramaditya Rao',
        email: 'admin@fundbridge.org',
        phone: '+91 98111 22334',
        password: 'Password123!',
        role: 'admin',
        location: 'New Delhi, Delhi',
        badges: ['First Supporter', 'Impact Champion'],
      },
    ]);

    const campaigns = await Campaign.create([
      {
        title: 'Solar-Powered Digital Classrooms for 18 Rural Schools',
        category: 'Education',
        location: 'Jaipur, Rajasthan',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        beforeImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
        afterImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        creator: creator._id,
        creatorName: creator.name,
        creatorRole: 'Rural Education Lead',
        creatorAvatar: creator.avatar,
        shortDescription: 'Installing off-grid solar panels and offline STEM learning tablets for 1,400 underserved students.',
        story: 'Over 1,400 students across 18 villages outside Jaipur lose up to four hours of classroom instruction every day due to unreliable grid electricity. Every rupee donated is logged against hardware vendor invoices.',
        beneficiary: '1,400 Government School Students',
        targetAmount: 450000,
        raisedAmount: 368500,
        supportersCount: 284,
        daysLeft: 14,
        status: 'Active',
        isVerified: true,
        trustScore: 96,
        verificationDetails: { identity: 'Verified', documents: 'Verified', bank: 'Verified', transparency: 'Verified' },
        milestones: [
          { title: 'Solar Inverter & Panel Procurement', target: 180000, status: 'Completed', deadline: '2026-10-15' },
          { title: '120 Offline STEM Tablets Delivery', target: 170000, status: 'Completed', deadline: '2026-11-05' },
          { title: 'Teacher Training & Lab Setup', target: 100000, status: 'In Progress', deadline: '2026-12-01' },
        ],
        expenses: [
          { description: 'Luminous 5kW Solar Array (10 Schools)', category: 'Equipment', amount: 178500, date: '2026-10-18' },
          { description: 'Ruggedized STEM Learning Tablets (120 units)', category: 'Hardware', amount: 142000, date: '2026-11-08' },
        ],
      },
      {
        title: 'Urgent Pediatric Heart Surgery for 4-Year-Old Kabir',
        category: 'Medical',
        location: 'Mumbai, Maharashtra',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
        creator: creator._id,
        creatorName: creator.name,
        creatorRole: 'Pediatric Care Coordinator',
        creatorAvatar: creator.avatar,
        shortDescription: 'Life-saving congenital heart defect surgery at Narayana Pediatric Cardiac Centre.',
        story: 'Kabir was diagnosed with Tetralogy of Fallot and requires corrective open-heart surgery within 10 days. Funds are disbursed directly to the hospital billing desk.',
        beneficiary: 'Kabir Deshmukh (Age 4)',
        targetAmount: 320000,
        raisedAmount: 274000,
        supportersCount: 412,
        daysLeft: 6,
        status: 'Urgent',
        isUrgent: true,
        isVerified: true,
        trustScore: 98,
        verificationDetails: { identity: 'Verified', documents: 'Verified', bank: 'Verified', transparency: 'Verified' },
        milestones: [
          { title: 'Pre-Operative Diagnostics & ICU Deposit', target: 90000, status: 'Completed', deadline: '2026-11-12' },
          { title: 'Surgical Procedure & Valve Graft', target: 160000, status: 'In Progress', deadline: '2026-11-24' },
          { title: 'Post-Op Recovery & Medication', target: 70000, status: 'Upcoming', deadline: '2026-12-05' },
        ],
        expenses: [
          { description: 'Hospital Admission & Cardiac Echo', category: 'Hospital Fees', amount: 88000, date: '2026-11-12' },
          { description: 'Surgical Consumables & Blood Bank', category: 'Medicines', amount: 95000, date: '2026-11-16' },
        ],
      },
      {
        title: 'Clean Water Biosand Filters for Flood-Hit Assam Villages',
        category: 'Environment',
        location: 'Guwahati, Assam',
        image: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=1200&q=80',
        creator: creator._id,
        creatorName: creator.name,
        creatorRole: 'Hydrology Engineer',
        creatorAvatar: creator.avatar,
        shortDescription: 'Deploying 300 zero-electricity biosand filtration units to prevent waterborne disease outbreaks.',
        story: 'Seasonal Brahmaputra flooding contaminates shallow handpumps across riverside hamlets. Each locally fabricated biosand filter serves two families for 8+ years.',
        beneficiary: '600 Rural Households',
        targetAmount: 250000,
        raisedAmount: 250000,
        supportersCount: 195,
        daysLeft: 0,
        status: 'Completed',
        isVerified: true,
        trustScore: 95,
        verificationDetails: { identity: 'Verified', documents: 'Verified', bank: 'Verified', transparency: 'Verified' },
      },
    ]);

    await Donation.create([
      {
        campaign: campaigns[0]._id,
        campaignTitle: campaigns[0].title,
        donor: donor._id,
        donorName: donor.name,
        donorAvatar: donor.avatar,
        amount: 15000,
        message: 'Education changes generations. Wishing the students the very best!',
      },
      {
        campaign: campaigns[1]._id,
        campaignTitle: campaigns[1].title,
        donor: donor._id,
        donorName: donor.name,
        donorAvatar: donor.avatar,
        amount: 10000,
        message: 'Praying for Kabir’s speedy recovery.',
      },
    ]);

    await GroupCircle.create({
      name: 'Bengaluru Tech Alumni Giving Circle',
      campaign: campaigns[0]._id,
      campaignTitle: campaigns[0].title,
      targetAmount: 50000,
      collectedAmount: 35000,
      createdBy: donor._id,
      members: [
        { name: 'Aarav Sharma', contributed: 15000 },
        { name: 'Riya Menon', contributed: 10000 },
        { name: 'Karthik Nair', contributed: 10000 },
      ],
    });

    console.log('Seed completed! Demo accounts:');
    console.log('Donor   -> donor@fundbridge.org   / Password123!');
    console.log('Creator -> creator@fundbridge.org / Password123!');
    console.log('Admin   -> admin@fundbridge.org   / Password123!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDatabase();