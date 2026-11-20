import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import {
  Heart, ShieldCheck, Users, Search, ArrowRight, PlusCircle,
  CheckCircle2, Clock, MapPin, Share2, Bookmark, Sparkles,
  Bell, Menu, X, Eye, EyeOff, ChevronRight, ChevronLeft,
  Send, BarChart3, Lock, Building2, Stethoscope, GraduationCap,
  Rocket, Leaf, Cpu, Siren, HandHeart, PawPrint, Info,
  RefreshCw, ShieldAlert, Receipt
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
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
  if (num >= 10000000) return `â‚¹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `â‚¹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `â‚¹${(num / 1000).toFixed(1)}K`;
  return `â‚¹${num}`;
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
    <text x="24" y="58" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">FundBridge Simulated Audit Copy â€¢ GST Verified Vendor</text>
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
// 2. INITIAL FALLBACK DATA
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
    urgencyLabel: 'Critical â€¢ Surgery Scheduled in 6 Days',
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
    image: createIllustrationSVG('Save Baby Advik', 'Urgent Pediatric Cardiac Surgery â€¢ Bengaluru', '#EF4444', '#991B1B', 'URGENT MEDICAL'),
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
      { id: 'u_2', date: '2026-11-06', title: 'First hospital deposit paid with receipts uploaded', content: 'We transferred â‚¹1,80,000 directly to the hospital billing desk. Receipt is live in the Fund Utilization tab.' },
    ],
    donors: [
      { id: 'd_1', name: 'Aarav Sharma', amount: 5000, date: '2026-11-15', message: 'Praying for little Advikâ€™s speedy recovery!', anonymous: false },
      { id: 'd_2', name: 'Anonymous', amount: 25000, date: '2026-11-14', message: 'Stay strong parents. God bless.', anonymous: true },
      { id: 'd_3', name: 'Meera Krishnan', amount: 2500, date: '2026-11-12', message: 'Sending love and strength.', anonymous: false },
    ],
    qna: [
      { id: 'q_1', user: 'Vikramjit Singh', question: 'Is the hospital accepting direct CSR/80G certificates for this case?', answer: 'Yes! All donations routed through our registered Pediatric Care Trust qualify for instant simulated 80G tax receipts.', date: '2026-11-10' },
    ],
  },
];

const INITIAL_DONATIONS = [
  { id: 'don_101', userId: 'user_donor_1', donorName: 'Aarav Sharma', campaignId: 'camp_1', campaignTitle: 'Neonatal Heart Surgery for 8-Month-Old Baby Advik', category: 'Medical', amount: 5000, date: '2026-11-15', status: 'Completed', anonymous: false },
];

const INITIAL_GROUPS = [
  {
    id: 'grp_1',
    name: 'BITS 2019 Alumni Giving Circle',
    campaignId: 'camp_1',
    campaignTitle: 'Neonatal Heart Surgery for 8-Month-Old Baby Advik',
    targetAmount: 50000,
    description: '5 batchmates pooling â‚¹10,000 each for direct medical relief!',
    members: [
      { id: 'gm_1', name: 'Aarav Sharma', pledged: 10000, contributed: 10000 },
      { id: 'gm_2', name: 'Neha Kulkarni', pledged: 10000, contributed: 10000 },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif_1', title: 'Milestone Completed!', message: 'Baby Advikâ€™s campaign completed Milestone 1: Pre-Operative Diagnostics.', time: '2 hours ago', read: false, type: 'milestone' },
];

// ============================================================================
// 3. GLOBAL CONTEXT (Real JWT Auth + MongoDB Persistence + Demo Fallback)
// ============================================================================

const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [route, setRoute] = useState({ page: 'home', params: {} });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3800);
  };

  const normalizeUser = (u) => {
    if (!u) return null;
    const id = u._id || u.id;
    return {
      ...u,
      id,
      avatar:
        u.avatar ||
        (u.name || 'FB')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      interests: u.interests || ['Education', 'Medical'],
      wishlist: (u.wishlist || []).map((w) => (typeof w === 'object' ? w._id || w.id : w)),
    };
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('fundbridge_token');
      const saved = localStorage.getItem('fb_current_user');
      if (saved) return normalizeUser(JSON.parse(saved));
      return token ? null : INITIAL_USERS[0];
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

  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [donations, setDonations] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_donations');
      return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  });

  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [aiDraft, setAiDraft] = useState(null);

  const hasLiveToken = () => Boolean(localStorage.getItem('fundbridge_token'));

  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        if (hasLiveToken()) {
          const meRes = await api.getMe();
          if (meRes?.user) {
            setCurrentUser(normalizeUser(meRes.user));
          }
          try {
            const myDonRes = await api.getMyDonations();
            if (myDonRes?.donations) {
              setDonations(
                myDonRes.donations.map((d) => ({
                  ...d,
                  id: d._id || d.id,
                  campaignId: d.campaign?._id || d.campaign || d.campaignId,
                  campaignTitle: d.campaign?.title || d.campaignTitle || 'Verified Campaign',
                  category: d.campaign?.category || d.category || 'Social Causes',
                  date: (d.createdAt || d.date || new Date().toISOString()).split('T')[0],
                }))
              );
            }
          } catch (_) {}
        }

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
        console.warn('Backend sync warning:', err.message);
        if (err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('authorized')) {
          localStorage.removeItem('fundbridge_token');
          setCurrentUser(null);
        }
      }
    };
    fetchFromBackend();
  }, []);

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

  const navigate = (page, params = {}) => {
    if (page === 'create-campaign' && currentUser && currentUser.role === 'donor') {
      showToast('Donor accounts cannot create campaigns. Log in as a Creator.', 'error');
      return;
    }
    if (page === 'admin-dashboard' && (!currentUser || currentUser.role !== 'admin')) {
      showToast('Access Denied: Admin privileges required.', 'error');
      return;
    }
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pushNotification = (title, message, type = 'info') => {
    setNotifications((prev) => [
      { id: generateId('notif'), title, message, time: 'Just now', read: false, type },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (hasLiveToken()) {
      try { await api.markAllNotificationsRead(); } catch (_) {}
    }
  };

  const toggleWishlist = async (campaignId) => {
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

    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.toggleWishlist(campaignId); } catch (_) {}
    }
  };

  const makeDonation = async ({ campaignId, amount, anonymous, message, donorNameOverride }) => {
    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount < 10) {
      showToast('Please enter a valid donation amount (minimum â‚¹10).', 'error');
      return false;
    }

    const targetCamp = campaigns.find((c) => c.id === campaignId);
    if (!targetCamp) return false;

    const donorDisplay = anonymous
      ? 'Anonymous'
      : donorNameOverride || currentUser?.name || 'Guest Supporter';

    if (hasLiveToken() && campaignId.length === 24) {
      try {
        await api.donate({
          campaignId,
          amount: cleanAmount,
          anonymous: !!anonymous,
          message: message || 'Happy to support this meaningful cause!',
        });
      } catch (err) {
        showToast(err.message || 'Donation failed on server.', 'error');
        return false;
      }
    }

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

  const addCampaign = async (newCampData) => {
    if (hasLiveToken()) {
      try {
        const res = await api.createCampaign(newCampData);
        if (res?.campaign) {
          const savedCamp = { ...res.campaign, id: res.campaign._id };
          setCampaigns((prev) => [savedCamp, ...prev]);
          pushNotification('Campaign Submitted & Live', `"${savedCamp.title}" saved to MongoDB.`, 'success');
          showToast('Campaign published to MongoDB!');
          return savedCamp;
        }
      } catch (err) {
        showToast(err.message || 'Failed to create campaign on server.', 'error');
        return null;
      }
    }

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
    showToast('Campaign published locally (Demo Mode)!');
    return newCampaign;
  };

  const updateCampaign = async (campaignId, updates) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c))
    );
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.updateCampaign(campaignId, updates); } catch (err) { showToast(err.message, 'error'); }
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try {
        await api.deleteCampaign(campaignId);
      } catch (err) {
        showToast(err.message || 'Not authorized to delete this campaign.', 'error');
        return;
      }
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    showToast('Campaign deleted.', 'warning');
  };

  const addCampaignExpense = async (campaignId, expense) => {
    const payload = {
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: new Date().toISOString().split('T')[0],
      receiptUrl:
        expense.receiptUrl ||
        createReceiptSVG(expense.vendor || 'Verified Project Vendor', Number(expense.amount), new Date().toLocaleDateString('en-IN'), expense.category),
    };
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.addExpense(campaignId, payload); } catch (err) { showToast(err.message, 'error'); return; }
    }
    const newExp = { id: generateId('exp'), ...payload };
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, expenses: [newExp, ...(c.expenses || [])] } : c
      )
    );
    pushNotification('Expense Log Added', `New expense of ${formatINR(newExp.amount)} logged with receipt.`, 'transparency');
    showToast('Expense and receipt added to Fund Utilization Tracker!');
  };

  const updateMilestoneStatus = async (campaignId, milestoneId, status) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.updateMilestone(campaignId, milestoneId, status); } catch (err) { showToast(err.message, 'error'); return; }
    }
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          milestones: c.milestones.map((m) => ((m._id || m.id) === milestoneId ? { ...m, status } : m)),
        };
      })
    );
    pushNotification('Milestone Updated', `Milestone marked as ${status}.`, 'milestone');
    showToast(`Milestone status updated to ${status}`);
  };

  const addCampaignUpdate = async (campaignId, title, content) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.addUpdate(campaignId, { title, content }); } catch (err) { showToast(err.message, 'error'); return; }
    }
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

  const addCampaignQuestion = async (campaignId, questionText) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.askQuestion(campaignId, { question: questionText }); } catch (err) { showToast(err.message, 'error'); return; }
    }
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

  const replyCampaignQuestion = async (campaignId, qnaId, answerText) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.answerQuestion(campaignId, qnaId, answerText); } catch (err) { showToast(err.message, 'error'); return; }
    }
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          qna: (c.qna || []).map((item) =>
            (item._id || item.id) === qnaId ? { ...item, answer: answerText } : item
          ),
        };
      })
    );
    showToast('Reply published!');
  };

  const createGroup = async (groupData) => {
    if (hasLiveToken()) {
      try {
        const res = await api.createGroup(groupData);
        if (res?.group) {
          setGroups((prev) => [{ ...res.group, id: res.group._id }, ...prev]);
          showToast('Shared Funding Group saved to MongoDB!');
          return;
        }
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    }
    const newGrp = { id: generateId('grp'), ...groupData };
    setGroups((prev) => [newGrp, ...prev]);
    showToast('Shared Funding Group created!');
  };

  const contributeToGroup = async (groupId, memberId, amount) => {
    const cleanAmt = Number(amount);
    if (!cleanAmt || cleanAmt <= 0) return;
    let targetCampId = null;

    if (hasLiveToken() && groupId.length === 24) {
      try { await api.contributeGroup(groupId, cleanAmt); } catch (err) { showToast(err.message, 'error'); return; }
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        targetCampId = g.campaignId;
        return {
          ...g,
          members: g.members.map((m) =>
            (m._id || m.id) === memberId ? { ...m, contributed: m.contributed + cleanAmt } : m
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

  const switchDemoRole = (role) => {
    localStorage.removeItem('fundbridge_token');
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      showToast(`Switched demo profile to ${found.name} (${role.toUpperCase()})`);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res?.token && res?.user) {
        localStorage.setItem('fundbridge_token', res.token);
        const userObj = normalizeUser(res.user);
        setCurrentUser(userObj);
        showToast(`Welcome back, ${userObj.name}!`);
        navigate(
          userObj.role === 'admin'
            ? 'admin-dashboard'
            : userObj.role === 'creator'
            ? 'creator-dashboard'
            : 'home'
        );
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Invalid email or password.', 'error');
      return false;
    }
    return false;
  };

  const signupUser = async ({ name, email, phone, password, role }) => {
    try {
      const res = await api.register({
        name,
        email,
        phone,
        password,
        role: role || 'donor',
      });
      if (res?.token && res?.user) {
        localStorage.setItem('fundbridge_token', res.token);
        const userObj = normalizeUser(res.user);
        setCurrentUser(userObj);
        showToast(`Account created in MongoDB! Welcome, ${userObj.name}.`);
        navigate(userObj.role === 'creator' ? 'creator-dashboard' : 'donor-dashboard');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      return false;
    }
    return false;
  };

  const logoutUser = () => {
    localStorage.removeItem('fundbridge_token');
    localStorage.removeItem('fb_current_user');
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
      title="Verification & Trust Score"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
      {compact ? `Trust ${score}/100` : `Verified â€¢ Trust ${score}/100`}
    </span>
  );
};

const CampaignCard = ({ campaign, onQuickDonate }) => {
  const { navigate, currentUser, toggleWishlist } = useApp();
  const pct = calcPercentage(campaign.raisedAmount, campaign.targetAmount);
  const isSaved = currentUser?.wishlist?.includes(campaign.id);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser?.role !== 'donor' && (
              <button
                onClick={() => navigate('create-campaign')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-[#635BFF] text-white hover:bg-[#5249F5] shadow-sm shadow-indigo-500/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Campaign</span>
              </button>
            )}

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
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => { navigate('admin-dashboard'); setProfileOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" /> Admin Moderation
                        </button>
                      )}
                      <button
                        onClick={() => { navigate('profile'); setProfileOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-slate-500" /> Profile & Preferences
                      </button>
                    </div>

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
            {currentUser?.role !== 'donor' && (
              <button
                onClick={() => { navigate('create-campaign'); setMobileOpen(false); }}
                className="col-span-2 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-semibold text-center"
              >
                + Start a Campaign
              </button>
            )}
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
              Connected to MongoDB & Render API
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
              <RefreshCw className="w-3.5 h-3.5" /> Reset Local Cache
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>Â© {new Date().getFullYear()} FundBridge Social Impact Technologies. All rights reserved.</p>
          <p>React + Express + MongoDB Atlas</p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================================
// 6. QUICK DONATION MODAL
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

  const handleConfirm = async (e) => {
    e.preventDefault();
    const ok = await makeDonation({
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
            Your contribution to <strong>{campaign.title}</strong> has been recorded.
          </p>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Or Enter Custom Amount (â‚¹)</label>
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition"
          >
            Confirm Donation of {formatINR(finalAmount)}
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

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8F9FC] to-[#F8F9FC] pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#635BFF] text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                TRUST â€¢ RECEIPT TRANSPARENCY â€¢ MILESTONE IMPACT
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#171923] tracking-tight leading-[1.1]">
                Together, We Can Fund a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] to-[#0EA5E9]">
                  Better Tomorrow.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Discover meaningful causes, support innovative ideas, and help people turn their dreams into realityâ€”with live expense tracking, receipt previews, and milestone accountability.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <button
                  onClick={() => navigate('explore')}
                  className="px-6 py-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
                >
                  Explore Campaigns <ArrowRight className="w-4 h-4" />
                </button>
                {currentUser?.role !== 'donor' && (
                  <button
                    onClick={() => navigate('create-campaign')}
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-[#635BFF]" /> Start a Campaign
                  </button>
                )}
              </div>

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
                    <span>Raised: â‚¹3,68,500</span>
                    <span>Utilized w/ Receipts: â‚¹2,57,000</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <p className="text-xs font-bold text-slate-500 uppercase">Verified Expense Breakdown</p>
                  {[
                    { label: 'Hospital Surgery & OT Deposit', amt: 'â‚¹1,80,000', tag: 'Receipt Attached' },
                    { label: 'Specialized Pediatric Medicines', amt: 'â‚¹42,000', tag: 'Receipt Attached' },
                    { label: 'Cardiac Echo & Blood Panel', amt: 'â‚¹35,000', tag: 'Receipt Attached' },
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
                  onClick={() => navigate('campaign-details', { id: campaigns[0]?.id || 'camp_1' })}
                  className="w-full py-3 rounded-xl bg-[#171923] hover:bg-[#635BFF] text-white text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  Inspect Full Fund Utilization Tracker <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <option value="most_funded">Sort: Most Funded (â‚¹)</option>
              <option value="ending_soon">Sort: Ending Soon</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
        ))}
      </div>

      <QuickDonationModal campaign={quickDonateCamp} onClose={() => setQuickDonateCamp(null)} />
    </div>
  );
};

// ============================================================================
// 9. CAMPAIGN DETAILS PAGE
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

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expCat, setExpCat] = useState('Hospital Fees');
  const [expVendor, setExpVendor] = useState('');
  const [expCustomFile, setExpCustomFile] = useState('');

  const [newQuestion, setNewQuestion] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  if (!campaign) return null;

  const pct = calcPercentage(campaign.raisedAmount, campaign.targetAmount);
  const isSaved = currentUser?.wishlist?.includes(campaign.id);
  const totalUtilized = (campaign.expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingFunds = Math.max(0, campaign.raisedAmount - totalUtilized);

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

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    const amt = customAmt ? Number(customAmt) : selectedPreset;
    const ok = await makeDonation({
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

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expDesc || !expAmt) return;
    await addCampaignExpense(campaign.id, {
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
      <button
        onClick={() => navigate('explore')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#635BFF] mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Explore Campaigns
      </button>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
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

              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#635BFF] text-white font-bold flex items-center justify-center">
                    {campaign.creatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{campaign.creatorName}</p>
                    <p className="text-xs text-slate-500">{campaign.creatorRole} â€¢ Beneficiary: {campaign.beneficiary}</p>
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

          {activeTab === 'story' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">About This Campaign</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line mb-6">{campaign.story}</p>
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <p className="text-xs font-bold uppercase tracking-wider text-[#635BFF] mb-1">Direct Beneficiary</p>
                <p className="text-sm font-bold text-slate-900">{campaign.beneficiary}</p>
              </div>
            </div>
          )}

          {activeTab === 'utilization' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Transparent Fund Utilization Tracker</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every rupee spent is logged with itemized categories and verifiable receipt previews.
                  </p>
                </div>
                {currentUser?.role !== 'donor' && (
                  <button
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold hover:bg-[#5249F5] flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Log Expense & Receipt
                  </button>
                )}
              </div>

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

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Itemized Expense Records</h3>
                {(campaign.expenses || []).length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-2xl">
                    No expenses logged yet. Funds are currently held safely in escrow.
                  </p>
                ) : (
                  campaign.expenses.map((exp, i) => (
                    <div
                      key={exp._id || exp.id || i}
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

          {activeTab === 'milestones' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Milestone-Based Funding Roadmap</h2>
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                {(campaign.milestones || []).map((m, idx) => {
                  const isDone = m.status === 'Completed';
                  const isProg = m.status === 'In Progress';
                  return (
                    <div key={m._id || m.id || idx} className="relative bg-[#F8F9FC] p-5 rounded-2xl border border-slate-200/80">
                      <span
                        className={`w-4 h-4 rounded-full absolute -left-[33px] top-6 ring-4 ring-white ${
                          isDone ? 'bg-[#16A34A]' : isProg ? 'bg-[#635BFF]' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Milestone 0{idx + 1} â€¢ Target Date: {m.deadline}
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

          {activeTab === 'updates' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Campaign Progress Updates</h2>
              {(campaign.updates || []).length === 0 ? (
                <p className="text-sm text-slate-500">No updates posted yet.</p>
              ) : (
                campaign.updates.map((upd, idx) => (
                  <div key={upd._id || upd.id || idx} className="p-5 rounded-2xl bg-[#F8F9FC] border border-slate-200/70">
                    <span className="text-xs font-bold text-[#635BFF]">{upd.date}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{upd.title}</h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{upd.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'donors' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">
                Recent Supporters ({campaign.supportersCount})
              </h2>
              <div className="divide-y divide-slate-100">
                {(campaign.donors || []).length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Be the first supporter of this campaign!</p>
                ) : (
                  campaign.donors.map((d, idx) => (
                    <div key={d._id || d.id || idx} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#635BFF] font-bold text-xs flex items-center justify-center shrink-0">
                          {d.anonymous ? '?' : (d.name || 'S').slice(0, 2).toUpperCase()}
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

          {activeTab === 'qna' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Ask the Campaign Creator</h2>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newQuestion.trim()) return;
                  await addCampaignQuestion(campaign.id, newQuestion.trim());
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
                {(campaign.qna || []).map((item, idx) => {
                  const qId = item._id || item.id || idx;
                  return (
                    <div key={qId} className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/80 space-y-3">
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
                            placeholder="Write creator reply..."
                            value={replyTexts[qId] || ''}
                            onChange={(e) => setReplyTexts({ ...replyTexts, [qId]: e.target.value })}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!replyTexts[qId]?.trim()) return;
                              await replyCampaignQuestion(campaign.id, qId, replyTexts[qId].trim());
                              setReplyTexts({ ...replyTexts, [qId]: '' });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
                      placeholder="Custom â‚¹"
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
              </form>
            )}
          </div>
        </div>
      </div>

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
          </div>
        )}
      </Modal>

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
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (â‚¹) *</label>
              <input
                type="number"
                required
                min="1"
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
              value={expVendor}
              onChange={(e) => setExpVendor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Upload Receipt Image</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs" />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
            Publish Expense to Public Ledger
          </button>
        </form>
      </Modal>

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
        }Designed specifically to benefit ${audience}, this campaign operates on FundBridgeâ€™s 100% transparency standard.`,
        socialCaption: `Support our verified ${category} fundraiser: "${idea.trim()}". #FundBridge #SocialImpact`,
        tags: [category, 'VerifiedImpact', 'TransparentGiving'],
      };
      setResult(generated);
      setLoading(false);
    }, 600);
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
        <h1 className="text-3xl font-extrabold text-[#171923]">Craft a High-Trust Campaign Story</h1>
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
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Funding Goal (â‚¹)</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Beneficiaries / Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Key Context</label>
            <textarea
              rows={3}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
          >
            {loading ? 'Generating...' : 'Generate Campaign Draft'}
          </button>
        </form>

        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-xl font-extrabold text-slate-900">{result.title}</h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl">{result.summary}</p>
              <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl">{result.story}</p>
              <button
                onClick={handleUseInCreator}
                className="w-full py-3.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
              >
                Use This Draft in Campaign Creator
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <p className="font-bold text-slate-800">Your AI Draft Will Appear Here</p>
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
  const { aiDraft, setAiDraft, addCampaign, navigate, showToast, currentUser } = useApp();
  const [step, setStep] = useState(1);

  if (currentUser?.role === 'donor') {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <Lock className="w-10 h-10 text-[#EF4444] mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">Creator Account Required</h2>
          <p className="text-sm text-slate-600">
            Your current account (<strong>{currentUser.name}</strong>) is registered as a <strong>Donor</strong>. Sign up with a Creator account to launch campaigns.
          </p>
          <button
            onClick={() => navigate('explore')}
            className="px-6 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
          >
            Back to Explore Campaigns
          </button>
        </div>
      </div>
    );
  }

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

  const handlePublish = async () => {
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
        `${form.category} â€¢ ${form.location}`,
        form.coverTheme,
        '#171923',
        form.isEmergency ? 'URGENT CAUSE' : 'VERIFIED CAMPAIGN'
      );

    const created = await addCampaign({
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
        transparency: 'Verified',
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

    if (created) {
      navigate('campaign-details', { id: created.id });
    }
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
                Mark as Time-Sensitive Emergency Campaign
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Custom Cover Image</label>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="w-full text-xs text-slate-600 mb-3" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Campaign Story & Beneficiary</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Details</label>
              <input
                type="text"
                value={form.beneficiary}
                onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Fundraising Story *</label>
              <textarea
                rows={6}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Funding Target (â‚¹)</label>
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
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Step 4: Verification Documents</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-900 mb-1">1. Creator Identity Proof</p>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, idDocName: e.target.files?.[0]?.name || 'sample_id.pdf' })}
                  className="text-xs"
                />
              </div>
              <div className="p-4 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-900 mb-1">2. Supporting Estimate</p>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, supportDocName: e.target.files?.[0]?.name || 'estimate_doc.pdf' })}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900">Step 5: Review & Publish</h2>
            <div className="p-5 rounded-2xl bg-[#F8F9FC] border border-slate-200 space-y-3">
              <h3 className="text-xl font-extrabold text-slate-900">{form.title || 'Untitled Campaign'}</h3>
              <p className="text-sm text-slate-600">{form.shortDescription || form.story.slice(0, 160)}</p>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div><span className="text-slate-400 block">Target Goal</span><strong className="text-sm">{formatINR(form.targetAmount)}</strong></div>
                <div><span className="text-slate-400 block">Duration</span><strong className="text-sm">{form.daysLeft} Days</strong></div>
              </div>
            </div>
          </div>
        )}

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
  const savedCampaigns = campaigns.filter((c) => currentUser?.wishlist?.includes(c.id));

  const categoryData = useMemo(() => {
    const map = {};
    myDonations.forEach((d) => {
      map[d.category] = (map[d.category] || 0) + d.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [myDonations]);

  const badges = [
    { name: 'First Supporter', unlocked: myDonations.length >= 1 },
    { name: 'Helping Hand', unlocked: totalDonated >= 2500 },
    { name: 'Community Hero', unlocked: supportedIds.length >= 3 },
    { name: 'Change Maker', unlocked: totalDonated >= 10000 },
    { name: 'Super Supporter', unlocked: totalDonated >= 25000 },
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
    </div>
  );
};

const CreatorDashboardPage = () => {
  const {
    campaigns,
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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Funds Raised', val: formatINR(totalRaisedAll), color: '#16A34A' },
          { label: 'Managed Campaigns', val: managedCampaigns.length, color: '#635BFF' },
          { label: 'Total Supporters', val: totalSupportersAll, color: '#0EA5E9' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

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
                    <span className="text-xs text-slate-500">{c.category}</span>
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{formatINR(c.raisedAmount)}</span>
                    <span className="text-xs text-slate-400"> / {formatCompactINR(c.targetAmount)}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
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

      {activeCamp && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Update Milestones</h3>
            {(activeCamp.milestones || []).map((m, idx) => {
              const mId = m._id || m.id || idx;
              return (
                <div key={mId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">{formatINR(m.target)}</p>
                  </div>
                  <select
                    value={m.status}
                    onChange={(e) => updateMilestoneStatus(activeCamp.id, mId, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Publish Creator Progress Update</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!updTitle.trim() || !updContent.trim()) return;
                await addCampaignUpdate(activeCamp.id, updTitle, updContent);
                setUpdTitle('');
                setUpdContent('');
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Update Headline"
                value={updTitle}
                onChange={(e) => setUpdTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <textarea
                rows={3}
                required
                placeholder="Share transparent progress..."
                value={updContent}
                onChange={(e) => setUpdContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold">
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
  const { campaigns, users, donations, updateCampaign, showToast, navigate, currentUser } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <ShieldAlert className="w-10 h-10 text-[#EF4444] mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">403 Forbidden â€¢ Admin Only</h2>
          <p className="text-sm text-slate-600">You do not have permission to view the Admin Moderation Console.</p>
          <button
            onClick={() => navigate('home')}
            className="px-6 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const pendingCampaigns = campaigns.filter((c) => !c.verified || c.status === 'Pending');
  const totalVolume = donations.reduce((acc, d) => acc + d.amount, 0) + campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
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

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Campaign Verification & Trust Queue</h2>
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrustBadge verified={c.verified} score={c.trustScore} />
                  <span className="text-xs text-slate-500">{c.category} â€¢ {c.location}</span>
                </div>
                <p className="font-bold text-slate-900">{c.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('campaign-details', { id: c.id })}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Inspect
                </button>
                <button
                  onClick={() => {
                    updateCampaign(c.id, { verified: true, status: 'Active', trustScore: Math.max(92, c.trustScore) });
                    showToast(`Approved "${c.title}"`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold"
                >
                  Approve & Verify
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

  const impactCampaigns = campaigns.filter(
    (c) => catFilter === 'All' || c.category === catFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923]">The FundBridge Impact Wall</h1>
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
        {impactCampaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-52">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-[#635BFF]">{c.category}</span>
                <span className="font-bold text-[#16A34A]">{formatINR(c.raisedAmount)} Raised</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-slate-600 flex-1 mb-4">{c.shortDescription}</p>
              <button
                onClick={() => navigate('campaign-details', { id: c.id })}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#635BFF] text-white text-xs font-bold transition"
              >
                Inspect Full Impact & Receipts
              </button>
            </div>
          </div>
        ))}
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923]">Success Stories</h1>
      </div>

      <div className="space-y-8">
        {completed.map((story) => (
          <div key={story.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm grid md:grid-cols-12">
            <div className="md:col-span-5">
              <img src={story.afterImage || story.image} alt={story.title} className="w-full h-full min-h-[240px] object-cover" />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{story.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{story.story}</p>
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
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Time-Sensitive Medical & Disaster Relief</h1>
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
  const { groups, campaigns, createGroup, contributeToGroup } = useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedCampId, setSelectedCampId] = useState(campaigns[0]?.id || 'camp_1');
  const [targetAmt, setTargetAmt] = useState(50000);
  const [memberNames, setMemberNames] = useState('Aarav Sharma, Priya Nair');
  const [contribAmounts, setContribAmounts] = useState({});

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const camp = campaigns.find((c) => c.id === selectedCampId);
    const names = memberNames.split(',').map((n) => n.trim()).filter(Boolean);
    if (!groupName || names.length === 0) return;

    const perPerson = Math.round(Number(targetAmt) / names.length);
    await createGroup({
      name: groupName,
      campaignId: selectedCampId,
      campaignTitle: camp?.title || 'Verified Campaign',
      targetAmount: Number(targetAmt),
      description: `${names.length} friends pooling ${formatINR(perPerson)} each.`,
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
        <h1 className="text-3xl font-extrabold text-[#171923]">Group Giving Circles</h1>
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
                <h2 className="text-xl font-extrabold text-slate-900">{grp.name}</h2>
                <p className="text-xs text-slate-500 mt-1">Supporting: <strong>{grp.campaignTitle}</strong></p>
              </div>
              <ProgressBar raised={totalCollected} target={grp.targetAmount} />
              <div className="space-y-2.5">
                {grp.members.map((m, idx) => {
                  const mId = m._id || m.id || idx;
                  return (
                    <div key={mId} className="p-3 rounded-xl bg-[#F8F9FC] border border-slate-200/70 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">Contributed: {formatINR(m.contributed)} / {formatINR(m.pledged)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="â‚¹"
                          value={contribAmounts[mId] || ''}
                          onChange={(e) => setContribAmounts({ ...contribAmounts, [mId]: e.target.value })}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <button
                          onClick={async () => {
                            const amt = Number(contribAmounts[mId]) || Math.max(1000, m.pledged - m.contributed);
                            await contributeToGroup(grp.id, mId, amt);
                            setContribAmounts({ ...contribAmounts, [mId]: '' });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                        >
                          Add â‚¹
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Shared Funding Group">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
          <select
            value={selectedCampId}
            onChange={(e) => setSelectedCampId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
          >
            {campaigns.filter((c) => c.status !== 'Completed').map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <input
            type="number"
            required
            value={targetAmt}
            onChange={(e) => setTargetAmt(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
          <textarea
            rows={2}
            value={memberNames}
            onChange={(e) => setMemberNames(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171923]">How FundBridge Protects Every Rupee</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Trust Score (0â€“100)', desc: 'Evaluates creator identity, supporting estimates, and escrow readiness.' },
          { title: '2. Itemized Receipt Ledger', desc: 'Creators upload vendor invoices directly to the public Fund Utilization Tracker.' },
          { title: '3. Milestone-Gated Execution', desc: 'Goals are divided into sequential milestones so supporters track progress.' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">{card.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button onClick={() => navigate('explore')} className="px-6 py-3.5 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [showPass, setShowPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          showToast('Passwords do not match!', 'error');
          return;
        }
        await signupUser({ name, email, phone, password, role });
      } else if (mode === 'forgot') {
        setResetSent(true);
        showToast('Password reset instructions sent!');
      }
    } finally {
      setSubmitting(false);
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
          <p className="text-xs text-slate-500 mt-1">Secured with JWT & MongoDB Atlas</p>
        </div>

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
                  placeholder="Rohan Kumar"
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
              placeholder="you@example.com"
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
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          )}

          {resetSent && mode === 'forgot' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Password reset link sent to <strong>{email}</strong>.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm shadow-md disabled:opacity-60"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              Donâ€™t have an account?{' '}
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
            <p className="text-sm text-slate-500">{currentUser.email} â€¢ {currentUser.phone}</p>
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
