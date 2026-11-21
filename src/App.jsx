import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import {
  Heart, ShieldCheck, Users, Search, ArrowRight, PlusCircle,
  CheckCircle2, Clock, MapPin, Share2, Bookmark, Sparkles,
  Bell, Menu, X, Eye, EyeOff, ChevronRight, ChevronLeft,
  Send, BarChart3, Lock, Building2, Stethoscope, GraduationCap,
  Rocket, Leaf, Cpu, Siren, HandHeart, PawPrint, Info,
  RefreshCw, Receipt
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { api } from './services/api';

// ============================================================================
// 1. UTILITIES & HELPERS
// ============================================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    <text x="24" y="58" font-family="Inter, sans-serif" font-size="12" fill="#94A3B8">FundBridge Audit Copy • GST Verified Vendor</text>
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
    wishlist: ['camp_1'],
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
    wishlist: [],
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
    targetAmount: 450000,
    raisedAmount: 368500,
    supportersCount: 284,
    daysLeft: 6,
    createdAt: '2026-10-28',
    views: 4820,
    image: createIllustrationSVG('Save Baby Advik', 'Urgent Pediatric Cardiac Surgery • Bengaluru', '#EF4444', '#991B1B', 'URGENT MEDICAL'),
    afterImage: createIllustrationSVG('Recovery Milestone', 'Post-Surgery Pediatric Ward Monitoring', '#16A34A', '#15803D', 'TARGET OUTCOME'),
    shortDescription: 'Baby Advik was diagnosed with a complex congenital heart defect. Immediate open-heart surgery at Narayana Pediatric Institute can save his life.',
    story: 'Advik is the first child of Rajesh (a daily-wage school bus driver) and Sunita. At 6 months, doctors detected a severe Ventricular Septal Defect requiring urgent surgical correction. Every rupee goes directly to the hospital escrow account.',
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
      { id: 'u_1', date: '2026-11-14', title: 'Pre-op tests cleared! Surgery date locked', content: 'Thanks to 280+ generous donors, Advik has been cleared by the anesthesia team.' },
    ],
    donors: [
      { id: 'd_1', name: 'Aarav Sharma', amount: 5000, date: '2026-11-15', message: 'Praying for little Advik’s speedy recovery!', anonymous: false },
    ],
    qna: [
      { id: 'q_1', user: 'Vikramjit Singh', question: 'Is the hospital accepting direct CSR/80G certificates?', answer: 'Yes! All donations qualify for 80G receipts.', date: '2026-11-10' },
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
    description: 'Batchmates pooling funds for direct medical relief!',
    members: [
      { id: 'gm_1', name: 'Aarav Sharma', pledged: 10000, contributed: 10000 },
      { id: 'gm_2', name: 'Neha Kulkarni', pledged: 10000, contributed: 10000 },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif_1', title: 'Milestone Completed!', message: 'Baby Advik’s campaign completed Milestone 1: Pre-Operative Diagnostics.', time: '2 hours ago', read: false, type: 'milestone' },
];

// ============================================================================
// 3. GLOBAL CONTEXT
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
        (u.avatar && !u.avatar.startsWith('http') ? u.avatar : null) ||
        (u.name || 'FB').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
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
          if (meRes?.user) setCurrentUser(normalizeUser(meRes.user));
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

        const [campRes, groupRes] = await Promise.all([api.getCampaigns(), api.getGroups()]);
        if (campRes?.campaigns?.length) {
          setCampaigns(campRes.campaigns.map((c) => ({ ...c, id: c._id })));
        }
        if (groupRes?.groups?.length) {
          setGroups(groupRes.groups.map((g) => ({ ...g, id: g._id })));
        }
      } catch (err) {
        console.warn('Backend sync warning:', err.message);
      }
    };
    fetchFromBackend();
  }, []);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('fb_current_user', JSON.stringify(currentUser));
      else localStorage.removeItem('fb_current_user');
    } catch (_) {}
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem('fb_campaigns', JSON.stringify(campaigns)); } catch (_) {}
  }, [campaigns]);

  useEffect(() => {
    try { localStorage.setItem('fb_donations', JSON.stringify(donations)); } catch (_) {}
  }, [donations]);

  useEffect(() => {
    try { localStorage.setItem('fb_groups', JSON.stringify(groups)); } catch (_) {}
  }, [groups]);

  useEffect(() => {
    try { localStorage.setItem('fb_notifications', JSON.stringify(notifications)); } catch (_) {}
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
      showToast('Please log in to save campaigns.', 'warning');
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

  const processGatewayPayment = async ({
    campaignId,
    amount,
    paymentMethod,
    paymentDetail,
    anonymous,
    message,
    donorNameOverride,
  }) => {
    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount < 10) {
      throw new Error('Minimum donation amount is ₹10.');
    }

    const targetCamp = campaigns.find((c) => c.id === campaignId);
    if (!targetCamp) throw new Error('Campaign not found.');

    const donorDisplay = anonymous
      ? 'Anonymous Supporter'
      : donorNameOverride || currentUser?.name || 'Guest Supporter';

    let receiptData = {
      transactionRef: `TXN-FB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      orderId: `ORD-FB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: cleanAmount,
      paymentMethod,
      donorName: donorDisplay,
      campaignTitle: targetCamp.title,
      timestamp: new Date().toISOString(),
    };

    if (campaignId.length === 24) {
      const token = localStorage.getItem('fundbridge_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: cleanAmount, campaignId }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson.success) {
        throw new Error(orderJson.message || 'Failed to create payment order.');
      }

      await new Promise((r) => setTimeout(r, 1200));

      const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId: orderJson.order.id,
          campaignId,
          amount: cleanAmount,
          paymentMethod,
          paymentDetail,
          isAnonymous: Boolean(anonymous),
          message: message || 'Happy to support this meaningful cause!',
          donorName: donorDisplay,
        }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.success) {
        throw new Error(verifyJson.message || 'Payment verification failed.');
      }
      receiptData = verifyJson.receipt;
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      if (paymentDetail && paymentDetail.toLowerCase().includes('fail')) {
        throw new Error('Payment declined by bank (Simulated Test Failure).');
      }
    }

    const newDonorEntry = {
      id: generateId('donor'),
      name: donorDisplay,
      amount: cleanAmount,
      date: new Date().toISOString().split('T')[0],
      message: message || 'Happy to support this meaningful cause!',
      anonymous: Boolean(anonymous),
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
      anonymous: Boolean(anonymous),
      transactionRef: receiptData.transactionRef,
    };

    setDonations((prev) => [newDonationRecord, ...prev]);
    pushNotification(
      'Payment Verified!',
      `Paid ${formatINR(cleanAmount)} via ${paymentMethod} (${receiptData.transactionRef}) to "${targetCamp.title}".`,
      'success'
    );
    showToast(`Payment of ${formatINR(cleanAmount)} verified!`);

    return receiptData;
  };

  const addCampaign = async (newCampData) => {
    if (hasLiveToken()) {
      try {
        const res = await api.createCampaign(newCampData);
        if (res?.campaign) {
          const savedCamp = { ...res.campaign, id: res.campaign._id };
          setCampaigns((prev) => [savedCamp, ...prev]);
          showToast('Campaign published to MongoDB!');
          return savedCamp;
        }
      } catch (err) {
        showToast(err.message || 'Failed to create campaign.', 'error');
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
          content: 'All fund utilization logs and receipts will be uploaded transparently here.',
        },
      ],
      qna: [],
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast('Campaign published locally!');
    return newCampaign;
  };

  const updateCampaign = async (campaignId, updates) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c)));
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.updateCampaign(campaignId, updates); } catch (err) { showToast(err.message, 'error'); }
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (hasLiveToken() && campaignId.length === 24) {
      try { await api.deleteCampaign(campaignId); } catch (err) { showToast(err.message, 'error'); return; }
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
      prev.map((c) => (c.id === campaignId ? { ...c, expenses: [newExp, ...(c.expenses || [])] } : c))
    );
    showToast('Expense and receipt added!');
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
    showToast(`Milestone updated to ${status}`);
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
    showToast('Question posted!');
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
          showToast('Shared Funding Group created!');
          return;
        }
      } catch (err) {
        showToast(err.message, 'error');
        return;
      }
    }
    setGroups((prev) => [{ id: generateId('grp'), ...groupData }, ...prev]);
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
      await processGatewayPayment({
        campaignId: targetCampId,
        amount: cleanAmt,
        paymentMethod: 'UPI',
        paymentDetail: 'group@upi',
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
      const res = await api.register({ name, email, phone, password, role: role || 'donor' });
      if (res?.token && res?.user) {
        localStorage.setItem('fundbridge_token', res.token);
        const userObj = normalizeUser(res.user);
        setCurrentUser(userObj);
        showToast(`Account created! Welcome, ${userObj.name}.`);
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
        processGatewayPayment,
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
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              {campaign.status === 'Completed' ? 'Goal Reached' : `${campaign.daysLeft} days left`}
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
          <div onClick={() => navigate('home')} className="flex items-center gap-2.5 cursor-pointer shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4338CA] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <HandHeart className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#171923]">
              Fund<span className="text-[#635BFF]">Bridge</span>
            </span>
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
                  {link.badge && <span className="w-2 h-2 rounded-full bg-[#EF4444]" />}
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
                        <div key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'bg-white' : 'bg-indigo-50/40'}`}>
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
                route.page === link.id ? 'bg-indigo-50 text-[#635BFF]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">LIVE</span>}
            </button>
          ))}
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
              FundBridge Pay • MongoDB Connected
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
              Every campaign features itemized expense logs, receipt previews, and milestone tracking.
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
          <p>© {new Date().getFullYear()} FundBridge Social Impact Technologies. All rights reserved.</p>
          <p>React + Express + MongoDB Atlas</p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================================
// 6. FUNDBRIDGE PAY GATEWAY MODAL (UPI / CARD / NETBANKING + RECEIPT)
// ============================================================================

const QuickDonationModal = ({
  campaign,
  onClose,
  initialAmount = 1000,
  initialMessage = '',
  initialAnonymous = false,
}) => {
  const { processGatewayPayment, currentUser } = useApp();
  const [amount, setAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(initialAnonymous);
  const [message, setMessage] = useState(initialMessage);
  const [donorName, setDonorName] = useState(currentUser?.name || '');

  const [payMethod, setPayMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('ankit@okicici');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8890');
  const [expiry, setExpiry] = useState('09/29');
  const [cvv, setCvv] = useState('742');
  const [bankName, setBankName] = useState('State Bank of India');

  const [step, setStep] = useState('FORM'); // FORM | PROCESSING | RECEIPT
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (campaign) {
      setAmount(initialAmount || 1000);
      setCustomAmount('');
      setMessage(initialMessage || '');
      setAnonymous(Boolean(initialAnonymous));
      setDonorName(currentUser?.name || '');
      setStep('FORM');
      setErrorMsg('');
      setReceipt(null);
    }
  }, [campaign, initialAmount, initialMessage, initialAnonymous, currentUser]);

  if (!campaign) return null;

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setStep('PROCESSING');
    setErrorMsg('');
    try {
      const detail =
        payMethod === 'UPI' ? upiId : payMethod === 'CARD' ? cardNumber : bankName;
      const txnReceipt = await processGatewayPayment({
        campaignId: campaign.id,
        amount: finalAmount,
        paymentMethod: payMethod,
        paymentDetail: detail,
        anonymous,
        message,
        donorNameOverride: donorName.trim() || currentUser?.name,
      });
      setReceipt(txnReceipt);
      setStep('RECEIPT');
    } catch (err) {
      setErrorMsg(err.message || 'Transaction failed. Please try again.');
      setStep('FORM');
    }
  };

  return (
    <Modal
      isOpen={!!campaign}
      onClose={onClose}
      title={step === 'RECEIPT' ? 'Payment Receipt • FundBridge Pay' : 'FundBridge Pay • Secure Checkout'}
    >
      {step === 'PROCESSING' && (
        <div className="text-center py-10 space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-[#635BFF] animate-spin mx-auto" />
          <h4 className="text-lg font-extrabold text-slate-900">Authorizing Payment...</h4>
          <p className="text-xs text-slate-500">
            Connecting securely via {payMethod === 'UPI' ? 'UPI Switch' : payMethod === 'CARD' ? 'Card Gateway' : bankName}
          </p>
        </div>
      )}

      {step === 'RECEIPT' && receipt && (
        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] uppercase">
              PAYMENT CONFIRMED
            </span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{formatINR(receipt.amount)}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Paid to {receipt.campaignTitle}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Ref</span>
              <code className="font-bold text-slate-900">{receipt.transactionRef}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID</span>
              <code className="font-semibold text-slate-700">{receipt.orderId}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode</span>
              <strong className="text-slate-900">{receipt.paymentMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Donor</span>
              <strong className="text-slate-900">{receipt.donorName}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm hover:bg-[#5249F5]"
          >
            Done & Return to Campaign
          </button>
        </div>
      )}

      {step === 'FORM' && (
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="pr-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                SANDBOX GATEWAY
              </span>
              <p className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">{campaign.title}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Payable</span>
              <strong className="text-base font-black text-[#635BFF]">{formatINR(finalAmount)}</strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Contribution Amount (INR)
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[500, 1000, 2500, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    !customAmount && amount === preset
                      ? 'bg-[#635BFF] text-white border-[#635BFF]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#635BFF]'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="10"
              placeholder="Or enter custom amount (₹)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR' },
                { id: 'CARD', label: 'Card' },
                { id: 'NETBANKING', label: 'Net Banking' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    payMethod === m.id
                      ? 'bg-indigo-50 text-[#635BFF] border-[#635BFF]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {payMethod === 'UPI' && (
            <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Enter UPI ID</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okicici"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Enter any UPI ID to approve, or <code>fail@upi</code> to simulate a bank decline.
              </p>
            </div>
          )}

          {payMethod === 'CARD' && (
            <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-slate-200 space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {payMethod === 'NETBANKING' && (
            <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Select Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              disabled={anonymous}
              placeholder="Your Name"
              value={anonymous ? 'Anonymous' : donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
            <input
              type="text"
              placeholder="Note (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-[#635BFF]"
            />
            <span className="text-xs text-slate-700">Donate anonymously</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Pay {formatINR(finalAmount)} Securely
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
    return campaigns
      .filter((c) => c.status !== 'Completed')
      .map((c) => {
        let score = c.trustScore;
        if (interests.includes(c.category)) score += 30;
        if (saved.includes(c.id)) score += 15;
        if (c.isEmergency) score += 10;
        return { ...c, recScore: score };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 3);
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
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#171923]">{formatCompactINR(totalRaised)}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Total Funds Raised</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#16A34A]">1,420+</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Successful Campaigns</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#635BFF]">{totalSupporters.toLocaleString('en-IN')}+</p>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Transparency Ledger</span>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">Matched to Your Impact Interests</h2>
          </div>
          <button onClick={() => navigate('explore')} className="text-sm font-bold text-[#635BFF] hover:underline flex items-center gap-1">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">Featured Verified Fundraisers</h2>
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
    if (route.params?.category) setSelectedCategory(route.params.category);
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="most_funded">Sort: Most Funded (₹)</option>
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
                  selectedCategory === cat ? 'bg-[#635BFF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className="rounded text-[#16A34A]"
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
  const [gatewayOpen, setGatewayOpen] = useState(false);

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
    if (remainingFunds > 0) arr.push({ name: 'Remaining Escrow', value: remainingFunds });
    return arr;
  }, [campaign.expenses, remainingFunds]);

  const CHART_COLORS = ['#635BFF', '#16A34A', '#F59E0B', '#0EA5E9', '#EC4899', '#94A3B8'];

  const handleOpenGateway = (e) => {
    e.preventDefault();
    setGatewayOpen(true);
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
                  activeTab === tab.id ? 'bg-[#635BFF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
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
                </div>
                {currentUser?.role !== 'donor' && (
                  <button
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold flex items-center gap-1.5"
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
                      <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
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
                {(campaign.expenses || []).map((exp, i) => (
                  <div key={exp._id || exp.id || i} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-[#635BFF]">{exp.category}</span>
                      <p className="font-bold text-slate-900 mt-1">{exp.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base font-extrabold text-slate-900">{formatINR(exp.amount)}</span>
                      <button
                        onClick={() => setReceiptPreview(exp)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#635BFF] text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Milestone-Based Funding Roadmap</h2>
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                {(campaign.milestones || []).map((m, idx) => (
                  <div key={m._id || m.id || idx} className="relative bg-[#F8F9FC] p-5 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Milestone 0{idx + 1}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-[#635BFF]">{m.status}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                      <span className="font-extrabold text-[#635BFF]">{formatINR(m.target)}</span>
                    </div>
                    <p className="text-sm text-slate-600">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Campaign Progress Updates</h2>
              {(campaign.updates || []).map((upd, idx) => (
                <div key={upd._id || upd.id || idx} className="p-5 rounded-2xl bg-[#F8F9FC] border border-slate-200/70">
                  <span className="text-xs font-bold text-[#635BFF]">{upd.date}</span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{upd.title}</h3>
                  <p className="text-sm text-slate-600 mt-1.5">{upd.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'donors' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Recent Supporters ({campaign.supportersCount})</h2>
              <div className="divide-y divide-slate-100">
                {(campaign.donors || []).map((d, idx) => (
                  <div key={d._id || d.id || idx} className="py-3.5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{d.name}</p>
                      {d.message && <p className="text-xs text-slate-600 mt-0.5">"{d.message}"</p>}
                      <span className="text-[11px] text-slate-400">{d.date}</span>
                    </div>
                    <span className="font-extrabold text-sm text-[#16A34A]">{formatINR(d.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qna' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900">Ask the Campaign Creator</h2>
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
                  placeholder="Write your question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#635BFF] text-white font-bold text-sm flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Ask
                </button>
              </form>

              <div className="space-y-4">
                {(campaign.qna || []).map((item, idx) => {
                  const qId = item._id || item.id || idx;
                  return (
                    <div key={qId} className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/80 space-y-3">
                      <p className="text-sm font-semibold text-slate-900">Q: {item.question}</p>
                      {item.answer ? (
                        <p className="text-sm text-slate-700 pl-4 border-l-2 border-[#16A34A]">{item.answer}</p>
                      ) : (
                        <div className="flex gap-2">
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
                <span className="text-3xl font-black text-[#171923]">{formatINR(campaign.raisedAmount)}</span>
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
                  <p className="text-xs text-slate-500">Remaining</p>
                </div>
              </div>
            </div>

            {campaign.status === 'Completed' ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <p className="font-bold text-emerald-900 text-sm">Campaign Successfully Funded!</p>
              </div>
            ) : (
              <form onSubmit={handleOpenGateway} className="space-y-4">
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
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Optional message of support..."
                  value={donorMsg}
                  onChange={(e) => setDonorMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
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
                  Proceed to Pay {formatINR(customAmt ? Number(customAmt) : selectedPreset)}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <QuickDonationModal
        campaign={gatewayOpen ? campaign : null}
        initialAmount={customAmt ? Number(customAmt) : selectedPreset}
        initialMessage={donorMsg}
        initialAnonymous={anonymous}
        onClose={() => setGatewayOpen(false)}
      />

      <Modal isOpen={!!receiptPreview} onClose={() => setReceiptPreview(null)} title="Verified Expense Receipt Preview" maxWidth="max-w-md">
        {receiptPreview && <img src={receiptPreview.receiptUrl} alt="Receipt" className="w-full rounded-xl border border-slate-200" />}
      </Modal>

      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Log New Fund Utilization Expense">
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <input type="text" required placeholder="Expense Description *" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" required min="1" placeholder="Amount (₹) *" value={expAmt} onChange={(e) => setExpAmt(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <select value={expCat} onChange={(e) => setExpCat(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
              <option>Hospital Fees</option>
              <option>Medicines</option>
              <option>Medical Tests</option>
              <option>Tuition & Fees</option>
              <option>Equipment</option>
            </select>
          </div>
          <input type="text" placeholder="Vendor Name" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs" />
          <button type="submit" className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">Publish Expense</button>
        </form>
      </Modal>
    </div>
  );
};

// ============================================================================
// 10. AI CAMPAIGN ASSISTANT & CREATE CAMPAIGN WIZARD
// ============================================================================

const AIWriterPage = () => {
  const { setAiDraft, navigate, showToast } = useApp();
  const [category, setCategory] = useState('Education');
  const [idea, setIdea] = useState('');
  const [goal, setGoal] = useState('350000');
  const [shortDesc, setShortDesc] = useState('');
  const [audience, setAudience] = useState('Individual Donors & CSR Supporters');
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setResult({
      title: `Empowering Change: ${idea.trim()} (${category} Initiative)`,
      category,
      suggestedTarget: Number(goal) || 250000,
      summary: `A transparent ${category.toLowerCase()} campaign aimed at ${idea.trim().toLowerCase()} for ${audience.toLowerCase()}.`,
      story: `Our initiative focuses on ${idea.trim()}. ${shortDesc}\n\nDesigned to benefit ${audience} with 100% receipt transparency.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-10">
      <h1 className="text-3xl font-extrabold text-center mb-8">Craft a High-Trust Campaign Story</h1>
      <div className="grid lg:grid-cols-12 gap-8">
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input type="text" required placeholder="Campaign Idea *" value={idea} onChange={(e) => setIdea(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input type="number" placeholder="Goal (₹)" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <input type="text" placeholder="Target Audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <textarea rows={3} placeholder="Key context..." value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <button type="submit" className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">Generate Campaign Draft</button>
        </form>
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-xl font-extrabold">{result.title}</h3>
              <p className="text-sm bg-slate-50 p-3.5 rounded-xl">{result.summary}</p>
              <p className="text-sm whitespace-pre-line bg-slate-50 p-4 rounded-xl">{result.story}</p>
              <button
                onClick={() => {
                  setAiDraft(result);
                  showToast('Draft transferred!');
                  navigate('create-campaign');
                }}
                className="w-full py-3 rounded-xl bg-[#16A34A] text-white font-bold text-sm"
              >
                Use This Draft in Campaign Creator
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center font-bold text-slate-500">
              Your AI Draft Will Appear Here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateCampaignPage = () => {
  const { aiDraft, setAiDraft, addCampaign, navigate, showToast, currentUser } = useApp();
  const [step, setStep] = useState(1);

  if (currentUser?.role === 'donor') {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Lock className="w-10 h-10 text-[#EF4444] mx-auto" />
          <h2 className="text-2xl font-extrabold">Creator Account Required</h2>
          <button onClick={() => navigate('explore')} className="px-6 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
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
    shortDescription: aiDraft?.summary || '',
    story: aiDraft?.story || '',
    beneficiary: '',
    targetAmount: aiDraft?.suggestedTarget || 250000,
    daysLeft: 30,
  });

  useEffect(() => {
    if (aiDraft) {
      setForm((prev) => ({ ...prev, title: aiDraft.title, category: aiDraft.category, shortDescription: aiDraft.summary, story: aiDraft.story, targetAmount: aiDraft.suggestedTarget }));
      setAiDraft(null);
    }
  }, [aiDraft, setAiDraft]);

  const handlePublish = async () => {
    if (!form.title.trim() || !form.story.trim()) {
      showToast('Complete title and story first.', 'error');
      return;
    }
    const created = await addCampaign({
      ...form,
      targetAmount: Number(form.targetAmount),
      daysLeft: Number(form.daysLeft),
      verified: true,
      trustScore: 90,
      image: createIllustrationSVG(form.title.slice(0, 26), `${form.category} • ${form.location}`, '#635BFF', '#171923'),
      expenses: [],
      milestones: [
        { id: generateId('m'), title: 'Phase 1 Execution', target: Math.round(Number(form.targetAmount) / 2), deadline: '2026-12-15', status: 'In Progress', description: 'Initial phase.' },
      ],
    });
    if (created) navigate('campaign-details', { id: created.id });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10 space-y-6">
      <h1 className="text-3xl font-extrabold">Launch a Verified Campaign</h1>
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        {step === 1 && (
          <>
            <input type="text" placeholder="Campaign Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input type="text" placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <input type="number" placeholder="Target Amount (₹)" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </>
        )}
        {step === 2 && (
          <>
            <input type="text" placeholder="Short Summary" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input type="text" placeholder="Beneficiary Details" value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <textarea rows={6} placeholder="Full Campaign Story *" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </>
        )}
        <div className="flex justify-between pt-4">
          <button type="button" disabled={step === 1} onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-40">Previous</button>
          {step === 1 ? (
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold">Next</button>
          ) : (
            <button type="button" onClick={handlePublish} className="px-7 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold">Publish Live</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 11. DASHBOARDS & SECONDARY PAGES
// ============================================================================

const DonorDashboardPage = () => {
  const { currentUser, donations, navigate } = useApp();
  const myDonations = donations.filter((d) => d.userId === currentUser?.id || d.donorName === currentUser?.name);
  const totalDonated = myDonations.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Donor Dashboard • {currentUser?.name}</h1>
        <button onClick={() => navigate('explore')} className="px-4 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold">Explore Causes</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">Total Donated</p>
          <p className="text-2xl font-black text-[#635BFF] mt-1">{formatINR(totalDonated)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">Contributions Made</p>
          <p className="text-2xl font-black text-[#16A34A] mt-1">{myDonations.length}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <h3 className="text-base font-extrabold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {myDonations.map((d) => (
            <div key={d.id} className="p-3.5 rounded-xl bg-slate-50 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold">{d.campaignTitle}</p>
                <span className="text-xs text-slate-500">{d.date} {d.transactionRef ? `• ${d.transactionRef}` : ''}</span>
              </div>
              <span className="font-extrabold text-[#16A34A]">{formatINR(d.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CreatorDashboardPage = () => {
  const { campaigns, deleteCampaign, navigate } = useApp();
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Creator Command Center</h1>
        <button onClick={() => navigate('create-campaign')} className="px-4 py-2.5 rounded-xl bg-[#635BFF] text-white text-sm font-bold">+ New Campaign</button>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center gap-4">
            <div>
              <p className="font-bold">{c.title}</p>
              <span className="text-xs text-slate-500">{formatINR(c.raisedAmount)} / {formatINR(c.targetAmount)}</span>
            </div>
            <div className="space-x-2">
              <button onClick={() => navigate('campaign-details', { id: c.id })} className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold">View</button>
              <button onClick={() => deleteCampaign(c.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-[#EF4444] text-xs font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { campaigns, updateCampaign, showToast, currentUser, navigate } = useApp();
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16 text-center">
        <h2 className="text-2xl font-extrabold mb-4">Admin Only</h2>
        <button onClick={() => navigate('home')} className="px-6 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">Home</button>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 space-y-6">
      <h1 className="text-3xl font-extrabold">Admin Verification Queue</h1>
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <TrustBadge verified={c.verified} score={c.trustScore} />
              <p className="font-bold mt-1">{c.title}</p>
            </div>
            <button
              onClick={() => {
                updateCampaign(c.id, { verified: true, status: 'Active', trustScore: 95 });
                showToast(`Verified "${c.title}"`);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold"
            >
              Approve & Verify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImpactWallPage = () => {
  const { campaigns, navigate } = useApp();
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
      <h1 className="text-3xl font-extrabold text-center">The FundBridge Impact Wall</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col">
            <img src={c.image} alt={c.title} className="h-48 w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-slate-600 flex-1 mb-4">{c.shortDescription}</p>
              <button onClick={() => navigate('campaign-details', { id: c.id })} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                Inspect Full Impact
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
  return (
    <div className="max-w-5xl mx-auto px-4 pt-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-center">Success Stories</h1>
      {campaigns.map((story) => (
        <div key={story.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold">{story.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{story.shortDescription}</p>
          </div>
          <button onClick={() => navigate('campaign-details', { id: story.id })} className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold shrink-0">
            View Receipts
          </button>
        </div>
      ))}
    </div>
  );
};

const EmergencyFundingPage = () => {
  const { campaigns } = useApp();
  const [quickDonateCamp, setQuickDonateCamp] = useState(null);
  const urgent = campaigns.filter((c) => c.isEmergency || c.category === 'Emergency' || c.daysLeft <= 10);
  return (
    <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#EF4444] to-[#991B1B] text-white">
        <h1 className="text-3xl font-extrabold">Time-Sensitive Emergency Relief</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {urgent.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} onQuickDonate={setQuickDonateCamp} />
        ))}
      </div>
      <QuickDonationModal campaign={quickDonateCamp} onClose={() => setQuickDonateCamp(null)} />
    </div>
  );
};

const GroupFundingPage = () => {
  const { groups, contributeToGroup } = useApp();
  return (
    <div className="max-w-5xl mx-auto px-4 pt-10 space-y-6">
      <h1 className="text-3xl font-extrabold">Group Giving Circles</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((grp) => {
          const collected = grp.members.reduce((s, m) => s + m.contributed, 0);
          return (
            <div key={grp.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-xl font-extrabold">{grp.name}</h2>
              <ProgressBar raised={collected} target={grp.targetAmount} />
              {grp.members.map((m, i) => (
                <div key={m._id || m.id || i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl">
                  <span>{m.name} ({formatINR(m.contributed)})</span>
                  <button
                    onClick={() => contributeToGroup(grp.id, m._id || m.id, 1000)}
                    className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold"
                  >
                    + ₹1,000
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HowItWorksPage = () => {
  const { navigate } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 space-y-8 text-center">
      <h1 className="text-3xl font-extrabold">How FundBridge Protects Every Rupee</h1>
      <div className="grid md:grid-cols-3 gap-6 text-left">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold mb-2">1. Trust Score (0–100)</h3>
          <p className="text-sm text-slate-600">Evaluates creator identity and supporting estimates.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold mb-2">2. Receipt Ledger</h3>
          <p className="text-sm text-slate-600">Itemized vendor receipts uploaded publicly.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold mb-2">3. FundBridge Pay</h3>
          <p className="text-sm text-slate-600">Instant verified transaction receipts via UPI, Card, or Net Banking.</p>
        </div>
      </div>
      <button onClick={() => navigate('explore')} className="px-6 py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
        Explore Verified Campaigns
      </button>
    </div>
  );
};

const AuthPages = ({ mode = 'login' }) => {
  const { loginUser, signupUser, navigate, switchDemoRole, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') await loginUser(email, password);
    else if (mode === 'signup') {
      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }
      await signupUser({ name, email, phone, password, role });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-5">
        <h1 className="text-2xl font-extrabold text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <div className="grid grid-cols-3 gap-2">
          {['donor', 'creator', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                switchDemoRole(r);
                navigate('home');
              }}
              className="py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold capitalize"
            >
              Demo {r}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                {['donor', 'creator'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`py-2 rounded-xl text-xs font-bold capitalize border ${role === r ? 'bg-[#635BFF] text-white' : 'bg-white'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-slate-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mode === 'signup' && (
            <input type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
          )}
          <button type="submit" className="w-full py-3 rounded-xl bg-[#635BFF] text-white font-bold text-sm">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <button onClick={() => navigate('signup')} className="text-[#635BFF] font-bold">Need an account? Sign Up</button>
          ) : (
            <button onClick={() => navigate('login')} className="text-[#635BFF] font-bold">Already have an account? Log In</button>
          )}
        </p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { currentUser, switchDemoRole } = useApp();
  if (!currentUser) return null;
  return (
    <div className="max-w-2xl mx-auto px-4 pt-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <h1 className="text-2xl font-extrabold">{currentUser.name}</h1>
        <p className="text-sm text-slate-500">{currentUser.email} • Role: {currentUser.role}</p>
        <div className="flex gap-2 pt-2">
          {['donor', 'creator', 'admin'].map((r) => (
            <button key={r} onClick={() => switchDemoRole(r)} className="px-4 py-2 rounded-xl border text-xs font-bold capitalize">
              Switch to {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 12. MAIN APPLICATION SHELL
// ============================================================================

const MainRouter = () => {
  const { route, toast } = useApp();

  const renderPage = () => {
    switch (route.page) {
      case 'home': return <HomePage />;
      case 'explore': return <ExplorePage />;
      case 'campaign-details': return <CampaignDetailsPage />;
      case 'ai-writer': return <AIWriterPage />;
      case 'create-campaign': return <CreateCampaignPage />;
      case 'donor-dashboard': return <DonorDashboardPage />;
      case 'creator-dashboard': return <CreatorDashboardPage />;
      case 'admin-dashboard': return <AdminDashboardPage />;
      case 'impact': return <ImpactWallPage />;
      case 'stories': return <SuccessStoriesPage />;
      case 'emergency': return <EmergencyFundingPage />;
      case 'groups': return <GroupFundingPage />;
      case 'how-it-works': return <HowItWorksPage />;
      case 'login': return <AuthPages mode="login" />;
      case 'signup': return <AuthPages mode="signup" />;
      case 'forgot': return <AuthPages mode="forgot" />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC] text-[#171923] font-sans">
      <Navbar />
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#171923] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
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