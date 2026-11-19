import React, { useState, useEffect, useContext, createContext, useMemo, useRef } from 'react';
import {
  Heart, ShieldCheck, TrendingUp, Users, Search, Filter, ArrowRight, PlusCircle,
  CheckCircle2, AlertTriangle, Clock, MapPin, Share2, Bookmark, Sparkles,
  FileText, Upload, DollarSign, Award, Bell, Menu, X, Eye, EyeOff, Edit3,
  Trash2, PauseCircle, PlayCircle, ChevronRight, ChevronLeft, MessageSquare,
  Send, BarChart3, PieChart as PieChartIcon, Lock, UserCheck, Building2,
  Stethoscope, GraduationCap, Rocket, Leaf, Globe, Cpu, Siren, HandHeart,
  PawPrint, ExternalLink, Info, HelpCircle, RefreshCw, Layers, ShieldAlert,
  Check, AlertCircle, Calendar, CreditCard, Receipt, Target, Zap, Star
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { api } from './services/api';

// ============================================================================
// 1. UTILITIES & HELPERS
// ============================================================================

const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatCompactINR = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

const calcPercentage = (raised, target) => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
};

const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const CATEGORIES = [
  { id: 'Education', label: 'Education', icon: GraduationCap, color: '#635BFF', bg: '#EEF2FF' },
  { id: 'Medical', label: 'Medical', icon: Stethoscope, color: '#EF4444', bg: '#FEF2F2' },
  { id: 'Startup', label: 'Startup', icon: Rocket, color: '#0EA5E9', bg: '#F0F9FF' },
  { id: 'Environment', label: 'Environment', icon: Leaf, color: '#16A34A', bg: '#F0FDF4' },
  { id: 'Social Causes', label: 'Social Causes', icon: HandHeart, color: '#EC4899', bg: '#FDF2F8' },
  { id: 'Technology', label: 'Technology', icon: Cpu, color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'Emergency', label: 'Emergency', icon: Siren, color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'Community Development', label: 'Community Development', icon: Building2, color: '#14B8A6', bg: '#F0FDFA' },
  { id: 'Animal Welfare', label: 'Animal Welfare', icon: PawPrint, color: '#F97316', bg: '#FFF7ED' },
];

// Clean SVG Data URLs for reliable, fast-loading campaign visuals & receipts
const createIllustrationSVG = (title, subtitle, c1, c2, badgeText = 'VERIFIED IMPACT') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="680" cy="90" r="140" fill="rgba(255,255,255,0.08)"/>
    <circle cx="120" cy="380" r="180" fill="rgba(255,255,255,0.06)"/>
    <rect x="48" y="48" width="170" height="32" rx="16" fill="rgba(255,255,255,0.2)"/>
    <text x="133" y="69" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${badgeText}</text>
    <text x="48" y="250" font-family="Inter, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF">${title.replace(/&/g, '&amp;')}</text>
    <text x="48" y="292" font-family="Inter, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.88)">${subtitle.replace(/&/g, '&amp;')}</text>
    <rect x="48" y="340" width="90" height="6" rx="3" fill="#FFFFFF"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createReceiptSVG = (vendor, amount, date, category) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="540" viewBox="0 0 460 540">
    <rect width="460" height="540" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="0" y="0" width="460" height="76" rx="12" fill="#171923"/>
    <text x="24" y="36" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#FFFFFF">OFFICIAL TAX INVOICE / RECEIPT</text>
    <text x="24" y="58" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">FundBridge Simulated Audit Copy • GST Verified Vendor</text>
    <text x="24" y="120" font-family="Inter, sans-serif" font-size="13" fill="#64748B">VENDOR / INSTITUTION</text>
    <text x="24" y="144" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#0F172A">${vendor}</text>
    <line x1="24" y1="168" x2="436" y2="168" stroke="#E2E8F0" stroke-dasharray="4 4"/>
    <text x="24" y="202" font-family="Inter, sans-serif" font-size="13" fill="#64748B">DATE OF ISSUE</text>
    <text x="436" y="202" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#0F172A" text-anchor="end">${date}</text>
    <text x="24" y="238" font-family="Inter, sans-serif" font-size="13" fill="#64748B">EXPENSE CATEGORY</text>
    <text x="436" y="238" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#635BFF" text-anchor="end">${category}</text>
    <text x="24" y="274" font-family="Inter, sans-serif" font-size="13" fill="#64748B">PAYMENT MODE</text>
    <text x="436" y="274" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#0F172A" text-anchor="end">Escrow NEFT / Direct Vendor Transfer</text>
    <rect x="24" y="310" width="412" height="84" rx="10" fill="#F8F9FC" stroke="#E2E8F0"/>
    <text x="44" y="344" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#64748B">TOTAL VERIFIED AMOUNT</text>
    <text x="44" y="376" font-family="Inter, sans-serif" font-size="26" font-weight="800" fill="#16A34A">${formatINR(amount)}</text>
    <circle cx="370" cy="352" r="24" fill="#DCFCE7"/>
    <text x="370" y="357" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#16A34A" text-anchor="middle">PAID</text>
    <text x="230" y="455" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">Simulated Receipt Preview for Transparency Demonstration</text>
    <text x="230" y="478" font-family="Inter, sans-serif" font-size="11" fill="#CBD5E1" text-anchor="middle">Ref ID: FB-TXN-${Math.floor(100000 + (amount % 899999))}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// ============================================================================
// 2. INITIAL MOCK DATA (12+ Rich Campaigns, Users, Groups, Notifications)
// ============================================================================

const INITIAL_USERS = [
  {
    id: 'user_donor_1',
    name: 'Aarav Sharma',
    email: 'aarav@fundbridge.in',
    phone: '+91 98765 43210',
    role: 'donor',
    avatar: 'AS',
    joinedDate: '2025-08-14',
    interests: ['Education', 'Medical', 'Environment'],
    wishlist: ['camp_1', 'camp_3', 'camp_4'],
  },
  {
    id: 'user_creator_1',
    name: 'Dr. Kavita Nair',
    email: 'kavita@hopehealth.org',
    phone: '+91 98230 11223',
    role: 'creator',
    avatar: 'KN',
    joinedDate: '2025-06-02',
    interests: ['Medical', 'Community Development'],
    wishlist: ['camp_2'],
  },
  {
    id: 'user_admin_1',
    name: 'Rohan Deshmukh (Trust Admin)',
    email: 'admin@fundbridge.in',
    phone: '+91 90000 12345',
    role: 'admin',
    avatar: 'RD',
    joinedDate: '2025-01-10',
    interests: ['Technology', 'Startup'],
    wishlist: [],
  },
];

const INITIAL_CAMPAIGNS = [
  {
    id: 'camp_1',
    title: 'Neonatal Heart Surgery for 8-Month-Old Baby Advik',
    category: 'Medical',
    location: 'Bengaluru, Karnataka',
    creatorId: 'user_creator_1',
    creatorName: 'Dr. Kavita Nair & Pediatric Care Trust',
    creatorRole: 'Verified Medical Partner',
    status: 'Urgent',
    isEmergency: true,
    urgencyLabel: 'Critical • Surgery Scheduled in 6 Days',
    verified: true,
    trustScore: 96,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 98,
      transparency: 95,
    },
    targetAmount: 450000,
    raisedAmount: 368500,
    supportersCount: 284,
    daysLeft: 6,
    createdAt: '2026-10-28',
    views: 4820,
    image: createIllustrationSVG('Save Baby Advik', 'Urgent Pediatric Cardiac Surgery • Bengaluru', '#EF4444', '#991B1B', 'URGENT MEDICAL'),
    beforeImage: createIllustrationSVG('Diagnosis Stage', 'Pre-Operative ICU Care & Echo Reports', '#64748B', '#334155', 'BEFORE'),
    afterImage: createIllustrationSVG('Recovery Milestone', 'Post-Surgery Pediatric Ward Monitoring', '#16A34A', '#15803D', 'TARGET OUTCOME'),
    shortDescription: 'Baby Advik was diagnosed with a complex congenital heart defect. Immediate open-heart surgery at Narayana Pediatric Institute can save his life.',
    story: 'Advik is the first child of Rajesh (a daily-wage school bus driver) and Sunita. At 6 months, doctors detected a severe Ventricular Septal Defect requiring urgent surgical correction. The family has exhausted all savings and pledged their small jewelry. Every rupee goes directly to the hospital escrow account.',
    beneficiary: 'Advik Kumar (8 months old), son of Rajesh Kumar',
    expenses: [
      { id: 'exp_1', description: 'Hospital Surgery & OT Deposit', amount: 180000, category: 'Hospital Fees', date: '2026-11-05', receiptUrl: createReceiptSVG('Narayana Pediatric Heart Center', 180000, '05 Nov 2026', 'Hospital Fees') },
      { id: 'exp_2', description: 'Pre-Op Cardiac Echo & Blood Panel', amount: 35000, category: 'Medical Tests', date: '2026-11-08', receiptUrl: createReceiptSVG('Metropolis Diagnostics Lab', 35000, '08 Nov 2026', 'Medical Tests') },
      { id: 'exp_3', description: 'Specialized Pediatric Medicines', amount: 42000, category: 'Medicines', date: '2026-11-12', receiptUrl: createReceiptSVG('Apollo Hospital Pharmacy', 42000, '12 Nov 2026', 'Medicines') },
    ],
    milestones: [
      { id: 'm_1', title: 'Pre-Operative Diagnostics & Stabilization', target: 80000, deadline: '2026-11-05', status: 'Completed', description: 'Complete cardiac catheterization and ICU stabilization.' },
      { id: 'm_2', title: 'Open-Heart Corrective Surgery', target: 250000, deadline: '2026-11-22', status: 'In Progress', description: 'Surgeon fees, OT consumables, and perfusion equipment.' },
      { id: 'm_3', title: 'Post-Op ICU & 3-Month Medication', target: 120000, deadline: '2026-12-15', status: 'Upcoming', description: '10 days pediatric ICU recovery and follow-up medicines.' },
    ],
    updates: [
      { id: 'u_1', date: '2026-11-14', title: 'Pre-op tests cleared! Surgery date locked', content: 'Thanks to 280+ generous donors, Advik has been cleared by the anesthesia team. Surgery is scheduled for November 22.' },
      { id: 'u_2', date: '2026-11-06', title: 'First hospital deposit paid with receipts uploaded', content: 'We transferred ₹1,80,000 directly to the hospital billing desk. Receipt is live in the Fund Utilization tab.' },
    ],
    donors: [
      { id: 'd_1', name: 'Aarav Sharma', amount: 5000, date: '2026-11-15', message: 'Praying for little Advik’s speedy recovery!', anonymous: false },
      { id: 'd_2', name: 'Anonymous', amount: 25000, date: '2026-11-14', message: 'Stay strong parents. God bless.', anonymous: true },
      { id: 'd_3', name: 'Meera Krishnan', amount: 2500, date: '2026-11-12', message: 'Sending love and strength.', anonymous: false },
    ],
    qna: [
      { id: 'q_1', user: 'Vikramjit Singh', question: 'Is the hospital accepting direct CSR/80G certificates for this case?', answer: 'Yes! All donations routed through our registered Pediatric Care Trust qualify for instant simulated 80G tax receipts.', date: '2026-11-10' },
    ],
  },
  {
    id: 'camp_2',
    title: 'First-Gen Rural Girls STEM & Robotics Scholarship Fund',
    category: 'Education',
    location: 'Jaipur & Sikar, Rajasthan',
    creatorId: 'user_creator_1',
    creatorName: 'Udaan Vidya Foundation',
    creatorRole: 'Verified Education NGO',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 94,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 96,
      transparency: 92,
    },
    targetAmount: 600000,
    raisedAmount: 492000,
    supportersCount: 412,
    daysLeft: 18,
    createdAt: '2026-10-15',
    views: 6150,
    image: createIllustrationSVG('Girls in STEM Labs', '40 Rural Scholarships & Robotics Kits', '#635BFF', '#312E81', 'VERIFIED EDUCATION'),
    beforeImage: createIllustrationSVG('Before: No Lab Access', 'Textbooks without practical computer labs', '#64748B', '#475569', 'BEFORE'),
    afterImage: createIllustrationSVG('After: Active STEM Lab', '40 Girls building Arduino & Python projects', '#16A34A', '#065F46', 'AFTER'),
    shortDescription: 'Sponsor annual college tuition, laptops, and hands-on robotics lab kits for 40 bright young women from farming families in rural Rajasthan.',
    story: 'In rural Sikar district, 78% of high-scoring girls drop out before engineering or B.Sc. degrees due to tuition and device costs. Udaan Vidya Foundation provides full annual fees, refurbished laptops, and weekend mentorship from women engineers in Bengaluru and Pune.',
    beneficiary: '40 First-Generation Female STEM Scholars (Ages 17–20)',
    expenses: [
      { id: 'exp_21', description: 'Semester 1 University Tuition (40 Students)', amount: 240000, category: 'Tuition & Fees', date: '2026-11-01', receiptUrl: createReceiptSVG('Rajasthan Technical University Fee Cell', 240000, '01 Nov 2026', 'Tuition & Fees') },
      { id: 'exp_22', description: 'Arduino & Raspberry Pi Robotics Kits', amount: 95000, category: 'Equipment', date: '2026-11-09', receiptUrl: createReceiptSVG('Robu.in Educational Supplies', 95000, '09 Nov 2026', 'Equipment') },
    ],
    milestones: [
      { id: 'm_21', title: 'Admission & Semester 1 Tuition Fees', target: 240000, deadline: '2026-11-01', status: 'Completed', description: 'Direct college fee transfer for all 40 scholars.' },
      { id: 'm_22', title: 'Robotics Lab & Laptop Distribution', target: 210000, deadline: '2026-11-28', status: 'In Progress', description: 'Procuring 20 shared lab laptops and microcontroller kits.' },
      { id: 'm_23', title: 'Semester 2 Fees & Hackathon Travel', target: 150000, deadline: '2027-01-15', status: 'Upcoming', description: 'Second semester fees and Jaipur state STEM showcase.' },
    ],
    updates: [
      { id: 'u_21', date: '2026-11-10', title: 'Robotics kits arrived in Sikar!', content: 'Our first batch of 40 microcontroller kits was unboxed yesterday. Students built their first automated soil-moisture sensor!' },
    ],
    donors: [
      { id: 'd_21', name: 'Ananya Rao', amount: 10000, date: '2026-11-14', message: 'Go girls! Future engineers of India.', anonymous: false },
      { id: 'd_22', name: 'Aarav Sharma', amount: 2500, date: '2026-11-11', message: 'Supporting STEM education.', anonymous: false },
    ],
    qna: [],
  },
  {
    id: 'camp_3',
    title: 'Solar Cold-Storage Microgrids for Small Onion Farmers',
    category: 'Startup',
    location: 'Nashik, Maharashtra',
    creatorId: 'user_creator_2',
    creatorName: 'AgriChill CleanTech Pvt Ltd',
    creatorRole: 'Impact Hardware Startup',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 91,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 92,
      transparency: 90,
    },
    targetAmount: 850000,
    raisedAmount: 612000,
    supportersCount: 195,
    daysLeft: 24,
    createdAt: '2026-10-20',
    views: 3940,
    image: createIllustrationSVG('Solar Cold Storage', 'Zero-Waste Farm-Gate Cooling • Nashik', '#0EA5E9', '#0369A1', 'CLIMATE STARTUP'),
    beforeImage: createIllustrationSVG('Before: 35% Crop Spoilage', 'Distress selling during summer heatwaves', '#64748B', '#334155', 'BEFORE'),
    afterImage: createIllustrationSVG('After: 4-Month Shelf Life', '100% Solar thermal battery cold room', '#16A34A', '#166534', 'AFTER'),
    shortDescription: 'Deploying 5-ton modular solar-powered cold storage units at village collection centers so small farmers avoid 35% post-harvest distress losses.',
    story: 'Smallholder horticulture farmers in Nashik lose nearly ₹1.2 lakh annually due to lack of affordable cold storage. Our patented thermal-battery microgrid runs 100% off-grid on rooftop solar panels, reducing storage costs by 60%.',
    beneficiary: '120 Smallholder Farmer Families across 3 Villages in Niphad',
    expenses: [
      { id: 'exp_31', description: '5kW Bifacial Solar Array & Inverter', amount: 260000, category: 'Hardware', date: '2026-11-03', receiptUrl: createReceiptSVG('Waaree Solar Authorized Partner', 260000, '03 Nov 2026', 'Hardware') },
      { id: 'exp_32', description: 'Insulated PUF Cold Chamber Panels', amount: 190000, category: 'Manufacturing', date: '2026-11-11', receiptUrl: createReceiptSVG('RinAc Cold Chain Systems', 190000, '11 Nov 2026', 'Manufacturing') },
    ],
    milestones: [
      { id: 'm_31', title: 'Solar Array & Thermal Battery Procurement', target: 300000, deadline: '2026-11-05', status: 'Completed', description: 'Panels and phase-change cooling plates delivered.' },
      { id: 'm_32', title: 'On-Site Assembly at Niphad FPO', target: 350000, deadline: '2026-12-05', status: 'In Progress', description: 'Civil foundation and PUF chamber installation.' },
      { id: 'm_33', title: 'IoT Telemetry & Farmer Onboarding', target: 200000, deadline: '2026-12-25', status: 'Upcoming', description: 'Mobile app launch for crate booking.' },
    ],
    updates: [],
    donors: [
      { id: 'd_31', name: 'Siddharth Malhotra', amount: 15000, date: '2026-11-13', message: 'Clean tech that solves real Indian agri challenges!', anonymous: false },
    ],
    qna: [],
  },
  {
    id: 'camp_4',
    title: 'Reviving 14 Urban Lakes & Miyawaki Native Forests',
    category: 'Environment',
    location: 'Hyderabad, Telangana',
    creatorId: 'user_creator_3',
    creatorName: 'Deccan Waters & Canopy Collective',
    creatorRole: 'Environmental Trust',
    status: 'Completed',
    isEmergency: false,
    verified: true,
    trustScore: 98,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 100,
      transparency: 97,
    },
    targetAmount: 500000,
    raisedAmount: 545000,
    supportersCount: 620,
    daysLeft: 0,
    createdAt: '2026-08-10',
    views: 9210,
    image: createIllustrationSVG('Urban Lake Revival', '18,000 Native Trees & Floating Wetlands', '#16A34A', '#14532D', '109% FUNDED'),
    beforeImage: createIllustrationSVG('Before: Hyacinth & Waste', 'Choked lakebed & dry barren perimeter', '#78350F', '#451A03', 'BEFORE'),
    afterImage: createIllustrationSVG('After: Thriving Ecosystem', 'Clean water, migratory birds & dense canopy', '#16A34A', '#065F46', 'AFTER'),
    shortDescription: 'We cleared 42 tons of invasive water hyacinth, installed floating vetiver bio-filters, and planted 18,000 native saplings around Ameenpur perimeter.',
    story: 'Rapid urbanization threatened seasonal migratory birds and groundwater recharge around Ameenpur. With 620 citizen donors and 1,100 weekend volunteers, we restored water oxygen levels and created a self-sustaining Miyawaki buffer forest.',
    beneficiary: '45,000 Local Residents & 160 Migratory Bird Species',
    expenses: [
      { id: 'exp_41', description: 'De-weeding Machinery & Silt Removal', amount: 210000, category: 'Restoration Ops', date: '2026-09-12', receiptUrl: createReceiptSVG('Deccan Earthmovers & Eco Infra', 210000, '12 Sep 2026', 'Restoration Ops') },
      { id: 'exp_42', description: '18,000 Native Saplings & Drip Irrigation', amount: 225000, category: 'Plantation', date: '2026-09-28', receiptUrl: createReceiptSVG('Telangana Native Nursery Coop', 225000, '28 Sep 2026', 'Plantation') },
      { id: 'exp_43', description: 'Floating Wetland Bio-Filter Rafts', amount: 110000, category: 'Water Treatment', date: '2026-10-14', receiptUrl: createReceiptSVG('AquaPure BioSystems', 110000, '14 Oct 2026', 'Water Treatment') },
    ],
    milestones: [
      { id: 'm_41', title: '42-Ton Plastic & Hyacinth Cleanup', target: 210000, deadline: '2026-09-15', status: 'Completed', description: 'Lake surface cleared and waste recycled.' },
      { id: 'm_42', title: '18,000 Sapling Miyawaki Plantation', target: 225000, deadline: '2026-10-01', status: 'Completed', description: 'Native Banyan, Neem, Jamun, and Arjun planted.' },
      { id: 'm_43', title: 'Bio-Filter Rafts & Water Quality Audit', target: 110000, deadline: '2026-10-20', status: 'Completed', description: 'Dissolved oxygen increased from 2.1 to 6.8 mg/L.' },
    ],
    updates: [
      { id: 'u_41', date: '2026-10-25', title: 'Project Completed! Flamingos & Pelicans spotted again', content: 'Our 30-day water quality audit passed with flying colors. Thank you to every donor who made this ecological turnaround possible.' },
    ],
    donors: [
      { id: 'd_41', name: 'Aarav Sharma', amount: 5000, date: '2026-09-05', message: 'For a greener Hyderabad!', anonymous: false },
      { id: 'd_42', name: 'Priya Nair', amount: 10000, date: '2026-09-08', message: 'Amazing transparency and volunteer work.', anonymous: false },
    ],
    qna: [],
  },
  {
    id: 'camp_5',
    title: 'Coastal Cyclone Relief: Solar Lanterns & Clean Water Kits',
    category: 'Emergency',
    location: 'Srikakulam & Vizianagaram, AP',
    creatorId: 'user_creator_1',
    creatorName: 'Rapid Relief India Network',
    creatorRole: 'Disaster Response Coalition',
    status: 'Urgent',
    isEmergency: true,
    urgencyLabel: 'Flash Disaster Response • Dispatching Daily',
    verified: true,
    trustScore: 95,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 97,
      transparency: 94,
    },
    targetAmount: 700000,
    raisedAmount: 589000,
    supportersCount: 530,
    daysLeft: 4,
    createdAt: '2026-11-08',
    views: 7420,
    image: createIllustrationSVG('Cyclone Relief Kits', 'Immediate Solar Lights, Ration & Water Filters', '#F59E0B', '#B45309', 'EMERGENCY RELIEF'),
    shortDescription: 'Delivering 1,000 family emergency kits with gravity water purifiers, solar lanterns, tarpaulins, and dry rations to cyclone-affected fishing hamlets.',
    story: 'Heavy cyclonic winds and coastal flooding knocked out power grids and contaminated drinking wells across 14 fishing villages in North Andhra Pradesh. Our field teams are dispatching trucks every 24 hours from Visakhapatnam.',
    beneficiary: '1,000 Displaced Fisherfolk Families (4,200+ Individuals)',
    expenses: [
      { id: 'exp_51', description: '650 Gravity Water Filters & Chlorine Tabs', amount: 260000, category: 'Water & Sanitation', date: '2026-11-11', receiptUrl: createReceiptSVG('Tata Swach Humanitarian Supply', 260000, '11 Nov 2026', 'Water & Sanitation') },
      { id: 'exp_52', description: '700 Solar Lanterns & Heavy Tarpaulins', amount: 215000, category: 'Shelter & Power', date: '2026-11-13', receiptUrl: createReceiptSVG('d.light Energy India', 215000, '13 Nov 2026', 'Shelter & Power') },
    ],
    milestones: [
      { id: 'm_51', title: 'Batch 1: 500 Kits Dispatched to Srikakulam', target: 350000, deadline: '2026-11-12', status: 'Completed', description: 'Distributed across 8 coastal hamlets.' },
      { id: 'm_52', title: 'Batch 2: 500 Kits + Medical Camp', target: 350000, deadline: '2026-11-20', status: 'In Progress', description: 'Procuring remaining 300 solar lamps and dry rations.' },
    ],
    updates: [],
    donors: [
      { id: 'd_51', name: 'Karthik Reddy', amount: 5000, date: '2026-11-15', message: 'Stay safe coastal Andhra!', anonymous: false },
    ],
    qna: [],
  },
  {
    id: 'camp_6',
    title: 'Low-Cost AI Braille Reader for Visually Impaired Students',
    category: 'Technology',
    location: 'Chennai, Tamil Nadu',
    creatorId: 'user_creator_4',
    creatorName: 'SenseTech Student Innovators (IIT-M)',
    creatorRole: 'Assistive Tech Team',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 93,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 94,
      transparency: 92,
    },
    targetAmount: 400000,
    raisedAmount: 318000,
    supportersCount: 248,
    daysLeft: 19,
    createdAt: '2026-10-22',
    views: 3410,
    image: createIllustrationSVG('Tactile AI Braille Pad', 'Affordable Refreshable Braille at 1/10th Cost', '#8B5CF6', '#4C1D95', 'ASSISTIVE TECH'),
    shortDescription: 'Traditional refreshable Braille displays cost over ₹1.5 lakh. Our piezo-tactile device brings it down to ₹14,000 with instant PDF-to-Braille translation.',
    story: 'Developed by a team of 4 engineering students in Chennai, TactileRead translates regional Indian languages (Tamil, Hindi, Telugu, English) into refreshable Braille cells in real time. Funds will manufacture 25 pilot units for blind schools.',
    beneficiary: '180 Visually Impaired Students across 3 Partner Schools',
    expenses: [
      { id: 'exp_61', description: 'Micro-Actuators & Custom PCB Fabrication', amount: 175000, category: 'R&D Components', date: '2026-11-04', receiptUrl: createReceiptSVG('LionCircuits PCB Manufacturing', 175000, '04 Nov 2026', 'R&D Components') },
    ],
    milestones: [
      { id: 'm_61', title: 'PCB & Tactile Cell Tooling', target: 180000, deadline: '2026-11-05', status: 'Completed', description: 'Custom tactile pins molded and tested.' },
      { id: 'm_62', title: 'Assemble 25 Classroom Pilot Units', target: 220000, deadline: '2026-12-10', status: 'In Progress', description: 'Final assembly and user testing with students.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_7',
    title: '24/7 Stray Trauma Ambulance & Sterilization Shelter',
    category: 'Animal Welfare',
    location: 'Pune, Maharashtra',
    creatorId: 'user_creator_5',
    creatorName: 'Paws & Compassion Rescue Pune',
    creatorRole: 'Animal Welfare NGO',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 90,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 91,
      transparency: 89,
    },
    targetAmount: 350000,
    raisedAmount: 264000,
    supportersCount: 319,
    daysLeft: 14,
    createdAt: '2026-10-25',
    views: 4120,
    image: createIllustrationSVG('Stray Trauma Ambulance', 'Emergency Vet Rescue & Recovery Kennels', '#F97316', '#9A3412', 'ANIMAL WELFARE'),
    beforeImage: createIllustrationSVG('Before: Injured on Highway', 'Delayed transport for hit-and-run strays', '#64748B', '#334155', 'BEFORE'),
    afterImage: createIllustrationSVG('After: Mobile Vet ICU', '15-minute response & sterile recovery wards', '#16A34A', '#15803D', 'AFTER'),
    shortDescription: 'Equipping a hydraulic-lift veterinary ambulance and 20 post-op recovery kennels for injured street dogs and cats in Pune.',
    story: 'Every week we receive 40+ emergency calls for road-accident stray animals. A dedicated hydraulic rescue van with oxygen support and clean recovery kennels will triple our survival rate.',
    beneficiary: '1,200+ Injured & Abandoned Street Animals Annually',
    expenses: [
      { id: 'exp_71', description: 'Ambulance Hydraulic Stretcher & Oxygen Kit', amount: 140000, category: 'Medical Equipment', date: '2026-11-07', receiptUrl: createReceiptSVG('VetCare India Equipments', 140000, '07 Nov 2026', 'Medical Equipment') },
    ],
    milestones: [
      { id: 'm_71', title: 'Veterinary Ambulance Retrofitting', target: 180000, deadline: '2026-11-18', status: 'In Progress', description: 'Installing non-slip flooring, cages, and oxygen.' },
      { id: 'm_72', title: '20 Stainless Steel Recovery Kennels', target: 170000, deadline: '2026-12-08', status: 'Upcoming', description: 'Shelter ward upgrade and anti-rabies stock.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_8',
    title: 'Solar Micro-Grid & Digital Library for Tribal Hamlet',
    category: 'Community Development',
    location: 'Araku Valley, Andhra Pradesh',
    creatorId: 'user_creator_6',
    creatorName: 'Eastern Ghats Gram Swaraj',
    creatorRole: 'Community Collective',
    status: 'Completed',
    isEmergency: false,
    verified: true,
    trustScore: 95,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 96,
      transparency: 94,
    },
    targetAmount: 320000,
    raisedAmount: 320000,
    supportersCount: 276,
    daysLeft: 0,
    createdAt: '2026-07-18',
    views: 5190,
    image: createIllustrationSVG('Araku Solar Library', 'Clean Evening Lighting & Offline e-Library', '#14B8A6', '#115E59', '100% ACHIEVED'),
    beforeImage: createIllustrationSVG('Before: Kerosene Lamps', 'No evening study hours after sunset', '#57534E', '#292524', 'BEFORE'),
    afterImage: createIllustrationSVG('After: Solar Community Hub', '65 homes lit + 10 offline learning tablets', '#16A34A', '#14532D', 'AFTER'),
    shortDescription: 'Brought clean solar electricity to 65 off-grid tribal households and built an evening digital learning center for 90 school children.',
    story: 'Located 18 km from the nearest grid substation, Pedabayalu hamlet relied on dim kerosene lamps. Together with village youth, we installed a 6kW community solar microgrid and an offline Wikipedia/Khan Academy server.',
    beneficiary: '65 Tribal Households & 90 School Students',
    expenses: [
      { id: 'exp_81', description: '6kW Solar Microgrid & Lithium Storage', amount: 220000, category: 'Infrastructure', date: '2026-08-20', receiptUrl: createReceiptSVG('SunPower Rural Grids', 220000, '20 Aug 2026', 'Infrastructure') },
      { id: 'exp_82', description: '10 Rugged Learning Tablets & Books', amount: 100000, category: 'Education Assets', date: '2026-09-02', receiptUrl: createReceiptSVG('EduTech Devices India', 100000, '02 Sep 2026', 'Education Assets') },
    ],
    milestones: [
      { id: 'm_81', title: 'Solar Microgrid Wiring & Commissioning', target: 220000, deadline: '2026-08-25', status: 'Completed', description: 'LED lights installed in all 65 homes.' },
      { id: 'm_82', title: 'Evening Digital Library Launch', target: 100000, deadline: '2026-09-10', status: 'Completed', description: 'Library inaugurated by village elders.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_9',
    title: 'Dignity Kitchens: Nutritious Meals for Cancer Caregivers',
    category: 'Social Causes',
    location: 'Mumbai, Maharashtra',
    creatorId: 'user_creator_7',
    creatorName: 'Annapurna Seva Rasoi',
    creatorRole: 'Verified Community Kitchen',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 97,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 98,
      transparency: 96,
    },
    targetAmount: 480000,
    raisedAmount: 410000,
    supportersCount: 512,
    daysLeft: 11,
    createdAt: '2026-10-18',
    views: 5830,
    image: createIllustrationSVG('Dignity Community Kitchen', '15,000 Hot Meals for Patient Families', '#EC4899', '#831843', 'HIGH IMPACT'),
    shortDescription: 'Providing fresh, hygienic, hot lunch and dinner daily to outstation patient families sleeping outside major cancer hospitals in Parel, Mumbai.',
    story: 'Thousands of families travel from remote villages to Mumbai for cancer treatment, spending every rupee on medicines while skipping meals themselves. Our kitchen serves 500 nutritious thalis daily at zero cost.',
    beneficiary: '500 Patient Caregivers Daily for 3 Months',
    expenses: [
      { id: 'exp_91', description: 'Bulk Grains, Pulses & Cold-Pressed Oil', amount: 230000, category: 'Groceries', date: '2026-11-02', receiptUrl: createReceiptSVG('APMC Wholesale Grains Mumbai', 230000, '02 Nov 2026', 'Groceries') },
    ],
    milestones: [
      { id: 'm_91', title: 'Month 1 Ration & Commercial Kitchen Fuel', target: 160000, deadline: '2026-11-01', status: 'Completed', description: '15,000 meals served in October.' },
      { id: 'm_92', title: 'Month 2 & 3 Bulk Ration Procurement', target: 320000, deadline: '2026-11-28', status: 'In Progress', description: 'Securing winter vegetable and grain supply.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_10',
    title: 'Emergency Bone Marrow Transplant for 11-Year-Old Riya',
    category: 'Emergency',
    location: 'New Delhi, Delhi NCR',
    creatorId: 'user_creator_1',
    creatorName: 'Asha Hematology Support Group',
    creatorRole: 'Verified Medical NGO',
    status: 'Urgent',
    isEmergency: true,
    urgencyLabel: 'Urgent • Donor Match Confirmed',
    verified: true,
    trustScore: 94,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 95,
      transparency: 93,
    },
    targetAmount: 950000,
    raisedAmount: 715000,
    supportersCount: 640,
    daysLeft: 8,
    createdAt: '2026-10-30',
    views: 8190,
    image: createIllustrationSVG('Save 11-Yr-Old Riya', 'Matched Bone Marrow Transplant • New Delhi', '#EF4444', '#7F1D1D', 'CRITICAL URGENCY'),
    shortDescription: 'Riya is battling severe Aplastic Anemia. Her younger brother is a 100% HLA match, and we must raise the remaining ₹2.35L before conditioning therapy begins.',
    story: 'Riya loves painting and wants to become an art teacher. Over the past 4 months, she has needed weekly platelet transfusions. A matched sibling transplant offers a 90% permanent cure.',
    beneficiary: 'Riya Verma (11 years old)',
    expenses: [
      { id: 'exp_101', description: 'HLA Typing & Bone Marrow Harvesting Prep', amount: 310000, category: 'Hospital Fees', date: '2026-11-06', receiptUrl: createReceiptSVG('BLK-Max BMT Unit Delhi', 310000, '06 Nov 2026', 'Hospital Fees') },
    ],
    milestones: [
      { id: 'm_101', title: 'HLA Matching & Infection Clearance', target: 310000, deadline: '2026-11-06', status: 'Completed', description: 'Brother confirmed 10/10 HLA match.' },
      { id: 'm_102', title: 'BMT Isolation Ward & Transplant', target: 640000, deadline: '2026-11-26', status: 'In Progress', description: '28-day sterile HEPA isolation & stem cell infusion.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_11',
    title: 'Final-Year Engineering Fee Rescue for Merit Student Pranav',
    category: 'Education',
    location: 'Kochi, Kerala',
    creatorId: 'user_creator_8',
    creatorName: 'Pranav M. (Supported by Alumni Guild)',
    creatorRole: 'Verified Student Applicant',
    status: 'Active',
    isEmergency: false,
    verified: true,
    trustScore: 89,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Verified',
      bank: 'Verified',
      completeness: 90,
      transparency: 88,
    },
    targetAmount: 145000,
    raisedAmount: 118500,
    supportersCount: 94,
    daysLeft: 9,
    createdAt: '2026-11-02',
    views: 1840,
    image: createIllustrationSVG('Help Pranav Graduate', 'Final Year B.Tech Computer Science Fee Rescue', '#635BFF', '#1E1B4B', 'STUDENT MERIT'),
    shortDescription: 'With a 9.1 CGPA and an internship offer in hand, Pranav faces deregistration from final exams after his father’s unexpected stroke.',
    story: 'Pranav has topped his department for 6 consecutive semesters. Following his father’s medical emergency, the family could not pay the final-year college and hostel balance due November 26.',
    beneficiary: 'Pranav Menon (21, B.Tech CSE Final Year)',
    expenses: [
      { id: 'exp_111', description: 'College Semester 7 Fee Clearance', amount: 85000, category: 'Tuition & Fees', date: '2026-11-10', receiptUrl: createReceiptSVG('CUSAT Engineering Fee Portal', 85000, '10 Nov 2026', 'Tuition & Fees') },
    ],
    milestones: [
      { id: 'm_111', title: 'Clear Semester 7 Arrears', target: 85000, deadline: '2026-11-10', status: 'Completed', description: 'Hall ticket unlocked for mid-sems.' },
      { id: 'm_112', title: 'Semester 8 Exam & Project Fee', target: 60000, deadline: '2026-11-26', status: 'In Progress', description: 'Final university fee payment.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
  {
    id: 'camp_12',
    title: 'Biodegradable Areca-Leaf Tableware Micro-Factory',
    category: 'Startup',
    location: 'Shivamogga, Karnataka',
    creatorId: 'user_creator_9',
    creatorName: 'Malnad GreenCraft Women SHG',
    creatorRole: 'Women-Led Rural Enterprise',
    status: 'Pending',
    isEmergency: false,
    verified: false,
    trustScore: 76,
    verificationDetails: {
      identity: 'Verified',
      documents: 'Pending',
      bank: 'Verified',
      completeness: 82,
      transparency: 74,
    },
    targetAmount: 280000,
    raisedAmount: 65000,
    supportersCount: 41,
    daysLeft: 29,
    createdAt: '2026-11-13',
    views: 920,
    image: createIllustrationSVG('Women-Led GreenCraft', 'Plastic-Free Areca Plates by 18 Rural Women', '#10B981', '#064E3B', 'PENDING AUDIT'),
    shortDescription: 'Setting up 4 hydraulic heat-press machines operated by an 18-woman Self Help Group to turn fallen areca palm sheaths into compostable dinnerware.',
    story: 'Instead of burning fallen areca palm leaves, our 18-member women collective cleans, sterilizes, and presses them into sturdy eco-plates exported to Bengaluru cafes.',
    beneficiary: '18 Women Entrepreneurs in Thirthahalli Taluk',
    expenses: [],
    milestones: [
      { id: 'm_121', title: '4 Hydraulic Heat-Press Machines', target: 190000, deadline: '2026-12-15', status: 'Upcoming', description: 'Machinery purchase and 3-phase wiring.' },
      { id: 'm_122', title: 'Raw Sheath Stock & Packaging', target: 90000, deadline: '2026-12-30', status: 'Upcoming', description: 'First 20,000 plate production batch.' },
    ],
    updates: [],
    donors: [],
    qna: [],
  },
];

const INITIAL_DONATIONS = [
  { id: 'don_101', userId: 'user_donor_1', donorName: 'Aarav Sharma', campaignId: 'camp_1', campaignTitle: 'Neonatal Heart Surgery for 8-Month-Old Baby Advik', category: 'Medical', amount: 5000, date: '2026-11-15', status: 'Completed', anonymous: false },
  { id: 'don_102', userId: 'user_donor_1', donorName: 'Aarav Sharma', campaignId: 'camp_2', campaignTitle: 'First-Gen Rural Girls STEM & Robotics Scholarship Fund', category: 'Education', amount: 2500, date: '2026-11-11', status: 'Completed', anonymous: false },
  { id: 'don_103', userId: 'user_donor_1', donorName: 'Aarav Sharma', campaignId: 'camp_4', campaignTitle: 'Reviving 14 Urban Lakes & Miyawaki Native Forests', category: 'Environment', amount: 5000, date: '2026-09-05', status: 'Completed', anonymous: false },
  { id: 'don_104', userId: 'user_donor_1', donorName: 'Aarav Sharma', campaignId: 'camp_9', campaignTitle: 'Dignity Kitchens: Nutritious Meals for Cancer Caregivers', category: 'Social Causes', amount: 1500, date: '2026-10-29', status: 'Completed', anonymous: true },
];

const INITIAL_GROUPS = [
  {
    id: 'grp_1',
    name: 'BITS 2019 Alumni Giving Circle',
    campaignId: 'camp_2',
    campaignTitle: 'First-Gen Rural Girls STEM & Robotics Scholarship Fund',
    targetAmount: 50000,
    description: '5 batchmates pooling ₹10,000 each to sponsor 2 full STEM scholarships & laptops!',
    members: [
      { id: 'gm_1', name: 'Aarav Sharma', pledged: 10000, contributed: 10000 },
      { id: 'gm_2', name: 'Neha Kulkarni', pledged: 10000, contributed: 10000 },
      { id: 'gm_3', name: 'Rohan Verma', pledged: 10000, contributed: 10000 },
      { id: 'gm_4', name: 'Sneha Iyer', pledged: 10000, contributed: 5000 },
      { id: 'gm_5', name: 'Devansh Joshi', pledged: 10000, contributed: 0 },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif_1', title: 'Milestone Completed!', message: 'Baby Advik’s campaign completed Milestone 1: Pre-Operative Diagnostics.', time: '2 hours ago', read: false, type: 'milestone' },
  { id: 'notif_2', title: 'New Receipt Uploaded', message: 'Udaan Vidya Foundation uploaded a verified receipt for ₹95,000 (Robotics Kits).', time: '1 day ago', read: false, type: 'transparency' },
  { id: 'notif_3', title: 'Campaign 100% Funded!', message: 'Reviving 14 Urban Lakes exceeded its ₹5,00,000 target thanks to your support.', time: '3 days ago', read: true, type: 'success' },
];

// ============================================================================
// 3. GLOBAL CONTEXT (Auth + Campaigns + Donations + Groups + Notifications)
// ============================================================================

const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  // Active route/view state
  const [route, setRoute] = useState({ page: 'home', params: {} });

  // Toast message state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3800);
  };

  // Persistent Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_current_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Persistent Campaigns
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  // Persistent Donations
  const [donations, setDonations] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_donations');
      return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  // Persistent Group Funding
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  // Persistent Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // AI Draft transfer state
  const [aiDraft, setAiDraft] = useState(null);
  // Load live campaigns & groups from MongoDB backend on startup
  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const [campRes, groupRes] = await Promise.all([
          api.getCampaigns(),
          api.getGroups(),
        ]);
        if (campRes?.campaigns?.length) {
          setCampaigns(campRes.campaigns.map((c) => ({ ...c, id: c._id })));
        }
        if (groupRes?.groups?.length) {
          setGroups(groupRes.groups.map((g) => ({ ...g, id: g._id })));
        }
      } catch (err) {
        console.warn('Backend offline, using local data:', err.message);
      }
    };
    fetchFromBackend();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('fb_current_user', JSON.stringify(currentUser));
      else localStorage.removeItem('fb_current_user');
    } catch (e) { console.error(e); }
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem('fb_users', JSON.stringify(users)); } catch (e) { console.error(e); }
  }, [users]);

  useEffect(() => {
    try { localStorage.setItem('fb_campaigns', JSON.stringify(campaigns)); } catch (e) { console.error(e); }
  }, [campaigns]);

  useEffect(() => {
    try { localStorage.setItem('fb_donations', JSON.stringify(donations)); } catch (e) { console.error(e); }
  }, [donations]);

  useEffect(() => {
    try { localStorage.setItem('fb_groups', JSON.stringify(groups)); } catch (e) { console.error(e); }
  }, [groups]);

  useEffect(() => {
    try { localStorage.setItem('fb_notifications', JSON.stringify(notifications)); } catch (e) { console.error(e); }
  }, [notifications]);

  // Navigation Helper
  const navigate = (page, params = {}) => {
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add Notification
  const pushNotification = (title, message, type = 'info') => {
    setNotifications((prev) => [
      { id: generateId('notif'), title, message, time: 'Just now', read: false, type },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Wishlist Toggle
  const toggleWishlist = (campaignId) => {
    if (!currentUser) {
      showToast('Please log in to save campaigns to your wishlist.', 'warning');
      navigate('login');
      return;
    }
    const exists = currentUser.wishlist?.includes(campaignId);
    const updatedWishlist = exists
      ? currentUser.wishlist.filter((id) => id !== campaignId)
      : [...(currentUser.wishlist || []), campaignId];

    const updatedUser = { ...currentUser, wishlist: updatedWishlist };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast(exists ? 'Removed from saved campaigns' : 'Saved to your wishlist!');
  };

  // Simulated Donation Action
  const makeDonation = ({ campaignId, amount, anonymous, message, donorNameOverride }) => {
    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount < 10) {
      showToast('Please enter a valid donation amount (minimum ₹10).', 'error');
      return false;
    }

    const targetCamp = campaigns.find((c) => c.id === campaignId);
    if (!targetCamp) return false;

    const donorDisplay = anonymous
      ? 'Anonymous'
      : donorNameOverride || currentUser?.name || 'Guest Supporter';

    const newDonorEntry = {
      id: generateId('donor'),
      name: donorDisplay,
      amount: cleanAmount,
      date: new Date().toISOString().split('T')[0],
      message: message || 'Happy to support this meaningful cause!',
      anonymous: !!anonymous,
    };

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const newRaised = c.raisedAmount + cleanAmount;
        return {
          ...c,
          raisedAmount: newRaised,
          supportersCount: c.supportersCount + 1,
          status: newRaised >= c.targetAmount && c.status !== 'Completed' ? 'Completed' : c.status,
          donors: [newDonorEntry, ...(c.donors || [])],
        };
      })
    );

    const newDonationRecord = {
      id: generateId('don'),
      userId: currentUser?.id || 'guest',
      donorName: donorDisplay,
      campaignId,
      campaignTitle: targetCamp.title,
      category: targetCamp.category,
      amount: cleanAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      anonymous: !!anonymous,
    };

    setDonations((prev) => [newDonationRecord, ...prev]);
    pushNotification(
      'Donation Confirmed!',
      `You contributed ${formatINR(cleanAmount)} to "${targetCamp.title}".`,
      'success'
    );
    showToast(`Thank you! Your ${formatINR(cleanAmount)} contribution was recorded.`);
    return true;
  };

  // Create Campaign
  const addCampaign = (newCampData) => {
    const newCampaign = {
      ...newCampData,
      id: generateId('camp'),
      creatorId: currentUser?.id || 'user_creator_1',
      creatorName: currentUser?.name || 'Community Creator',
      creatorRole: 'Simulated Verified Creator',
      raisedAmount: 0,
      supportersCount: 0,
      views: 1,
      createdAt: new Date().toISOString().split('T')[0],
      donors: [],
      updates: [
        {
          id: generateId('upd'),
          date: new Date().toISOString().split('T')[0],
          title: 'Campaign Published on FundBridge',
          content: 'Thank you for visiting our campaign! All fund utilization logs and receipts will be uploaded transparently here.',
        },
      ],
      qna: [],
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    pushNotification(
      'Campaign Submitted & Live',
      `"${newCampaign.title}" has been published to FundBridge.`,
      'success'
    );
    showToast('Campaign published successfully!');
    return newCampaign;
  };

  // Update Campaign (Creator & Admin actions)
  const updateCampaign = (campaignId, updates) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c))
    );
  };

  const deleteCampaign = (campaignId) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    showToast('Campaign deleted.', 'warning');
  };

  // Add Expense to Fund Utilization Tracker
  const addCampaignExpense = (campaignId, expense) => {
    const newExp = {
      id: generateId('exp'),
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: new Date().toISOString().split('T')[0],
      receiptUrl:
        expense.receiptUrl ||
        createReceiptSVG(expense.vendor || 'Verified Project Vendor', Number(expense.amount), new Date().toLocaleDateString('en-IN'), expense.category),
    };
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, expenses: [newExp, ...(c.expenses || [])] } : c
      )
    );
    pushNotification('Expense Log Added', `New expense of ${formatINR(newExp.amount)} logged with receipt.`, 'transparency');
    showToast('Expense and receipt added to Fund Utilization Tracker!');
  };

  // Update Milestone Status
  const updateMilestoneStatus = (campaignId, milestoneId, status) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          milestones: c.milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
        };
      })
    );
    pushNotification('Milestone Updated', `Milestone marked as ${status}.`, 'milestone');
    showToast(`Milestone status updated to ${status}`);
  };

  // Post Campaign Update
  const addCampaignUpdate = (campaignId, title, content) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          updates: [
            { id: generateId('upd'), date: new Date().toISOString().split('T')[0], title, content },
            ...(c.updates || []),
          ],
        };
      })
    );
    showToast('Campaign update posted!');
  };

  // Post Q&A Question or Creator Reply
  const addCampaignQuestion = (campaignId, questionText) => {
    const q = {
      id: generateId('qna'),
      user: currentUser?.name || 'Community Visitor',
      question: questionText,
      answer: null,
      date: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, qna: [q, ...(c.qna || [])] } : c))
    );
    showToast('Question posted to campaign creator!');
  };

  const replyCampaignQuestion = (campaignId, qnaId, answerText) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          qna: (c.qna || []).map((item) =>
            item.id === qnaId ? { ...item, answer: answerText } : item
          ),
        };
      })
    );
    showToast('Reply published!');
  };

  // Group Funding Actions
  const createGroup = (groupData) => {
    const newGrp = {
      id: generateId('grp'),
      ...groupData,
    };
    setGroups((prev) => [newGrp, ...prev]);
    showToast('Shared Funding Group created!');
  };

  const contributeToGroup = (groupId, memberId, amount) => {
    const cleanAmt = Number(amount);
    if (!cleanAmt || cleanAmt <= 0) return;
    let targetCampId = null;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        targetCampId = g.campaignId;
        return {
          ...g,
          members: g.members.map((m) =>
            m.id === memberId ? { ...m, contributed: m.contributed + cleanAmt } : m
          ),
        };
      })
    );

    if (targetCampId) {
      makeDonation({
        campaignId: targetCampId,
        amount: cleanAmt,
        anonymous: false,
        message: 'Contributed via FundBridge Group Giving Circle',
      });
    }
  };

  // Auth Helpers
  const switchDemoRole = (role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched demo profile to ${found.name} (${role.toUpperCase()})`);
    }
  };

  const loginUser = (email) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      showToast(`Welcome back, ${existing.name}!`);
      navigate('home');
      return true;
    }
    const demoFallback = {
      id: generateId('user'),
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').toUpperCase(),
      email,
      phone: '+91 98765 00000',
      role: 'donor',
      avatar: email.slice(0, 2).toUpperCase(),
      joinedDate: new Date().toISOString().split('T')[0],
      interests: ['Education', 'Medical'],
      wishlist: [],
    };
    setUsers((prev) => [...prev, demoFallback]);
    setCurrentUser(demoFallback);
    showToast(`Logged in as ${demoFallback.name}`);
    navigate('home');
    return true;
  };

  const signupUser = ({ name, email, phone, role }) => {
    const newUser = {
      id: generateId('user'),
      name,
      email,
      phone,
      role: role || 'donor',
      avatar: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      joinedDate: new Date().toISOString().split('T')[0],
      interests: ['Education', 'Medical', 'Startup'],
      wishlist: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Account created! Welcome to FundBridge, ${name}.`);
    navigate(role === 'creator' ? 'creator-dashboard' : 'donor-dashboard');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('You have been logged out.');
    navigate('home');
  };

  const resetDemoData = () => {
    localStorage.clear();
    setCampaigns(INITIAL_CAMPAIGNS);
    setDonations(INITIAL_DONATIONS);
    setGroups(INITIAL_GROUPS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    showToast('All demo data reset to defaults!');
  };

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        toast,
        showToast,
        currentUser,
        users,
        campaigns,
        donations,
        groups,
        notifications,
        aiDraft,
        setAiDraft,
        markAllNotificationsRead,
        toggleWishlist,
        makeDonation,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        addCampaignExpense,
        updateMilestoneStatus,
        addCampaignUpdate,
        addCampaignQuestion,
        replyCampaignQuestion,
        createGroup,
        contributeToGroup,
        switchDemoRole,
        loginUser,
        signupUser,
        logoutUser,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// ============================================================================
// 4. REUSABLE UI COMPONENTS
// ============================================================================

const ProgressBar = ({ raised, target, height = 'h-2.5', colorClass = 'bg-[#635BFF]' }) => {
  const pct = calcPercentage(raised, target);
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
      <div
        className={`${height} ${pct >= 100 ? 'bg-[#16A34A]' : colorClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const TrustBadge = ({ verified, score, compact = false }) => {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        {compact ? 'Pending Audit' : `Pending Verification (${score}/100)`}
      </span>
    );
  }
  return (
    <span
      title="Simulated Frontend Verification & Trust Score"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
      {compact ? `Trust ${score}/100` : `Verified • Trust ${score}/100`}
    </span>
  );
};

const CampaignCard = ({ campaign, onQuickDonate }) => {
  const { navigate, currentUser, toggleWishlist } = useApp();
  const pct = calcPercentage(campaign.raisedAmount, campaign.targetAmount);
  const isSaved = currentUser?.wishlist?.includes(campaign.id);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-[#171923] shadow-sm">
            {campaign.category}
          </span>
          {campaign.isEmergency && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EF4444] text-white shadow-sm flex items-center gap-1 animate-pulse">
              <Siren className="w-3 h-3" /> URGENT
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(campaign.id);
          }}
          aria-label="Save to Wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition ${
            isSaved
              ? 'bg-[#635BFF] text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-[#635BFF]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <TrustBadge verified={campaign.verified} score={campaign.trustScore} compact />
          <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{campaign.location.split(',')[0]}</span>
          </span>
        </div>

        <h3
          onClick={() => navigate('campaign-details', { id: campaign.id })}
          className="font-bold text-slate-900 text-lg leading-snug mb-1.5 line-clamp-2 cursor-pointer group-hover:text-[#635BFF] transition-colors"
        >
          {campaign.title}
        </h3>

        <p className="text-xs text-slate-500 mb-3">
          by <span className="font-medium text-slate-700">{campaign.creatorName}</span>
        </p>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
          {campaign.shortDescription}
        </p>

        {/* Funding Progress */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex justify-between items-baseline mb-1.5">
            <div>
              <span className="text-base font-extrabold text-slate-900">
                {formatINR(campaign.raisedAmount)}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                of {formatCompactINR(campaign.targetAmount)}
              </span>
            </div>
            <span className="text-xs font-bold text-[#635BFF]">{pct}%</span>
          </div>

          <ProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} />

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 mb-4">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {campaign.supportersCount} supporters
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {campaign.status === 'Completed'
                ? 'Goal Reached'
                : `${campaign.daysLeft} days left`}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('campaign-details', { id: campaign.id })}
              className="flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-[#635BFF] transition-colors"
            >
              View Details
            </button>
            {onQuickDonate && campaign.status !== 'Completed' && (
              <button
                onClick={() => onQuickDonate(campaign)}
                className="py-2.5 px-3 rounded-xl font-semibold text-sm bg-red-50 text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors"
              >
                Quick Donate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. NAVBAR & FOOTER
// ============================================================================

const Navbar = () => {
  const {
    route,
    navigate,
    currentUser,
    notifications,
    markAllNotificationsRead,
    switchDemoRole,
    logoutUser,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Campaigns' },
    { id: 'emergency', label: 'Emergency', badge: true },
    { id: 'impact', label: 'Impact Wall' },
    { id: 'stories', label: 'Success Stories' },
    { id: 'groups', label: 'Group Funding' },
    { id: 'ai-writer', label: 'AI Assistant' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4338CA] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#171923]">
                Fund<span className="text-[#635BFF]">Bridge</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = route.page === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-50 text-[#635BFF] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('create-campaign')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-[#635BFF] text-white hover:bg-[#5249F5] shadow-sm shadow-indigo-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Campaign</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      Notifications ({unreadCount} unread)
                    </span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-[#635BFF] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 text-sm ${n.read ? 'bg-white' : 'bg-indigo-50/40'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-semibold text-slate-900">{n.title}</p>
                            <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#171923] text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.avatar}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name.split(' ')[0]}</p>
                    <p className="text-[10px] font-semibold text-[#635BFF] uppercase mt-0.5">{currentUser.role}</p>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-sm text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { navigate('donor-dashboard'); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-[#635BFF]" /> Donor Dashboard
                      </button>
                      <button
                        onClick={() => { navigate('creator-dashboard'); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4 text-[#16A34A]" /> Creator Dashboard
                      </button>
                      <button
                        onClick={() => { navigate('admin-dashboard'); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#F59E0B]" /> Admin Moderation
                      </button>
                      <button
                        onClick={() => { navigate('profile'); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-slate-500" /> Profile & Preferences
                      </button>
                    </div>

                    {/* Quick Demo Role Switcher */}
                    <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        1-Click Demo Role Switcher
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {['donor', 'creator', 'admin'].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              switchDemoRole(r);
                              setProfileOpen(false);
                            }}
                            className={`py-1 rounded text-xs font-semibold capitalize ${
                              currentUser.role === r
                                ? 'bg-[#635BFF] text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => { logoutUser(); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-[#EF4444] hover:bg-red-50"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-[#171923] text-white hover:bg-slate-800"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                navigate(link.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                route.page === link.id
                  ? 'bg-indigo-50 text-[#635BFF]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">LIVE</span>}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => { navigate('create-campaign'); setMobileOpen(false); }}
              className="col-span-2 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-semibold text-center"
            >
              + Start a Campaign
            </button>
            <button
              onClick={() => { navigate('donor-dashboard'); setMobileOpen(false); }}
              className="py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
            >
              Donor Dashboard
            </button>
            <button
              onClick={() => { navigate('creator-dashboard'); setMobileOpen(false); }}
              className="py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
            >
              Creator Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const { navigate, resetDemoData } = useApp();
  return (
    <footer className="bg-[#171923] text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white">
                <HandHeart className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Fund<span className="text-[#635BFF]">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Next-generation crowdfunding built on Trust, Real-Time Fund Utilization Transparency, and Measurable Social Impact across India.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Info className="w-3.5 h-3.5 text-[#635BFF]" />
              Frontend Prototype • Simulated Data
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => navigate('explore')} className="hover:text-white transition">Explore Campaigns</button></li>
              <li><button onClick={() => navigate('emergency')} className="hover:text-white transition">Emergency Relief Hub</button></li>
              <li><button onClick={() => navigate('impact')} className="hover:text-white transition">Verified Impact Wall</button></li>
              <li><button onClick={() => navigate('stories')} className="hover:text-white transition">Success Stories</button></li>
              <li><button onClick={() => navigate('groups')} className="hover:text-white transition">Group Giving Circles</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Fundraise & Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => navigate('create-campaign')} className="hover:text-white transition">Start a Campaign</button></li>
              <li><button onClick={() => navigate('ai-writer')} className="hover:text-white transition">AI Campaign Assistant</button></li>
              <li><button onClick={() => navigate('how-it-works')} className="hover:text-white transition">Trust Score & Verification</button></li>
              <li><button onClick={() => navigate('creator-dashboard')} className="hover:text-white transition">Creator Analytics</button></li>
              <li><button onClick={() => navigate('admin-dashboard')} className="hover:text-white transition">Admin Moderation Demo</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Transparency Guarantee</h4>
            <p className="text-sm text-slate-400 mb-4">
              Every campaign features itemized expense logs, receipt previews, and milestone tracking so you know how every rupee creates change.
            </p>
            <button
              onClick={resetDemoData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo LocalStorage Data
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FundBridge Social Impact Technologies. All rights reserved.</p>
          <p>Built with React, Recharts & LocalStorage • All payments & verifications are frontend simulations.</p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================================
// 6. QUICK DONATION MODAL (Used across Emergency, Homepage, Explore)
// ============================================================================

const QuickDonationModal = ({ campaign, onClose }) => {
  const { makeDonation, currentUser } = useApp();
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!campaign) return null;

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleConfirm = (e) => {
    e.preventDefault();
    const ok = makeDonation({
      campaignId: campaign.id,
      amount: finalAmount,
      anonymous,
      message,
      donorNameOverride: currentUser?.name,
    });
    if (ok) {
      setConfirmed(true);
    }
  };

  return (
    <Modal isOpen={!!campaign} onClose={onClose} title={confirmed ? 'Contribution Recorded!' : 'Support This Campaign'}>
      {confirmed ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 mb-2">
            Thank You for Your {formatINR(finalAmount)} Impact!
          </h4>
          <p className="text-sm text-slate-600 mb-6">
            Your simulated contribution to <strong>{campaign.title}</strong> has been added to the live campaign total and your Donor Dashboard.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-xs text-slate-600 space-y-1.5 mb-6 border border-slate-200">
            <div className="flex justify-between"><span>Receipt Ref:</span><span className="font-mono font-bold">FB-{Date.now().toString().slice(-6)}</span></div>
            <div className="flex justify-between"><span>Visibility:</span><span className="font-semibold">{anonymous ? 'Anonymous Supporter' : currentUser?.name || 'Guest'}</span></div>
            <div className="flex justify-between"><span>Mode:</span><span className="font-semibold text-[#635BFF]">Simulated Frontend Pledge</span></div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm hover:bg-[#5249F5]"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="pr-3">
              <p className="text-xs font-semibold text-[#635BFF]">{campaign.category}</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{campaign.title}</p>
            </div>
            <TrustBadge verified={campaign.verified} score={campaign.trustScore} compact />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Contribution Amount (INR)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000, 2500, 5000, 10000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                    !customAmount && amount === preset
                      ? 'bg-[#635BFF] text-white border-[#635BFF]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#635BFF]'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Or Enter Custom Amount (₹)</label>
            <input
              type="number"
              min="10"
              placeholder="e.g., 1500"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Words of Encouragement (Optional)</label>
            <input
              type="text"
              placeholder="Share a supportive message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-[#635BFF] focus:ring-[#635BFF]"
            />
            <span className="text-sm text-slate-700">Make my donation anonymous on the public donor wall</span>
          </label>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Frontend Simulation: No real money is charged. Totals update immediately in localStorage.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition"
          >
            Confirm Simulated Donation of {formatINR(finalAmount)}
          </button>
        </form>
      )}
    </Modal>
  );
};

// ============================================================================
// 7. HOMEPAGE
// ============================================================================

const HomePage = () => {
  const { campaigns, navigate, currentUser } = useApp();
  const [quickDonateCamp, setQuickDonateCamp] = useState(null);

  const totalRaised = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.raisedAmount, 0) + 42500000,
    [campaigns]
  );
  const totalSupporters = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.supportersCount, 0) + 18400,
    [campaigns]
  );

  // Smart Campaign Recommendations based on user interests & wishlist
  const recommendedCampaigns = useMemo(() => {
    const interests = currentUser?.interests || ['Education', 'Medical'];
    const saved = currentUser?.wishlist || [];
    const scored = campaigns
      .filter((c) => c.status !== 'Completed')
      .map((c) => {
        let score = c.trustScore;
        if (interests.includes(c.category)) score += 30;
        if (saved.includes(c.id)) score += 15;
        if (c.isEmergency) score += 10;
        return { ...c, recScore: score };
      })
      .sort((a, b) => b.recScore - a.recScore);
    return scored.slice(0, 3);
  }, [campaigns, currentUser]);

  const featuredCampaigns = useMemo(
    () => campaigns.filter((c) => c.verified && c.status !== 'Completed').slice(0, 6),
    [campaigns]
  );

  const successStories = useMemo(
    () => campaigns.filter((c) => c.status === 'Completed').slice(0, 2),
    [campaigns]
  );

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8F9FC] to-[#F8F9FC] pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                TRUST • RECEIPT TRANSPARENCY • MILESTONE IMPACT
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#171923] tracking-tight leading-[1.1]">
                Together, We Can Fund a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#0EA5E9]">
                  Better Tomorrow.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Discover meaningful causes, support innovative ideas, and help people turn their dreams into reality—with live expense tracking, receipt previews, and milestone accountability.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <button
                  onClick={() => navigate('explore')}
                  className="px-6 py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
                >
                  Explore Campaigns <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('create-campaign')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4 text-[#635BFF]" /> Start a Campaign
                </button>
              </div>

              {/* Animated Key Platform Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#171923]">
                    {formatCompactINR(totalRaised)}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Total Funds Raised</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#16A34A]">1,420+</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Successful Campaigns</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#635BFF]">
                    {totalSupporters.toLocaleString('en-IN')}+
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Active Donors</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#171923]">85,000+</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">People Helped</p>
                </div>
              </div>
            </div>

            {/* Hero Interactive Transparency Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Transparency Ledger
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Trust Score 96/100
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/70 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-900">Neonatal Heart Surgery</span>
                    <span className="text-xs font-bold text-[#635BFF]">82% Funded</span>
                  </div>
                  <ProgressBar raised={368500} target={450000} />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Raised: ₹3,68,500</span>
                    <span>Utilized w/ Receipts: ₹2,57,000</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <p className="text-xs font-bold text-slate-500 uppercase">Verified Expense Breakdown</p>
                  {[
                    { label: 'Hospital Surgery & OT Deposit', amt: '₹1,80,000', tag: 'Receipt Attached' },
                    { label: 'Specialized Pediatric Medicines', amt: '₹42,000', tag: 'Receipt Attached' },
                    { label: 'Cardiac Echo & Blood Panel', amt: '₹35,000', tag: 'Receipt Attached' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span className="font-semibold text-slate-800">{row.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{row.amt}</span>
                        <span className="text-[10px] text-[#635BFF] font-medium">{row.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('campaign-details', { id: 'camp_1' })}
                  className="w-full py-3 rounded-xl bg-[#171923] hover:bg-[#635BFF] text-white text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  Inspect Full Fund Utilization Tracker <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMART RECOMMENDATIONS FOR USER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Smart Recommendations For You
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">
              Matched to Your Impact Interests
            </h2>
          </div>
          <button
            onClick={() => navigate('explore')}
            className="text-sm font-bold text-[#635BFF] hover:underline flex items-center gap-1"
          >
            View all campaigns <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
          ))}
        </div>
      </section>

      {/* EXPLORE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">Explore by Category</h2>
          <p className="text-slate-600 text-sm mt-2">
            Support verified individuals, grassroots nonprofits, student innovators, and urgent medical recoveries across 9 dedicated sectors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = campaigns.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => navigate('explore', { category: cat.id })}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#635BFF] hover:shadow-md transition text-left group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: cat.bg, color: cat.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm text-slate-900 group-hover:text-[#635BFF]">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{count} active causes</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              High Trust Score Campaigns
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923] mt-1">
              Featured Verified Fundraisers
            </h2>
          </div>
          <button
            onClick={() => navigate('explore')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800 hover:border-[#635BFF]"
          >
            Browse All {campaigns.length} Campaigns
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
          ))}
        </div>
      </section>

      {/* HOW FUNDBRIDGE WORKS (3 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">Simple & Accountable</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923] mt-1">How FundBridge Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create & Verify Campaign',
                desc: 'Use our 5-step wizard and AI Writing Assistant to craft your story, define milestones, and submit simulated verification documents.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Share & Rally Support',
                desc: 'Mobilize individual donors or form Group Giving Circles where friends pool funds together for maximum collective impact.',
                icon: Share2,
              },
              {
                step: '03',
                title: 'Track Funds & Publish Proof',
                desc: 'Log every expense with vendor receipts and mark milestones complete so donors see real-world outcomes.',
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative p-6 rounded-2xl bg-[#F8F9FC] border border-slate-200/60">
                  <span className="text-4xl font-black text-indigo-100 absolute top-4 right-5">{item.step}</span>
                  <div className="w-12 h-12 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE FUNDBRIDGE (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">Why Donors & Creators Trust FundBridge</h2>
          <p className="text-sm text-slate-600 mt-2">
            Engineered to eliminate opacity in traditional crowdfunding.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Verified Campaigns', desc: 'Multi-point Trust Score (0–100) evaluating identity, supporting documents, and bank readiness.', icon: ShieldCheck, color: '#16A34A' },
            { title: 'Transparent Fund Tracking', desc: 'Public itemized expense charts and downloadable vendor receipt previews for every campaign.', icon: Receipt, color: '#635BFF' },
            { title: 'Milestone Accountability', desc: 'Funds are mapped to clear project phases—Upcoming, In Progress, and Completed.', icon: Target, color: '#0EA5E9' },
            { title: 'Real Impact Stories', desc: 'Before-and-after visual proof on our Impact Wall connecting every rupee to human outcomes.', icon: Award, color: '#F59E0B' },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED SUCCESS STORIES & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">Completed Success Stories</h2>
          <button
            onClick={() => navigate('stories')}
            className="text-sm font-bold text-[#635BFF] hover:underline flex items-center gap-1"
          >
            Explore All Stories <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {successStories.map((story) => (
            <div key={story.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col sm:flex-row">
              <img src={story.image} alt={story.title} className="sm:w-48 h-48 sm:h-auto object-cover" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A]">
                    100% Goal Achieved • {formatINR(story.raisedAmount)}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-2 mb-1">{story.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{story.shortDescription}</p>
                </div>
                <button
                  onClick={() => navigate('campaign-details', { id: story.id })}
                  className="mt-4 text-xs font-bold text-[#635BFF] hover:underline flex items-center gap-1"
                >
                  View Final Audit & Story <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: 'Seeing the actual hospital pharmacy receipts uploaded two days after my donation gave me complete peace of mind.', author: 'Aarav Sharma', role: 'Monthly Donor • Bengaluru' },
            { quote: 'FundBridge’s milestone tracker helped our rural girls STEM scholarship raise ₹4.9L in under three weeks.', author: 'Dr. Kavita Nair', role: 'Campaign Creator • Jaipur' },
            { quote: 'Our college alumni group pooled ₹50,000 together using Group Funding—it turned giving into a shared celebration.', author: 'Neha Kulkarni', role: 'Giving Circle Lead • Pune' },
          ].map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex gap-1 text-[#F59E0B] mb-3">
                {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-slate-700 italic mb-4">"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold text-slate-900">{t.author}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="rounded-3xl bg-gradient-to-r from-[#171923] via-[#1E1B4B] to-[#635BFF] p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">Ready to Make Transparent Impact?</h2>
            <p className="text-slate-200 text-sm sm:text-base">
              Launch a verified fundraiser in minutes with our AI Writing Assistant or back a vetted social cause today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => navigate('create-campaign')}
              className="px-6 py-3.5 rounded-xl bg-white text-[#171923] font-bold text-sm hover:bg-slate-100 transition"
            >
              Start a Campaign
            </button>
            <button
              onClick={() => navigate('ai-writer')}
              className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-sm flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> Try AI Assistant
            </button>
          </div>
        </div>
      </section>

      <QuickDonationModal campaign={quickDonateCamp} onClose={() => setQuickDonateCamp(null)} />
    </div>
  );
};

// ============================================================================
// 8. EXPLORE CAMPAIGNS PAGE
// ============================================================================

const ExplorePage = () => {
  const { campaigns, route } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [quickDonateCamp, setQuickDonateCamp] = useState(null);

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params]);

  const locations = useMemo(() => {
    const locs = Array.from(new Set(campaigns.map((c) => c.location.split(',').pop().trim())));
    return ['All', ...locs];
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
        const matchesLoc =
          selectedLocation === 'All' || c.location.toLowerCase().includes(selectedLocation.toLowerCase());
        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Urgent' && c.isEmergency) ||
          c.status === statusFilter;
        const matchesVerified = !verifiedOnly || c.verified;

        return matchesSearch && matchesCat && matchesLoc && matchesStatus && matchesVerified;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'most_funded') return b.raisedAmount - a.raisedAmount;
        if (sortBy === 'ending_soon') return (a.daysLeft || 999) - (b.daysLeft || 999);
        return b.supportersCount - a.supportersCount;
      });
  }, [campaigns, searchQuery, selectedCategory, selectedLocation, statusFilter, verifiedOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#171923]">Explore Verified Campaigns</h1>
        <p className="text-slate-600 text-sm mt-1">
          Filter by category, state, verification status, or urgency to support causes that matter to you.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by campaign title, creator, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Urgent">Urgent / Emergency</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending Audit</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="most_funded">Sort: Most Funded (₹)</option>
              <option value="ending_soon">Sort: Ending Soon</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills + Verified Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {['All', ...CATEGORIES.map((c) => c.id)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#635BFF] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-[#16A34A] focus:ring-[#16A34A]"
            />
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Only
            </span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{filteredCampaigns.length}</span> campaigns
        </p>
        {(searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All' || statusFilter !== 'All' || verifiedOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLocation('All');
              setStatusFilter('All');
              setVerifiedOnly(false);
            }}
            className="text-xs font-bold text-[#635BFF] hover:underline"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No matching campaigns found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
          ))}
        </div>
      )}

      <QuickDonationModal campaign={quickDonateCamp} onClose={() => setQuickDonateCamp(null)} />
    </div>
  );
};

// ============================================================================
// 9. CAMPAIGN DETAILS PAGE (Transparency, Utilization, Milestones, Q&A)
// ============================================================================

const CampaignDetailsPage = () => {
  const {
    campaigns,
    route,
    navigate,
    currentUser,
    toggleWishlist,
    makeDonation,
    addCampaignExpense,
    addCampaignQuestion,
    replyCampaignQuestion,
    showToast,
  } = useApp();

  const campaign = campaigns.find((c) => c.id === route.params?.id) || campaigns[0];
  const [activeTab, setActiveTab] = useState('story');
  const [selectedPreset, setSelectedPreset] = useState(1000);
  const [customAmt, setCustomAmt] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donorMsg, setDonorMsg] = useState('');
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastDonatedAmt, setLastDonatedAmt] = useState(0);

  // Add Expense Modal (Creator Simulation)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expCat, setExpCat] = useState('Hospital Fees');
  const [expVendor, setExpVendor] = useState('');
  const [expCustomFile, setExpCustomFile] = useState('');

  // Q&A Inputs
  const [newQuestion, setNewQuestion] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  if (!campaign) return null;

  const pct = calcPercentage(campaign.raisedAmount, campaign.targetAmount);
  const isSaved = currentUser?.wishlist?.includes(campaign.id);
  const totalUtilized = (campaign.expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingFunds = Math.max(0, campaign.raisedAmount - totalUtilized);

  // Aggregate expense categories for Pie Chart
  const expenseChartData = useMemo(() => {
    const map = {};
    (campaign.expenses || []).forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    const arr = Object.entries(map).map(([name, value]) => ({ name, value }));
    if (remainingFunds > 0) {
      arr.push({ name: 'Remaining Escrow', value: remainingFunds });
    }
    return arr;
  }, [campaign.expenses, remainingFunds]);

  const CHART_COLORS = ['#635BFF', '#16A34A', '#F59E0B', '#0EA5E9', '#EC4899', '#94A3B8'];

  const handleDonateSubmit = (e) => {
    e.preventDefault();
    const amt = customAmt ? Number(customAmt) : selectedPreset;
    const ok = makeDonation({
      campaignId: campaign.id,
      amount: amt,
      anonymous,
      message: donorMsg,
    });
    if (ok) {
      setLastDonatedAmt(amt);
      setShowSuccessModal(true);
      setDonorMsg('');
      setCustomAmt('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setExpCustomFile(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expDesc || !expAmt) return;
    addCampaignExpense(campaign.id, {
      description: expDesc,
      amount: Number(expAmt),
      category: expCat,
      vendor: expVendor || 'Verified Supplier',
      receiptUrl: expCustomFile || undefined,
    });
    setExpDesc('');
    setExpAmt('');
    setExpVendor('');
    setExpCustomFile('');
    setExpenseModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('explore')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#635BFF] mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Explore Campaigns
      </button>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Campaign Story, Verification, Utilization, Milestones, Q&A */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="relative h-64 sm:h-80 bg-slate-100">
              <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/95 text-slate-900 shadow">
                  {campaign.category}
                </span>
                {campaign.isEmergency && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#EF4444] text-white shadow flex items-center gap-1">
                    <Siren className="w-3.5 h-3.5" /> {campaign.urgencyLabel || 'Urgent Cause'}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <TrustBadge verified={campaign.verified} score={campaign.trustScore} />
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {campaign.location}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171923] leading-tight mb-4">
                {campaign.title}
              </h1>

              {/* Creator Profile Strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#635BFF] text-white font-bold flex items-center justify-center">
                    {campaign.creatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{campaign.creatorName}</p>
                    <p className="text-xs text-slate-500">{campaign.creatorRole} • Beneficiary: {campaign.beneficiary}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleWishlist(campaign.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                      isSaved ? 'bg-indigo-50 border-[#635BFF] text-[#635BFF]' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" /> {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      showToast('Campaign link copied to clipboard!');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Section Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex overflow-x-auto gap-1 shadow-xs">
            {[
              { id: 'story', label: 'Story & Trust Audit' },
              { id: 'utilization', label: `Fund Utilization (${(campaign.expenses || []).length})` },
              { id: 'milestones', label: `Milestones (${(campaign.milestones || []).length})` },
              { id: 'updates', label: `Updates (${(campaign.updates || []).length})` },
              { id: 'donors', label: `Donors (${campaign.supportersCount})` },
              { id: 'qna', label: `Q&A (${(campaign.qna || []).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-[#635BFF] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: STORY & SIMULATED VERIFICATION BREAKDOWN */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-4">About This Campaign</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line mb-6">{campaign.story}</p>
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#635BFF] mb-1">Direct Beneficiary</p>
                  <p className="text-sm font-bold text-slate-900">{campaign.beneficiary}</p>
                </div>
              </div>

              {/* Campaign Verification System Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#16A34A]" /> Campaign Verification & Trust Score
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Simulated frontend trust evaluation (No real KYC or banking verification is performed).
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-right">
                    <span className="text-xs font-bold text-emerald-700 block">SIMULATED TRUST SCORE</span>
                    <span className="text-2xl font-black text-[#16A34A]">{campaign.trustScore}/100</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {[
                    { label: 'Identity Verification (Simulated)', status: campaign.verificationDetails?.identity || 'Verified' },
                    { label: 'Supporting Documents Audit', status: campaign.verificationDetails?.documents || 'Verified' },
                    { label: 'Beneficiary Bank Escrow Status', status: campaign.verificationDetails?.bank || 'Verified' },
                    { label: 'Fund Utilization Transparency', status: `${campaign.verificationDetails?.transparency || 90}% Score` },
                  ].map((check, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#F8F9FC] border border-slate-200/70 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{check.label}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          check.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FUND UTILIZATION TRACKER */}
          {activeTab === 'utilization' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Transparent Fund Utilization Tracker</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every rupee spent is logged with itemized categories and verifiable receipt previews.
                  </p>
                </div>
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5249F5] flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Log Expense & Receipt (Creator Demo)
                </button>
              </div>

              {/* Financial Summary Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <p className="text-xs text-slate-500">Total Collected</p>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">{formatINR(campaign.raisedAmount)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-xs text-[#635BFF] font-semibold">Total Utilized</p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#635BFF] mt-1">{formatINR(totalUtilized)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-xs text-[#16A34A] font-semibold">Remaining Escrow</p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#16A34A] mt-1">{formatINR(remainingFunds)}</p>
                </div>
              </div>

              {/* Expense Allocation Chart */}
              {expenseChartData.length > 0 && (
                <div className="h-64 w-full bg-[#F8F9FC] rounded-2xl p-4 border border-slate-200/70">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {expenseChartData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatINR(val)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Itemized Expense Ledger */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Itemized Expense Records</h3>
                {(campaign.expenses || []).length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-2xl">
                    No expenses logged yet. Funds are currently held safely in escrow.
                  </p>
                ) : (
                  campaign.expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#635BFF] transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-[#635BFF]">
                            {exp.category}
                          </span>
                          <span className="text-xs text-slate-400">{exp.date}</span>
                        </div>
                        <p className="font-bold text-slate-900 mt-1">{exp.description}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-base font-extrabold text-slate-900">{formatINR(exp.amount)}</span>
                        <button
                          onClick={() => setReceiptPreview(exp)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#635BFF] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONE-BASED FUNDING */}
          {activeTab === 'milestones' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Milestone-Based Funding Roadmap</h2>
              <p className="text-xs text-slate-500 mb-6">
                Funds are unlocked and deployed against clear, verifiable project phases.
              </p>

              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                {(campaign.milestones || []).map((m, idx) => {
                  const isDone = m.status === 'Completed';
                  const isProg = m.status === 'In Progress';
                  return (
                    <div key={m.id} className="relative bg-[#F8F9FC] p-5 rounded-2xl border border-slate-200/80">
                      <span
                        className={`w-4 h-4 rounded-full absolute -left-[33px] top-6 ring-4 ring-white ${
                          isDone ? 'bg-[#16A34A]' : isProg ? 'bg-[#635BFF]' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Milestone 0{idx + 1} • Target Date: {m.deadline}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isProg
                              ? 'bg-indigo-100 text-[#635BFF]'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                        <span className="font-extrabold text-[#635BFF]">{formatINR(m.target)}</span>
                      </div>
                      <p className="text-sm text-slate-600">{m.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CREATOR UPDATES */}
          {activeTab === 'updates' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Campaign Progress Updates</h2>
              {(campaign.updates || []).length === 0 ? (
                <p className="text-sm text-slate-500">No updates posted yet.</p>
              ) : (
                campaign.updates.map((upd) => (
                  <div key={upd.id} className="p-5 rounded-2xl bg-[#F8F9FC] border border-slate-200/70">
                    <span className="text-xs font-bold text-[#635BFF]">{upd.date}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{upd.title}</h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{upd.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: DONOR LIST */}
          {activeTab === 'donors' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">
                Recent Supporters ({campaign.supportersCount})
              </h2>
              <div className="divide-y divide-slate-100">
                {(campaign.donors || []).length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Be the first supporter of this campaign!</p>
                ) : (
                  campaign.donors.map((d) => (
                    <div key={d.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#635BFF] font-bold text-xs flex items-center justify-center shrink-0">
                          {d.anonymous ? '?' : d.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{d.name}</p>
                          {d.message && <p className="text-xs text-slate-600 mt-0.5">"{d.message}"</p>}
                          <span className="text-[11px] text-slate-400">{d.date}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm text-[#16A34A] shrink-0">
                        {formatINR(d.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INTERACTIVE CAMPAIGN Q&A */}
          {activeTab === 'qna' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Ask the Campaign Creator</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Have questions about medical documents, timelines, or fund usage? Ask directly below.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newQuestion.trim()) return;
                  addCampaignQuestion(campaign.id, newQuestion.trim());
                  setNewQuestion('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Write your question for the creator..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#635BFF] text-white font-bold text-sm hover:bg-[#5249F5] flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Ask
                </button>
              </form>

              <div className="space-y-4">
                {(campaign.qna || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-2xl">
                    No questions yet. Start the conversation above!
                  </p>
                ) : (
                  campaign.qna.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/80 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span className="font-bold text-slate-800">{item.user}</span>
                          <span>{item.date}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-1">Q: {item.question}</p>
                      </div>

                      {item.answer ? (
                        <div className="pl-4 border-l-2 border-[#16A34A] text-sm text-slate-700">
                          <span className="text-xs font-bold text-[#16A34A] block">Creator Response:</span>
                          {item.answer}
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write creator reply (Demo)..."
                            value={replyTexts[item.id] || ''}
                            onChange={(e) => setReplyTexts({ ...replyTexts, [item.id]: e.target.value })}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!replyTexts[item.id]?.trim()) return;
                              replyCampaignQuestion(campaign.id, item.id, replyTexts[item.id].trim());
                              setReplyTexts({ ...replyTexts, [item.id]: '' });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY DONATION WIDGET */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xl">
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-3xl font-black text-[#171923]">
                  {formatINR(campaign.raisedAmount)}
                </span>
                <span className="text-sm font-bold text-[#635BFF]">{pct}%</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                raised of <strong className="text-slate-800">{formatINR(campaign.targetAmount)}</strong> target
              </p>
              <ProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} height="h-3" />

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-lg font-extrabold text-slate-900">{campaign.supportersCount}</p>
                  <p className="text-xs text-slate-500">Total Donors</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {campaign.status === 'Completed' ? 'Funded' : `${campaign.daysLeft} Days`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {campaign.status === 'Completed' ? 'Campaign Status' : 'Remaining'}
                  </p>
                </div>
              </div>
            </div>

            {campaign.status === 'Completed' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <p className="font-bold text-emerald-900 text-sm">Campaign Successfully Funded!</p>
                <p className="text-xs text-emerald-700">
                  Explore the Fund Utilization tab to inspect receipts and milestone completion.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Choose Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000, 2500, 5000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setSelectedPreset(amt);
                          setCustomAmt('');
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          !customAmt && selectedPreset === amt
                            ? 'bg-[#635BFF] text-white border-[#635BFF]'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-[#635BFF]'
                        }`}
                      >
                        {formatINR(amt)}
                      </button>
                    ))}
                    <input
                      type="number"
                      min="10"
                      placeholder="Custom ₹"
                      value={customAmt}
                      onChange={(e) => setCustomAmt(e.target.value)}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Optional message of support..."
                  value={donorMsg}
                  onChange={(e) => setDonorMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                />

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded text-[#635BFF]"
                  />
                  <span className="text-xs text-slate-600">Donate anonymously</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  Donate {formatINR(customAmt ? Number(customAmt) : selectedPreset)} Now
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Simulated donation flow • Instant updates & receipt tracking
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <Modal
        isOpen={!!receiptPreview}
        onClose={() => setReceiptPreview(null)}
        title="Verified Expense Receipt Preview"
        maxWidth="max-w-md"
      >
        {receiptPreview && (
          <div className="space-y-4">
            <img
              src={receiptPreview.receiptUrl}
              alt="Receipt"
              className="w-full rounded-xl border border-slate-200 shadow-sm"
            />
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Category: <strong>{receiptPreview.category}</strong></span>
              <span>Logged: <strong>{receiptPreview.date}</strong></span>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Simulated Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Log New Fund Utilization Expense"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description *</label>
            <input
              type="text"
              required
              placeholder="e.g., ICU Pharmacy Medicines Batch 2"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="25000"
                value={expAmt}
                onChange={(e) => setExpAmt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
              <select
                value={expCat}
                onChange={(e) => setExpCat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option>Hospital Fees</option>
                <option>Medicines</option>
                <option>Medical Tests</option>
                <option>Tuition & Fees</option>
                <option>Equipment</option>
                <option>Logistics & Supplies</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Institution Name</label>
            <input
              type="text"
              placeholder="e.g., Apollo Pharmacy / University Registrar"
              value={expVendor}
              onChange={(e) => setExpVendor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Upload Receipt Image (Optional - Auto-generates if blank)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-[#635BFF] file:font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
          >
            Publish Expense to Public Ledger
          </button>
        </form>
      </Modal>

      {/* Donation Confirmation Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Donation Confirmed"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            You Contributed {formatINR(lastDonatedAmt)}!
          </h3>
          <p className="text-sm text-slate-600">
            The campaign progress bar, donor list, and your Donor Dashboard have been updated automatically.
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
          >
            Continue Viewing Campaign
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// 10. AI CAMPAIGN ASSISTANT PAGE
// ============================================================================

const AIWriterPage = () => {
  const { setAiDraft, navigate, showToast } = useApp();
  const [category, setCategory] = useState('Education');
  const [idea, setIdea] = useState('');
  const [goal, setGoal] = useState('350000');
  const [shortDesc, setShortDesc] = useState('');
  const [audience, setAudience] = useState('Individual Donors & CSR Supporters');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!idea.trim()) {
      showToast('Please enter a campaign topic or basic idea.', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const numericGoal = Number(goal) || 250000;
      const generated = {
        title: `Empowering Change: ${idea.trim().replace(/^\w/, (c) => c.toUpperCase())} (${category} Initiative)`,
        category,
        suggestedTarget: numericGoal,
        summary: `A transparent, milestone-driven ${category.toLowerCase()} campaign aimed at ${idea.trim().toLowerCase()} for ${audience.toLowerCase()}, backed by itemized receipt tracking.`,
        story: `Every meaningful transformation begins when a community stands together.\n\nOur initiative focuses on ${idea.trim()}. ${
          shortDesc ? shortDesc + '\n\n' : ''
        }Designed specifically to benefit ${audience}, this campaign operates on FundBridge’s 100% transparency standard. Every contribution is mapped to clear project milestones, and official vendor receipts will be uploaded publicly in our Fund Utilization Tracker so donors can witness the real-world impact of their generosity.`,
        socialCaption: `🚀 Big change starts with small steps! Support our verified ${category} fundraiser: "${idea.trim()}". Track every rupee with live receipts on @FundBridgeIndia. Donate or share today! #FundBridge #SocialImpact #${category.replace(/\s+/g, '')}`,
        tags: [category, 'VerifiedImpact', 'TransparentGiving', 'IndiaSocialGood', audience.split(' ')[0]],
      };
      setResult(generated);
      setLoading(false);
    }, 950);
  };

  const handleUseInCreator = () => {
    if (!result) return;
    setAiDraft(result);
    showToast('AI Draft transferred to Campaign Creator!');
    navigate('create-campaign');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#635BFF] text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4" /> AI-INSPIRED CAMPAIGN STUDIO
        </div>
        <h1 className="text-3xl font-extrabold text-[#171923]">Craft a High-Trust Campaign Story</h1>
        <p className="text-sm text-slate-600 mt-2">
          Enter your core idea and let our template engine generate a compelling title, transparent story draft, social caption, and tags.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title or Core Idea *</label>
            <input
              type="text"
              required
              placeholder="e.g., Solar-powered computer lab for 60 village students"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Funding Goal (₹)</label>
            <input
              type="number"
              placeholder="350000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Beneficiaries / Audience</label>
            <input
              type="text"
              placeholder="e.g., Rural High School Girls in Odisha"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Context / Urgency Notes</label>
            <textarea
              rows={3}
              placeholder="Add specific details about why funds are needed right now..."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generating Campaign Draft...' : 'Generate Campaign Draft'}
          </button>
        </form>

        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#635BFF] flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900">Structuring high-conversion narrative & transparency plan...</p>
              <p className="text-xs text-slate-500">Applying FundBridge Trust & Impact best practices</p>
            </div>
          ) : result ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Draft Disclaimer: Generated via frontend templates. Please review and personalize before publishing.</span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Suggested Campaign Title</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{result.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-500 block">Suggested Category</span>
                  <span className="font-bold text-sm text-[#635BFF]">{result.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-500 block">Suggested Target</span>
                  <span className="font-bold text-sm text-slate-900">{formatINR(result.suggestedTarget)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Short Summary</span>
                <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3.5 rounded-xl">{result.summary}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Full Campaign Story</span>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-line bg-slate-50 p-4 rounded-xl leading-relaxed">
                  {result.story}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Social Media Share Caption</span>
                <p className="text-xs text-slate-700 mt-1 bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
                  {result.socialCaption}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={handleUseInCreator}
                className="w-full py-3.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                Use This Draft in Campaign Creator <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center h-full">
              <Sparkles className="w-10 h-10 text-indigo-300 mb-3" />
              <h3 className="font-bold text-slate-800">Your AI Draft Will Appear Here</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Fill out the prompt builder on the left to generate a ready-to-edit fundraising pitch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 11. CREATE CAMPAIGN PAGE (5-STEP WIZARD)
// ============================================================================

const CreateCampaignPage = () => {
  const { aiDraft, setAiDraft, addCampaign, navigate, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: aiDraft?.title || '',
    category: aiDraft?.category || 'Education',
    location: 'Bengaluru, Karnataka',
    isEmergency: false,
    coverTheme: '#635BFF',
    customImage: '',
    shortDescription: aiDraft?.summary || '',
    story: aiDraft?.story || '',
    beneficiary: '',
    targetAmount: aiDraft?.suggestedTarget || 250000,
    daysLeft: 30,
    milestone1Title: 'Phase 1: Initial Procurement & Setup',
    milestone1Amount: 100000,
    milestone2Title: 'Phase 2: Core Execution & Delivery',
    milestone2Amount: 150000,
    idDocName: '',
    supportDocName: '',
    bankVerifiedSim: true,
  });

  useEffect(() => {
    if (aiDraft) {
      setForm((prev) => ({
        ...prev,
        title: aiDraft.title,
        category: aiDraft.category,
        shortDescription: aiDraft.summary,
        story: aiDraft.story,
        targetAmount: aiDraft.suggestedTarget,
      }));
      setAiDraft(null);
    }
  }, [aiDraft, setAiDraft]);

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, customImage: reader.result });
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (!form.title.trim() || !form.story.trim()) {
      showToast('Please complete required title and story fields.', 'error');
      return;
    }

    const trustScore =
      70 +
      (form.idDocName ? 10 : 0) +
      (form.supportDocName ? 10 : 0) +
      (form.bankVerifiedSim ? 5 : 0);

    const coverImg =
      form.customImage ||
      createIllustrationSVG(
        form.title.slice(0, 26),
        `${form.category} • ${form.location}`,
        form.coverTheme,
        '#171923',
        form.isEmergency ? 'URGENT CAUSE' : 'VERIFIED CAMPAIGN'
      );

    const created = addCampaign({
      title: form.title,
      category: form.category,
      location: form.location,
      status: form.isEmergency ? 'Urgent' : 'Active',
      isEmergency: form.isEmergency,
      urgencyLabel: form.isEmergency ? 'Urgent Community Appeal' : undefined,
      verified: trustScore >= 85,
      trustScore,
      verificationDetails: {
        identity: form.idDocName ? 'Verified' : 'Pending',
        documents: form.supportDocName ? 'Verified' : 'Pending',
        bank: form.bankVerifiedSim ? 'Verified' : 'Not Submitted',
        completeness: 94,
        transparency: 90,
      },
      targetAmount: Number(form.targetAmount),
      daysLeft: Number(form.daysLeft),
      image: coverImg,
      shortDescription: form.shortDescription || form.story.slice(0, 140),
      story: form.story,
      beneficiary: form.beneficiary || 'Verified Community Beneficiary',
      expenses: [],
      milestones: [
        {
          id: generateId('m'),
          title: form.milestone1Title,
          target: Number(form.milestone1Amount),
          deadline: '2026-12-10',
          status: 'In Progress',
          description: 'Initial phase allocation with receipt verification.',
        },
        {
          id: generateId('m'),
          title: form.milestone2Title,
          target: Number(form.milestone2Amount),
          deadline: '2027-01-15',
          status: 'Upcoming',
          description: 'Final phase execution and impact report.',
        },
      ],
    });

    navigate('campaign-details', { id: created.id });
  };

  const steps = ['Basic Info', 'Campaign Story', 'Funding & Milestones', 'Verification', 'Review & Publish'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#171923]">Launch a Verified Campaign</h1>
          <p className="text-sm text-slate-600 mt-1">Complete the 5 steps below to publish live on FundBridge.</p>
        </div>
        <button
          onClick={() => navigate('ai-writer')}
          className="px-4 py-2 rounded-xl bg-indigo-50 text-[#635BFF] text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100"
        >
          <Sparkles className="w-4 h-4" /> Draft with AI Assistant
        </button>
      </div>

      {/* Step Progress Indicator */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {steps.map((label, idx) => {
          const sNum = idx + 1;
          const active = step === sNum;
          const done = step > sNum;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(sNum)}
              className={`p-3 rounded-2xl border text-left transition ${
                active
                  ? 'bg-[#635BFF] text-white border-[#635BFF] shadow-md'
                  : done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold uppercase block">Step 0{sNum}</span>
              <span className="text-xs font-bold truncate block mt-0.5">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 1: Basic Information</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title *</label>
              <input
                type="text"
                placeholder="e.g., Clean Drinking Water Filtration for 3 Rural Schools"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City & State</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50/70 border border-red-100 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isEmergency}
                onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
                className="rounded text-[#EF4444]"
              />
              <span className="text-xs font-bold text-red-900">
                Mark as Time-Sensitive Emergency Campaign (Displays Urgent badge)
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Custom Cover Image (or pick a theme banner)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="w-full text-xs text-slate-600 mb-3"
              />
              <div className="flex gap-2">
                {['#635BFF', '#16A34A', '#0EA5E9', '#EF4444', '#F59E0B'].map((hex) => (
                  <button
                    type="button"
                    key={hex}
                    onClick={() => setForm({ ...form, coverTheme: hex, customImage: '' })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      form.coverTheme === hex && !form.customImage ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Campaign Story & Beneficiary</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (Appears on Cards)</label>
              <input
                type="text"
                placeholder="One-sentence summary of the impact..."
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Details</label>
              <input
                type="text"
                placeholder="Who directly receives the funds or project output?"
                value={form.beneficiary}
                onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Fundraising Story *</label>
              <textarea
                rows={6}
                placeholder="Explain the challenge, your solution, and how donor contributions will transform lives..."
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 3: Funding Target & Milestones</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Funding Target (₹)</label>
                <input
                  type="number"
                  min="1000"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Duration (Days)</label>
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={form.daysLeft}
                  onChange={(e) => setForm({ ...form, daysLeft: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200 space-y-3">
              <p className="text-xs font-bold uppercase text-slate-500">Milestone Plan (Increases Donor Trust)</p>
              <div className="grid sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={form.milestone1Title}
                  onChange={(e) => setForm({ ...form, milestone1Title: e.target.value })}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
                <input
                  type="number"
                  value={form.milestone1Amount}
                  onChange={(e) => setForm({ ...form, milestone1Amount: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={form.milestone2Title}
                  onChange={(e) => setForm({ ...form, milestone2Title: e.target.value })}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
                <input
                  type="number"
                  value={form.milestone2Amount}
                  onChange={(e) => setForm({ ...form, milestone2Amount: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 4: Simulated Verification Documents</h2>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <strong>Frontend Simulation Notice:</strong> Do not upload sensitive real government IDs or bank details. Selecting any sample file simulates document attachment to boost your demo Trust Score.
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-900 mb-1">1. Creator Identity Proof (Simulated)</p>
                <p className="text-xs text-slate-500 mb-3">Attach sample ID card or NGO registration image</p>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, idDocName: e.target.files?.[0]?.name || 'sample_id.pdf' })}
                  className="text-xs"
                />
                {form.idDocName && <p className="text-xs text-[#16A34A] font-bold mt-2">✓ Attached: {form.idDocName}</p>}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-900 mb-1">2. Supporting Medical / Project Estimate</p>
                <p className="text-xs text-slate-500 mb-3">Hospital cost letter, quotation, or college fee circular</p>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, supportDocName: e.target.files?.[0]?.name || 'estimate_doc.pdf' })}
                  className="text-xs"
                />
                {form.supportDocName && <p className="text-xs text-[#16A34A] font-bold mt-2">✓ Attached: {form.supportDocName}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.bankVerifiedSim}
                onChange={(e) => setForm({ ...form, bankVerifiedSim: e.target.checked })}
                className="rounded text-[#16A34A]"
              />
              <span className="text-xs font-bold text-emerald-900">
                Simulate Escrow Bank Account Verification (Recommended for Verified Badge)
              </span>
            </label>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900">Step 5: Review & Publish</h2>
            <div className="p-5 rounded-2xl bg-[#F8F9FC] border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-[#635BFF] text-xs font-bold">{form.category}</span>
                <span className="text-xs font-bold text-slate-500">{form.location}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{form.title || 'Untitled Campaign'}</h3>
              <p className="text-sm text-slate-600">{form.shortDescription || form.story.slice(0, 160)}</p>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div><span className="text-slate-400 block">Target Goal</span><strong className="text-sm">{formatINR(form.targetAmount)}</strong></div>
                <div><span className="text-slate-400 block">Duration</span><strong className="text-sm">{form.daysLeft} Days</strong></div>
                <div><span className="text-slate-400 block">Est. Trust Score</span><strong className="text-sm text-[#16A34A]">{70 + (form.idDocName ? 10 : 0) + (form.supportDocName ? 10 : 0) + (form.bankVerifiedSim ? 5 : 0)}/100</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex justify-between pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold hover:bg-[#5249F5]"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="px-7 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/20"
            >
              Publish Campaign Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 12. DONOR DASHBOARD, CREATOR DASHBOARD & ADMIN MODERATION
// ============================================================================

const DonorDashboardPage = () => {
  const { currentUser, donations, campaigns, navigate } = useApp();

  const myDonations = useMemo(
    () => donations.filter((d) => d.userId === currentUser?.id || d.donorName === currentUser?.name),
    [donations, currentUser]
  );

  const totalDonated = myDonations.reduce((acc, d) => acc + d.amount, 0);
  const supportedIds = Array.from(new Set(myDonations.map((d) => d.campaignId)));
  const supportedCampaigns = campaigns.filter((c) => supportedIds.includes(c.id));
  const savedCampaigns = campaigns.filter((c) => currentUser?.wishlist?.includes(c.id));

  // Category Breakdown for Recharts
  const categoryData = useMemo(() => {
    const map = {};
    myDonations.forEach((d) => {
      map[d.category] = (map[d.category] || 0) + d.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [myDonations]);

  const badges = [
    { name: 'First Supporter', unlocked: myDonations.length >= 1, desc: 'Made your first contribution' },
    { name: 'Helping Hand', unlocked: totalDonated >= 2500, desc: 'Contributed ₹2,500+ across causes' },
    { name: 'Community Hero', unlocked: supportedIds.length >= 3, desc: 'Backed 3+ unique campaigns' },
    { name: 'Change Maker', unlocked: totalDonated >= 10000, desc: 'Contributed ₹10,000+ in total impact' },
    { name: 'Super Supporter', unlocked: totalDonated >= 25000, desc: 'Elite ₹25,000+ philanthropy tier' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-[#635BFF]">Donor Impact Portal</span>
          <h1 className="text-3xl font-extrabold text-[#171923]">Welcome back, {currentUser?.name || 'Supporter'}</h1>
        </div>
        <button
          onClick={() => navigate('explore')}
          className="px-4 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold"
        >
          Discover More Causes
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Donated', val: formatINR(totalDonated), color: '#635BFF' },
          { label: 'Campaigns Supported', val: supportedIds.length, color: '#16A34A' },
          { label: 'Saved Wishlist', val: savedCampaigns.length, color: '#F59E0B' },
          { label: 'Unlocked Badges', val: `${badges.filter((b) => b.unlocked).length}/5`, color: '#0EA5E9' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Achievement Badges */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#F59E0B]" /> Philanthropy Achievement Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`p-4 rounded-2xl border text-center ${
                b.unlocked
                  ? 'bg-amber-50/60 border-amber-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <Award className={`w-8 h-8 mx-auto mb-2 ${b.unlocked ? 'text-[#F59E0B]' : 'text-slate-300'}`} />
              <p className="text-xs font-extrabold">{b.name}</p>
              <p className="text-[11px] mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics + Donation History */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Giving by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Bar dataKey="amount" fill="#635BFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Donation History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myDonations.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 font-semibold text-slate-900 pr-3">
                      <button
                        onClick={() => navigate('campaign-details', { id: d.campaignId })}
                        className="hover:text-[#635BFF] text-left line-clamp-1"
                      >
                        {d.campaignTitle}
                      </button>
                    </td>
                    <td className="py-3 text-xs text-slate-500 whitespace-nowrap">{d.date}</td>
                    <td className="py-3 font-extrabold text-slate-900">{formatINR(d.amount)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A]">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Saved Wishlist Campaigns */}
      {savedCampaigns.length > 0 && (
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">Saved Wishlist Campaigns</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {savedCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreatorDashboardPage = () => {
  const {
    campaigns,
    updateCampaign,
    deleteCampaign,
    updateMilestoneStatus,
    addCampaignUpdate,
    navigate,
  } = useApp();

  const [selectedCampId, setSelectedCampId] = useState(campaigns[0]?.id || 'camp_1');
  const [updTitle, setUpdTitle] = useState('');
  const [updContent, setUpdContent] = useState('');

  const managedCampaigns = campaigns.slice(0, 6);
  const activeCamp = campaigns.find((c) => c.id === selectedCampId) || managedCampaigns[0];

  const totalRaisedAll = managedCampaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalSupportersAll = managedCampaigns.reduce((acc, c) => acc + c.supportersCount, 0);
  const totalViewsAll = managedCampaigns.reduce((acc, c) => acc + (c.views || 1200), 0);

  const trendData = [
    { day: 'Mon', amount: 42000 },
    { day: 'Tue', amount: 68000 },
    { day: 'Wed', amount: 55000 },
    { day: 'Thu', amount: 94000 },
    { day: 'Fri', amount: 120000 },
    { day: 'Sat', amount: 148000 },
    { day: 'Sun', amount: 175000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-[#16A34A]">Creator Command Center</span>
          <h1 className="text-3xl font-extrabold text-[#171923]">Campaign & Transparency Management</h1>
        </div>
        <button
          onClick={() => navigate('create-campaign')}
          className="px-4 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Funds Raised', val: formatINR(totalRaisedAll), color: '#16A34A' },
          { label: 'Managed Campaigns', val: managedCampaigns.length, color: '#635BFF' },
          { label: 'Total Supporters', val: totalSupportersAll, color: '#0EA5E9' },
          { label: 'Campaign Views', val: totalViewsAll.toLocaleString('en-IN'), color: '#171923' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 mb-4">Weekly Donation Velocity (₹)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#635BFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#635BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Area type="monotone" dataKey="amount" stroke="#635BFF" strokeWidth={3} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Management Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900 mb-4">Your Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                <th className="pb-3">Campaign</th>
                <th className="pb-3">Raised / Target</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {managedCampaigns.map((c) => (
                <tr key={c.id} className={selectedCampId === c.id ? 'bg-indigo-50/40' : ''}>
                  <td className="py-3.5 pr-4">
                    <p className="font-bold text-slate-900 line-clamp-1">{c.title}</p>
                    <span className="text-xs text-slate-500">{c.category} • Trust {c.trustScore}/100</span>
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{formatINR(c.raisedAmount)}</span>
                    <span className="text-xs text-slate-400"> / {formatCompactINR(c.targetAmount)}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.status === 'Paused' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => setSelectedCampId(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-[#635BFF] text-xs font-bold"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => navigate('campaign-details', { id: c.id })}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => updateCampaign(c.id, { status: c.status === 'Paused' ? 'Active' : 'Paused' })}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold"
                    >
                      {c.status === 'Paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={() => deleteCampaign(c.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-[#EF4444] text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Campaign Milestone & Update Controls */}
      {activeCamp && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Update Milestones: <span className="text-[#635BFF]">{activeCamp.title.slice(0, 32)}...</span>
            </h3>
            {(activeCamp.milestones || []).map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{m.title}</p>
                  <p className="text-xs text-slate-500">{formatINR(m.target)}</p>
                </div>
                <select
                  value={m.status}
                  onChange={(e) => updateMilestoneStatus(activeCamp.id, m.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Publish Creator Progress Update</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!updTitle.trim() || !updContent.trim()) return;
                addCampaignUpdate(activeCamp.id, updTitle, updContent);
                setUpdTitle('');
                setUpdContent('');
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Update Headline (e.g., Batch 2 Equipment Delivered)"
                value={updTitle}
                onChange={(e) => setUpdTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <textarea
                rows={3}
                required
                placeholder="Share transparent progress with your donors..."
                value={updContent}
                onChange={(e) => setUpdContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold"
              >
                Post Update to Supporters
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboardPage = () => {
  const { campaigns, users, donations, updateCampaign, showToast, navigate } = useApp();

  const pendingCampaigns = campaigns.filter((c) => !c.verified || c.status === 'Pending');
  const totalVolume = donations.reduce((acc, d) => acc + d.amount, 0) + campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-amber-900">
          <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0" />
          <span><strong>Simulated Admin Moderation Console:</strong> Approve or reject simulated verification requests below.</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registered Users', val: users.length + 1420 },
          { label: 'Total Campaigns', val: campaigns.length },
          { label: 'Platform Volume', val: formatCompactINR(totalVolume) },
          { label: 'Pending Verification', val: pendingCampaigns.length },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Verification Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Campaign Verification & Trust Queue</h2>
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrustBadge verified={c.verified} score={c.trustScore} />
                  <span className="text-xs text-slate-500">{c.category} • {c.location}</span>
                </div>
                <p className="font-bold text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">Creator: {c.creatorName} • Target: {formatINR(c.targetAmount)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('campaign-details', { id: c.id })}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Inspect Docs
                </button>
                <button
                  onClick={() => {
                    updateCampaign(c.id, {
                      verified: true,
                      status: 'Active',
                      trustScore: Math.max(92, c.trustScore),
                      verificationDetails: { identity: 'Verified', documents: 'Verified', bank: 'Verified', completeness: 96, transparency: 94 },
                    });
                    showToast(`Approved & Verified "${c.title}"`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold"
                >
                  Approve & Verify
                </button>
                <button
                  onClick={() => {
                    updateCampaign(c.id, { verified: false, status: 'Pending', trustScore: 45 });
                    showToast(`Marked "${c.title}" for additional review.`, 'warning');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-[#EF4444] text-xs font-bold"
                >
                  Flag / Hold
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 13. IMPACT WALL, SUCCESS STORIES, EMERGENCY HUB, GROUP FUNDING, HOW IT WORKS
// ============================================================================

const ImpactWallPage = () => {
  const { campaigns, navigate } = useApp();
  const [catFilter, setCatFilter] = useState('All');
  const [viewMode, setViewMode] = useState({}); // campaignId -> 'before' | 'after'

  const impactCampaigns = campaigns.filter(
    (c) => (c.beforeImage || c.status === 'Completed' || c.verified) && (catFilter === 'All' || c.category === catFilter)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Verified Real-World Outcomes</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923] mt-1">The FundBridge Impact Wall</h1>
        <p className="text-sm text-slate-600 mt-2">
          Toggle Before & After snapshots to witness how donor contributions translate into measurable human and ecological change.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['All', 'Medical', 'Education', 'Environment', 'Startup', 'Community Development', 'Animal Welfare'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              catFilter === cat ? 'bg-[#635BFF] text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {impactCampaigns.map((c) => {
          const mode = viewMode[c.id] || 'after';
          const displayImg =
            mode === 'before' && c.beforeImage
              ? c.beforeImage
              : mode === 'after' && c.afterImage
              ? c.afterImage
              : c.image;

          return (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-52">
                <img src={displayImg} alt={c.title} className="w-full h-full object-cover" />
                {c.beforeImage && c.afterImage && (
                  <div className="absolute bottom-3 right-3 bg-slate-900/85 p-1 rounded-xl flex gap-1">
                    <button
                      onClick={() => setViewMode({ ...viewMode, [c.id]: 'before' })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        mode === 'before' ? 'bg-white text-slate-900' : 'text-slate-300'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setViewMode({ ...viewMode, [c.id]: 'after' })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        mode === 'after' ? 'bg-[#16A34A] text-white' : 'text-slate-300'
                      }`}
                    >
                      After
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-[#635BFF]">{c.category}</span>
                  <span className="font-bold text-[#16A34A]">{formatINR(c.raisedAmount)} Raised</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{c.title}</h3>
                <p className="text-xs text-slate-500 mb-3">Beneficiary: <strong>{c.beneficiary}</strong></p>
                <p className="text-sm text-slate-600 flex-1 mb-4">{c.shortDescription}</p>
                <button
                  onClick={() => navigate('campaign-details', { id: c.id })}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#635BFF] text-white text-xs font-bold transition"
                >
                  Inspect Full Impact & Receipts
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SuccessStoriesPage = () => {
  const { campaigns, navigate } = useApp();
  const completed = campaigns.filter((c) => c.status === 'Completed' || calcPercentage(c.raisedAmount, c.targetAmount) >= 85);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase text-[#635BFF]">Milestones Achieved</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923] mt-1">Success Stories</h1>
        <p className="text-sm text-slate-600 mt-2">
          Celebrating campaigns that reached or exceeded their goals with full fund utilization accountability.
        </p>
      </div>

      <div className="space-y-8">
        {completed.map((story) => (
          <div key={story.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm grid md:grid-cols-12">
            <div className="md:col-span-5">
              <img src={story.afterImage || story.image} alt={story.title} className="w-full h-full min-h-[240px] object-cover" />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {calcPercentage(story.raisedAmount, story.targetAmount)}% Funded ({formatINR(story.raisedAmount)})
                  </span>
                  <span className="text-xs text-slate-500">{story.supportersCount} Supporters • {story.location}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{story.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{story.story}</p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                  <strong>Creator & Beneficiary Outcome:</strong> {story.beneficiary}
                </div>
              </div>
              <div className="pt-5 mt-5 border-t border-slate-100 flex justify-between items-center">
                <TrustBadge verified={story.verified} score={story.trustScore} />
                <button
                  onClick={() => navigate('campaign-details', { id: story.id })}
                  className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold"
                >
                  View Expense Receipts
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmergencyFundingPage = () => {
  const { campaigns } = useApp();
  const [quickDonateCamp, setQuickDonateCamp] = useState(null);
  const urgentCampaigns = campaigns.filter((c) => c.isEmergency || c.category === 'Emergency' || c.daysLeft <= 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#EF4444] to-[#991B1B] text-white mb-10 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/15 w-fit px-3 py-1 rounded-full mb-3">
          <Siren className="w-4 h-4 animate-pulse" /> Rapid Response Emergency Hub
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Time-Sensitive Medical & Disaster Relief</h1>
        <p className="text-red-100 text-sm max-w-2xl">
          Every hour matters. These campaigns have fast-approaching hospital surgery dates or active disaster relief dispatches with priority verification.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {urgentCampaigns.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
        ))}
      </div>

      <QuickDonationModal campaign={quickDonateCamp} onClose={() => setQuickDonateCamp(null)} />
    </div>
  );
};

const GroupFundingPage = () => {
  const { groups, campaigns, createGroup, contributeToGroup, currentUser, showToast } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedCampId, setSelectedCampId] = useState(campaigns[0]?.id || 'camp_1');
  const [targetAmt, setTargetAmt] = useState(50000);
  const [memberNames, setMemberNames] = useState('Aarav Sharma, Priya Nair, Rohan Verma, Sneha Iyer, Karthik R');
  const [contribAmounts, setContribAmounts] = useState({});

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const camp = campaigns.find((c) => c.id === selectedCampId);
    const names = memberNames
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    if (!groupName || names.length === 0) return;

    const perPerson = Math.round(Number(targetAmt) / names.length);
    createGroup({
      name: groupName,
      campaignId: selectedCampId,
      campaignTitle: camp?.title || 'Verified Campaign',
      targetAmount: Number(targetAmt),
      description: `${names.length} friends pooling ${formatINR(perPerson)} each for collective social impact.`,
      members: names.map((n, i) => ({
        id: generateId(`gm_${i}`),
        name: n,
        pledged: perPerson,
        contributed: i === 0 ? perPerson : 0,
      })),
    });
    setGroupName('');
    setCreateOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-[#635BFF]">Collaborative Philanthropy</span>
          <h1 className="text-3xl font-extrabold text-[#171923]">Group Giving Circles</h1>
          <p className="text-sm text-slate-600 mt-1">
            Pool contributions with friends, classmates, or office teams toward a shared campaign milestone.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#635BFF] text-white text-sm font-bold flex items-center gap-2 shadow-md"
        >
          <Users className="w-4 h-4" /> Create a Funding Group
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((grp) => {
          const totalCollected = grp.members.reduce((sum, m) => sum + m.contributed, 0);
          return (
            <div key={grp.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{grp.name}</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#635BFF]">
                    {grp.members.length} Members
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Supporting: <strong>{grp.campaignTitle}</strong></p>
                <p className="text-sm text-slate-600 mt-2">{grp.description}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-1.5">
                  <span>Pool Collected: {formatINR(totalCollected)}</span>
                  <span className="text-[#635BFF]">Goal: {formatINR(grp.targetAmount)}</span>
                </div>
                <ProgressBar raised={totalCollected} target={grp.targetAmount} />
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase text-slate-400">Member Contributions</p>
                {grp.members.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#F8F9FC] border border-slate-200/70 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">
                        Contributed: <strong className="text-[#16A34A]">{formatINR(m.contributed)}</strong> / {formatINR(m.pledged)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="₹"
                        value={contribAmounts[m.id] || ''}
                        onChange={(e) => setContribAmounts({ ...contribAmounts, [m.id]: e.target.value })}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                      <button
                        onClick={() => {
                          const amt = Number(contribAmounts[m.id]) || Math.max(1000, m.pledged - m.contributed);
                          contributeToGroup(grp.id, m.id, amt);
                          setContribAmounts({ ...contribAmounts, [m.id]: '' });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#635BFF] text-white text-xs font-bold"
                      >
                        Add ₹
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Shared Funding Group">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Bangalore Runners Giving Circle"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Campaign</label>
            <select
              value={selectedCampId}
              onChange={(e) => setSelectedCampId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {campaigns.filter((c) => c.status !== 'Completed').map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Target Amount (₹)</label>
            <input
              type="number"
              required
              value={targetAmt}
              onChange={(e) => setTargetAmt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Members (Comma-separated names)</label>
            <textarea
              rows={2}
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
            Launch Giving Group
          </button>
        </form>
      </Modal>
    </div>
  );
};

const HowItWorksPage = () => {
  const { navigate } = useApp();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase text-[#635BFF]">Trust & Verification Methodology</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923] mt-1">
          How FundBridge Protects Every Rupee
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Built on three pillars—Trust, Transparency, and Impact—so donors can give with total clarity.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Simulated Trust Score (0–100)', desc: 'Evaluates creator identity, supporting estimates, escrow bank readiness, and profile completeness.' },
          { title: '2. Itemized Receipt Ledger', desc: 'Creators upload vendor invoices and pharmacy bills directly to the public Fund Utilization Tracker.' },
          { title: '3. Milestone-Gated Execution', desc: 'Large goals are divided into sequential milestones so supporters track progress phase by phase.' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">{card.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
        <strong>Important Prototype Disclosure:</strong> FundBridge is a frontend demonstration platform. All Trust Scores, verification statuses, receipts, and payment flows are simulated in browser state and localStorage for demonstration purposes.
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate('explore')}
          className="px-6 py-3.5 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
        >
          Explore Verified Campaigns
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 14. AUTHENTICATION & USER PROFILE PAGES
// ============================================================================

const AuthPages = ({ mode = 'login' }) => {
  const { loginUser, signupUser, navigate, switchDemoRole, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('aarav@fundbridge.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('DemoPass123');
  const [confirmPassword, setConfirmPassword] = useState('DemoPass123');
  const [role, setRole] = useState('donor');
  const [showPass, setShowPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      loginUser(email);
    } else if (mode === 'signup') {
      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }
      signupUser({ name, email, phone, role });
    } else if (mode === 'forgot') {
      setResetSent(true);
      showToast('Simulated password reset instructions generated!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-11 h-11 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center mx-auto mb-3">
            <HandHeart className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Frontend Demo Authentication • Persisted via LocalStorage</p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-bold uppercase text-slate-400 mb-2 text-center">Instant 1-Click Demo Profiles</p>
          <div className="grid grid-cols-3 gap-2">
            {['donor', 'creator', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  switchDemoRole(r);
                  navigate(r === 'creator' ? 'creator-dashboard' : r === 'admin' ? 'admin-dashboard' : 'donor-dashboard');
                }}
                className="py-2 rounded-xl bg-white border border-slate-200 hover:border-[#635BFF] text-xs font-bold capitalize text-slate-800"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">I want to join as</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'donor', label: 'Donor / Supporter' },
                    { id: 'creator', label: 'Campaign Creator' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold border ${
                        role === r.id ? 'bg-[#635BFF] text-white border-[#635BFF]' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password *</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => navigate('forgot')} className="text-xs text-[#635BFF] font-semibold">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          )}

          {resetSent && mode === 'forgot' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Simulated password reset link sent to <strong>{email}</strong>. You may now log in with any demo password.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-md"
          >
            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button onClick={() => navigate('signup')} className="text-[#635BFF] font-bold hover:underline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => navigate('login')} className="text-[#635BFF] font-bold hover:underline">
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { currentUser, switchDemoRole, showToast } = useApp();
  const [selectedInterests, setSelectedInterests] = useState(currentUser?.interests || ['Education', 'Medical']);

  if (!currentUser) return null;

  const toggleInterest = (cat) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#635BFF] text-white text-xl font-black flex items-center justify-center">
            {currentUser.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
            <p className="text-sm text-slate-500">{currentUser.email} • {currentUser.phone}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-[#635BFF]">
              Active Role: {currentUser.role}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Smart Recommendation Interests</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = selectedInterests.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleInterest(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    active ? 'bg-[#635BFF] text-white border-[#635BFF]' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => showToast('Impact preferences saved!')}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Save Preferences
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Switch Demo Role</h3>
          <div className="flex gap-2">
            {['donor', 'creator', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => switchDemoRole(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border ${
                  currentUser.role === r ? 'bg-[#635BFF] text-white border-[#635BFF]' : 'bg-white border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 15. MAIN APPLICATION SHELL
// ============================================================================

const MainRouter = () => {
  const { route, toast } = useApp();

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExplorePage />;
      case 'campaign-details':
        return <CampaignDetailsPage />;
      case 'ai-writer':
        return <AIWriterPage />;
      case 'create-campaign':
        return <CreateCampaignPage />;
      case 'donor-dashboard':
        return <DonorDashboardPage />;
      case 'creator-dashboard':
        return <CreatorDashboardPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'impact':
        return <ImpactWallPage />;
      case 'stories':
        return <SuccessStoriesPage />;
      case 'emergency':
        return <EmergencyFundingPage />;
      case 'groups':
        return <GroupFundingPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'login':
        return <AuthPages mode="login" />;
      case 'signup':
        return <AuthPages mode="signup" />;
      case 'forgot':
        return <AuthPages mode="forgot" />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#171923] font-sans selection:bg-[#635BFF] selection:text-white">
      <Navbar />

      {/* Floating Toast Feedback */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#171923] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <main className="flex-1 pb-12">{renderPage()}</main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}