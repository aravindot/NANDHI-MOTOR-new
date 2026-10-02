import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import LeadsManagement from './components/pages/LeadsManagement';
import CustomersPage from './components/pages/CustomersPage';
import VehicleListPage from './components/pages/VehicleListPage';
import SpareInventoryPage from './components/pages/SpareInventoryPage';
import SettingsPage, { DEFAULT_SERVICE_LABOR_TYPES } from './components/pages/SettingsPage';
import VehicleServicePage from './components/pages/VehicleServicePage';
import AccountingLedgerPage from './components/pages/AccountingLedgerPage';
import PurchasePage from './components/pages/PurchasePage';
import WarrantyClaimPage from './components/pages/WarrantyClaimPage';
import ExecutivesPage from './components/pages/ExecutivesPage';
import AlertsPage from './components/pages/AlertsPage';
import BirthdayWishesPage from './components/pages/BirthdayWishesPage';
import RedeemPointsPage from './components/pages/RedeemPointsPage';
import CompanyProfilePage from './components/pages/CompanyProfilePage';
import { API_BASE_URL } from './config/api';
import { isSessionExpired, refreshSessionExpiry as extendSessionExpiry } from './utils/sessionTimeout';
import { DEFAULT_PRINT_SETTINGS, readPrintSettingsFromStorage, buildPrintThemeCss } from './utils/printSettings';

const SESSION_KEY = 'nandhi_app_session';
const SESSION_TIMEOUT_KEY = 'nandhi_app_session_expires_at';

const APP_CREDENTIALS = {
  username: 'NANDHI MOTORS',
  password: 'Nandhi@tn94'
};

const VALID_CREDENTIALS = [
  { username: 'NANDHI MOTORS', password: 'Nandhi@tn94' },
  { username: '9791537272', password: 'Nandhimotors@5233' },
  { username: 'superadmin', password: 'Nandhi@1234' }
];

const readLocalStorageJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'null') return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const mergeCollections = (backendList, localList, idKey = 'id') => {
  const getIdentifier = (item) => {
    if (!item) return '';
    if (idKey === 'mobile') {
      return String(item.mobile || item.id || '');
    }
    return String(item[idKey] || item.id || '');
  };

  const validLocals = Array.isArray(localList) ? localList : [];
  if (!Array.isArray(backendList) || backendList.length === 0) {
    return { merged: validLocals, unSyncedLocals: validLocals };
  }
  if (validLocals.length === 0) {
    return { merged: backendList, unSyncedLocals: [] };
  }

  const map = new Map();
  backendList.forEach((item) => {
    const key = getIdentifier(item);
    if (key) {
      map.set(key, item);
    }
  });

  const unSyncedLocals = [];
  validLocals.forEach((item) => {
    const key = getIdentifier(item);
    if (key) {
      if (!map.has(key)) {
        map.set(key, item);
        unSyncedLocals.push(item);
      }
    }
  });

  return { merged: Array.from(map.values()), unSyncedLocals };
};

const syncToBackend = async (path, item) => {
  try {
    await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  } catch (e) {
    // Offline or network error; local state remains source of truth
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const loggedIn = localStorage.getItem(SESSION_KEY) === 'true';
      if (!loggedIn) return false;
      const expiresAt = Number(localStorage.getItem(SESSION_TIMEOUT_KEY) || 0);
      return !isSessionExpired(expiresAt, Date.now());
    } catch (error) {
      return false;
    }
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const clearSessionExpiry = () => {
    try {
      localStorage.removeItem(SESSION_TIMEOUT_KEY);
    } catch (error) {
      console.warn('Unable to clear session expiry.', error);
    }
  };

  const setSessionExpiry = () => {
    const nextExpiry = extendSessionExpiry(Date.now());
    localStorage.setItem(SESSION_TIMEOUT_KEY, String(nextExpiry));
    return nextExpiry;
  };

  useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem(SESSION_KEY, 'true');
        setSessionExpiry();
      } else {
        localStorage.removeItem(SESSION_KEY);
        clearSessionExpiry();
      }
    } catch (error) {
      console.warn('Unable to persist login session.', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const checkSession = () => {
      const expiresAt = Number(localStorage.getItem(SESSION_TIMEOUT_KEY) || 0);
      if (isSessionExpired(expiresAt, Date.now())) {
        setIsAuthenticated(false);
        setLoginForm({ username: '', password: '' });
        setLoginError('');
        clearSessionExpiry();
      }
    };

    const timer = setInterval(checkSession, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const keepAlive = () => {
      const expiresAt = Number(localStorage.getItem(SESSION_TIMEOUT_KEY) || 0);
      if (isSessionExpired(expiresAt, Date.now())) {
        setIsAuthenticated(false);
        setLoginForm({ username: '', password: '' });
        setLoginError('');
        clearSessionExpiry();
        return;
      }

      localStorage.setItem(SESSION_TIMEOUT_KEY, String(extendSessionExpiry(Date.now())));
    };

    const events = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll', 'pointerdown'];

    events.forEach((eventName) => window.addEventListener(eventName, keepAlive, { passive: true }));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, keepAlive));
    };
  }, [isAuthenticated]);

  const handleLogin = (event) => {
    event.preventDefault();
    const username = String(loginForm.username).trim();
    const password = String(loginForm.password);

    const isValid = VALID_CREDENTIALS.some(
      (cred) => cred.username.toLowerCase() === username.toLowerCase() && cred.password === password
    );

    if (isValid) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem(SESSION_KEY, 'true');
      localStorage.setItem(SESSION_TIMEOUT_KEY, String(extendSessionExpiry(Date.now())));
      return;
    }

    setLoginError('Invalid username or password');
  };


  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Shared data state. The backend is the source of truth; localStorage is used only as fallback when the server is unavailable.
  const [leads, setLeads] = useState(() => readLocalStorageJson('nandhi_app_leads', []));
  const [customers, setCustomers] = useState(() => readLocalStorageJson('nandhi_app_customers', []));
  const [spares, setSpares] = useState(() => readLocalStorageJson('nandhi_app_spares', []));
  const [invoices, setInvoices] = useState(() => readLocalStorageJson('nandhi_app_invoices', []));
  const [quotations, setQuotations] = useState(() => readLocalStorageJson('nandhi_app_quotations', []));
  const [vehicles, setVehicles] = useState(() => readLocalStorageJson('nandhi_app_vehicles', []));

  useEffect(() => {
    localStorage.setItem('nandhi_app_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_spares', JSON.stringify(spares));
  }, [spares]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const [jobSheets, setJobSheets] = useState(() => readLocalStorageJson('nandhi_app_jobsheets', []));
  const [serviceBills, setServiceBills] = useState(() => readLocalStorageJson('nandhi_app_service_bills', []));

  useEffect(() => {
    localStorage.setItem('nandhi_app_jobsheets', JSON.stringify(jobSheets));
  }, [jobSheets]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_service_bills', JSON.stringify(serviceBills));
  }, [serviceBills]);

  const [dailyExpenses, setDailyExpenses] = useState(() => readLocalStorageJson('nandhi_app_daily_expenses', []));
  const [purchaseInvoices, setPurchaseInvoices] = useState(() => readLocalStorageJson('nandhi_app_purchase_invoices', []));

  useEffect(() => {
    localStorage.setItem('nandhi_app_daily_expenses', JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_purchase_invoices', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  // Shared Preview Configurations for Pages
  const [showPreviews, setShowPreviews] = useState(() => {
    try {
      const saved = localStorage.getItem('nandhi_app_show_previews');
      if (saved === 'false') return false;
      if (saved === 'true') return true;
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [globalToast, setGlobalToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const showAppToast = (message, options = {}) => {
      const tone = options.tone || 'success';
      const duration = options.duration ?? 2800;
      setGlobalToast({ message, tone });
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => setGlobalToast(null), duration);
    };

    window.showAppToast = showAppToast;

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      delete window.showAppToast;
    };
  }, []);

  // Shared Company Profile State
  const readCompanyProfileFromStorage = () => {
    try {
      const primary = localStorage.getItem('nandhi_app_company_profile');
      if (primary) return JSON.parse(primary);
      const legacy = localStorage.getItem('nandhi_company_profile');
      if (legacy) return JSON.parse(legacy);
    } catch (e) {
      console.warn('Unable to read saved company profile from localStorage.', e);
    }

    return {
      name: 'NANDHI MOTORS',
      tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
      address: '170/2, ITTERI ROAD, PALANI-624601',
      phone: '+91 7604857272',
      altPhone: '+91 7604847272',
      email: 'nandhimotorspalani@gmail.com',
      website: 'www.nandhimotors.com',
      gstin: '33BCXPA4714R1Z2',
      state: 'Tamil Nadu (33)',
      pan: '',
      bankName: 'IDBI BANK',
      accountName: 'NANDHI MOTORS',
      accountNumber: '0920102000007825',
      ifscCode: 'IBKL0000920',
      branch: 'PALANI BRANCH',
      upiId: 'nandhimotors@hdfcbank',
      quotationTerms: `1. Prices quoted are valid for 7 days from the date of issuance and subject to manufacturer revision.
2. Final delivery is subject to vehicle color and model stock availability.
3. RTO registration, Road Tax & Insurance charges are subject to statutory revisions by Government authorities.
4. Full on-road payment is required prior to vehicle invoicing and registration dispatch.
5. Standard accessories & helmet are supplied per dealership delivery policy.`,
      gstSettings: {
        laborGstEnabled: true,
        sparesGstEnabled: true,
        laborRate: 18,
        sparesRate: 18
      },
      printSettings: DEFAULT_PRINT_SETTINGS
    };
  };

  const [companyProfile, setCompanyProfile] = useState(readCompanyProfileFromStorage);
  const [printSettings, setPrintSettings] = useState(() => readPrintSettingsFromStorage());

  useEffect(() => {
    const currentPrintTheme = printSettings || DEFAULT_PRINT_SETTINGS;
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('nandhi-print-theme');
      const css = buildPrintThemeCss(currentPrintTheme);
      if (existingStyle) {
        existingStyle.innerHTML = css;
      } else {
        const tag = document.createElement('style');
        tag.id = 'nandhi-print-theme';
        tag.innerHTML = css;
        document.head.appendChild(tag);
      }
    }
  }, [printSettings]);

  useEffect(() => {
    if (!companyProfile) return;
    const nextProfile = {
      ...companyProfile,
      printSettings: printSettings || DEFAULT_PRINT_SETTINGS
    };
    setCompanyProfile(nextProfile);
    localStorage.setItem('nandhi_app_company_profile', JSON.stringify(nextProfile));
    localStorage.setItem('nandhi_company_profile', JSON.stringify(nextProfile));
  }, [printSettings]);

  useEffect(() => {
    if (!companyProfile) return;
    localStorage.setItem('nandhi_app_company_profile', JSON.stringify(companyProfile));
    localStorage.setItem('nandhi_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_show_previews', JSON.stringify(showPreviews));
  }, [showPreviews]);

  // Logout handler that safely flushes current state to localStorage before deauthenticating
  const handleLogout = () => {
    try {
      localStorage.setItem('nandhi_app_leads', JSON.stringify(leads));
      localStorage.setItem('nandhi_app_customers', JSON.stringify(customers));
      localStorage.setItem('nandhi_app_spares', JSON.stringify(spares));
      localStorage.setItem('nandhi_app_invoices', JSON.stringify(invoices));
      localStorage.setItem('nandhi_app_quotations', JSON.stringify(quotations));
      localStorage.setItem('nandhi_app_vehicles', JSON.stringify(vehicles));
      localStorage.setItem('nandhi_app_jobsheets', JSON.stringify(jobSheets));
      localStorage.setItem('nandhi_app_service_bills', JSON.stringify(serviceBills));
      localStorage.setItem('nandhi_app_daily_expenses', JSON.stringify(dailyExpenses));
      localStorage.setItem('nandhi_app_purchase_invoices', JSON.stringify(purchaseInvoices));
      if (companyProfile) {
        localStorage.setItem('nandhi_app_company_profile', JSON.stringify(companyProfile));
        localStorage.setItem('nandhi_company_profile', JSON.stringify(companyProfile));
      }
    } catch (e) {
      console.warn('Unable to flush state to localStorage on logout', e);
    }

    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    clearSessionExpiry();
    localStorage.removeItem(SESSION_KEY);
  };

  // Fetch initial data from backend and merge safely with local storage so user records are never lost
  const initData = useCallback(async () => {
    const loadFallbacks = () => {
      setVehicles(readLocalStorageJson('nandhi_app_vehicles', []));
      setLeads(readLocalStorageJson('nandhi_app_leads', []));
      setCustomers(readLocalStorageJson('nandhi_app_customers', []));
      setSpares(readLocalStorageJson('nandhi_app_spares', []));
      setInvoices(readLocalStorageJson('nandhi_app_invoices', []));
      setQuotations(readLocalStorageJson('nandhi_app_quotations', []));
      setJobSheets(readLocalStorageJson('nandhi_app_jobsheets', []));
      setServiceBills(readLocalStorageJson('nandhi_app_service_bills', []));
      setDailyExpenses(readLocalStorageJson('nandhi_app_daily_expenses', []));
      setPurchaseInvoices(readLocalStorageJson('nandhi_app_purchase_invoices', []));

      const savedPrimary = localStorage.getItem('nandhi_app_company_profile');
      const savedLegacy = localStorage.getItem('nandhi_company_profile');
      const savedProfile = savedPrimary || savedLegacy;
      if (savedProfile) {
        try {
          setCompanyProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.warn('Unable to read saved company profile from localStorage.', e);
        }
      }
    };

    try {
      const fetchEndpoint = async (url) => {
        try {
          const res = await fetch(url);
          if (res.ok) return await res.json();
        } catch (e) {
          // Individual route failure
        }
        return null;
      };

      const [vData, lData, cData, sData, invData, qData, jsData, sbData, expData, purData, profData] = await Promise.all([
        fetchEndpoint(`${API_BASE_URL}/api/vehicles`),
        fetchEndpoint(`${API_BASE_URL}/api/leads`),
        fetchEndpoint(`${API_BASE_URL}/api/customers`),
        fetchEndpoint(`${API_BASE_URL}/api/spares`),
        fetchEndpoint(`${API_BASE_URL}/api/invoices`),
        fetchEndpoint(`${API_BASE_URL}/api/quotations`),
        fetchEndpoint(`${API_BASE_URL}/api/jobsheets`),
        fetchEndpoint(`${API_BASE_URL}/api/service-bills`),
        fetchEndpoint(`${API_BASE_URL}/api/expenses`),
        fetchEndpoint(`${API_BASE_URL}/api/purchases`),
        fetchEndpoint(`${API_BASE_URL}/api/company-profile`)
      ]);

      const localVehicles = readLocalStorageJson('nandhi_app_vehicles', []);
      const vResult = mergeCollections(vData, localVehicles, 'id');
      setVehicles(vResult.merged);
      vResult.unSyncedLocals.forEach(item => syncToBackend('/api/vehicles', item));

      const localLeads = readLocalStorageJson('nandhi_app_leads', []);
      const lResult = mergeCollections(lData, localLeads, 'id');
      setLeads(lResult.merged);
      lResult.unSyncedLocals.forEach(item => syncToBackend('/api/leads', item));

      const localCustomers = readLocalStorageJson('nandhi_app_customers', []);
      const cResult = mergeCollections(cData, localCustomers, 'mobile');
      setCustomers(cResult.merged);
      cResult.unSyncedLocals.forEach(item => syncToBackend('/api/customers', item));

      const localSpares = readLocalStorageJson('nandhi_app_spares', []);
      const sResult = mergeCollections(sData, localSpares, 'id');
      setSpares(sResult.merged);
      sResult.unSyncedLocals.forEach(item => syncToBackend('/api/spares', item));

      const localInvoices = readLocalStorageJson('nandhi_app_invoices', []);
      const invResult = mergeCollections(invData, localInvoices, 'invoiceNo');
      setInvoices(invResult.merged);
      invResult.unSyncedLocals.forEach(item => syncToBackend('/api/invoices', item));

      const localQuotes = readLocalStorageJson('nandhi_app_quotations', []);
      const qResult = mergeCollections(qData, localQuotes, 'quoteId');
      setQuotations(qResult.merged);
      qResult.unSyncedLocals.forEach(item => syncToBackend('/api/quotations', item));

      const localJobSheets = readLocalStorageJson('nandhi_app_jobsheets', []);
      const jsResult = mergeCollections(jsData, localJobSheets, 'id');
      setJobSheets(jsResult.merged);
      jsResult.unSyncedLocals.forEach(item => syncToBackend('/api/jobsheets', item));

      const localBills = readLocalStorageJson('nandhi_app_service_bills', []);
      const sbResult = mergeCollections(sbData, localBills, 'id');
      setServiceBills(sbResult.merged);
      sbResult.unSyncedLocals.forEach(item => syncToBackend('/api/service-bills', item));

      const localExpenses = readLocalStorageJson('nandhi_app_daily_expenses', []);
      const expResult = mergeCollections(expData, localExpenses, 'id');
      setDailyExpenses(expResult.merged);
      expResult.unSyncedLocals.forEach(item => syncToBackend('/api/expenses', item));

      const localPurchases = readLocalStorageJson('nandhi_app_purchase_invoices', []);
      const purResult = mergeCollections(purData, localPurchases, 'id');
      setPurchaseInvoices(purResult.merged);
      purResult.unSyncedLocals.forEach(item => syncToBackend('/api/purchases', item));

      if (profData && profData.name) {
        setCompanyProfile(profData);
      }
    } catch (e) {
      console.warn('Backend unavailable; using local storage fallback.', e);
      loadFallbacks();
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (isAuthenticated) {
      initData();
    }
  }, [isAuthenticated, initData]);

  // MongoDB Synchronization Helpers
  const syncVehiclesWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const v of [...added, ...edited]) {
      syncToBackend('/api/vehicles', v);
    }
    for (const v of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/vehicles/${v.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync deleted vehicle with MongoDB:', e);
      }
    }
  };

  const handleSetVehicles = async (action) => {
    if (typeof action === 'function') {
      setVehicles(prev => {
        const updated = action(prev);
        syncVehiclesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncVehiclesWithDatabase(vehicles, action);
      setVehicles(action);
    }
  };

  // Add or Update a Lead in backend database
  const addLead = async (leadPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setLeads(prev => {
          const idx = prev.findIndex(l => l.id === saved.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        return saved;
      }
    } catch (err) {
      console.error('Failed to save lead to MongoDB:', err);
    }
    // Fallback local state
    setLeads(prev => {
      const idx = prev.findIndex(l => l.id === leadPayload.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = leadPayload;
        return next;
      }
      return [leadPayload, ...prev];
    });
    return leadPayload;
  };

  // Update an existing Lead in backend database
  const updateLead = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const saved = await res.json();
        setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...saved } : l)));
        return saved;
      }
    } catch (err) {
      console.error('Failed to update lead in MongoDB:', err);
    }
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updatedFields } : l)));
    return updatedFields;
  };

  // Delete a Lead from backend database
  const deleteLead = async (leadId) => {
    try {
      await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete lead from MongoDB:', err);
    }
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleSetLeads = async (action) => {
    if (typeof action === 'function') {
      setLeads(prev => {
        const updated = action(prev);
        return updated;
      });
    } else {
      setLeads(action);
    }
  };

  const syncCustomersWithDatabase = async (prev, updated) => {
    const getKey = (c) => c.mobile || c.id;
    const added = updated.filter(u => !prev.some(p => getKey(p) === getKey(u)));
    const deleted = prev.filter(p => !updated.some(u => getKey(u) === getKey(p)));
    const edited = updated.filter(u => {
      const match = prev.find(p => getKey(p) === getKey(u));
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const c of [...added, ...edited]) {
      syncToBackend('/api/customers', c);
    }
    for (const c of deleted) {
      try {
        const idToDelete = c.id || c.mobile;
        await fetch(`${API_BASE_URL}/api/customers/${idToDelete}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync deleted customer with MongoDB:', e);
      }
    }
  };

  const handleSetCustomers = async (action) => {
    if (typeof action === 'function') {
      setCustomers(prev => {
        const updated = action(prev);
        syncCustomersWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncCustomersWithDatabase(customers, action);
      setCustomers(action);
    }
  };

  const syncSparesWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const s of [...added, ...edited]) {
      syncToBackend('/api/spares', s);
    }
    for (const s of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/spares/${s.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync deleted spare with MongoDB:', e);
      }
    }
  };

  const handleSetSpares = async (action) => {
    if (typeof action === 'function') {
      setSpares(prev => {
        const updated = action(prev);
        syncSparesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncSparesWithDatabase(spares, action);
      setSpares(action);
    }
  };

  // Add a customer from a submitted lead (avoids duplicates by mobile)
  const addCustomer = async (leadData) => {
    const customerPayload = {
      name: leadData.name,
      mobile: leadData.mobile,
      email: leadData.email || '',
      aadhar: leadData.aadhar || '',
      address: leadData.address || '',
      source: leadData.sourceType || 'Walk-In'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomers(prev => {
          const exists = prev.some(c => c.mobile === saved.mobile);
          if (exists) return prev;
          return [saved, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to add customer to MongoDB:', err);
      // Fallback local memory
      setCustomers(prev => {
        const exists = prev.some(c => c.mobile === leadData.mobile);
        if (exists) return prev;
        const newCustomer = {
          id: `C-${String(prev.length + 1).padStart(2, '0')}`,
          name: leadData.name,
          mobile: leadData.mobile,
          email: leadData.email || '',
          aadhar: leadData.aadhar || '',
          address: leadData.address || '',
          source: leadData.sourceType || 'Walk-In',
          registeredOn: new Date().toLocaleDateString('en-IN')
        };
        return [newCustomer, ...prev];
      });
    }
  };

  // Add or Update an Invoice in backend database
  const addInvoice = async (invoicePayload) => {
    const invoiceNo = invoicePayload.invoiceNo || String(invoices.reduce((max, inv) => {
      const n = parseInt((inv.invoiceNo || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1).padStart(2, '0');

    const payload = {
      ...invoicePayload,
      invoiceNo,
      createdOn: invoicePayload.createdOn || new Date().toLocaleDateString('en-IN')
    };

    // Synchronously update local state immediately so UI re-renders without lag
    setInvoices(prev => {
      const idx = prev.findIndex(inv => String(inv.invoiceNo) === String(invoiceNo));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setInvoices(prev => prev.map(inv => String(inv.invoiceNo) === String(invoiceNo) ? saved : inv));
        return saved;
      }
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err);
    }
    return payload;
  };

  // Delete an Invoice from backend database
  const deleteInvoice = async (invoiceNo) => {
    setInvoices(prev => prev.filter(inv => String(inv.invoiceNo) !== String(invoiceNo)));
    try {
      await fetch(`${API_BASE_URL}/api/invoices/${invoiceNo}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete invoice from MongoDB:', err);
    }
  };

  // Add or Update a Quotation in backend database
  const addQuotation = async (quotePayload) => {
    const quoteId = quotePayload.quoteId || `QT-${String(quotations.reduce((max, q) => {
      const n = parseInt((q.quoteId || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1).padStart(2, '0')}`;

    const payload = {
      ...quotePayload,
      quoteId,
      createdOn: quotePayload.createdOn || new Date().toLocaleDateString('en-IN')
    };

    // Synchronously update local state immediately
    setQuotations(prev => {
      const idx = prev.findIndex(q => String(q.quoteId) === String(quoteId));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setQuotations(prev => prev.map(q => String(q.quoteId) === String(quoteId) ? saved : q));
        return saved;
      }
    } catch (err) {
      console.error('Failed to save quotation to MongoDB:', err);
    }
    return payload;
  };

  // Delete a Quotation from backend database
  const deleteQuotation = async (quoteId) => {
    setQuotations(prev => prev.filter(q => String(q.quoteId) !== String(quoteId)));
    try {
      await fetch(`${API_BASE_URL}/api/quotations/${quoteId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete quotation from MongoDB:', err);
    }
  };

  // JobSheets Sync Helpers
  const syncJobSheetsWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const j of [...added, ...edited]) {
      syncToBackend('/api/jobsheets', j);
    }
    for (const j of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/jobsheets/${j.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync deleted job sheet with MongoDB:', e);
      }
    }
  };

  const handleSetJobSheets = (action) => {
    if (typeof action === 'function') {
      setJobSheets(prev => {
        const updated = action(prev);
        syncJobSheetsWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncJobSheetsWithDatabase(jobSheets, action);
      setJobSheets(action);
    }
  };

  // ServiceBills Sync Helpers
  const syncServiceBillsWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const b of [...added, ...edited]) {
      syncToBackend('/api/service-bills', b);
    }
    for (const b of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/service-bills/${b.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to sync deleted service bill with MongoDB:', e);
      }
    }
  };

  const handleSetServiceBills = (action) => {
    if (typeof action === 'function') {
      setServiceBills(prev => {
        const updated = action(prev);
        syncServiceBillsWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncServiceBillsWithDatabase(serviceBills, action);
      setServiceBills(action);
    }
  };

  // Expenses Sync Helpers
  const syncExpensesWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const exp of [...added, ...edited]) {
      syncToBackend('/api/expenses', exp);
    }
    for (const exp of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/expenses/${exp.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete expense from MongoDB:', e);
      }
    }
  };

  const handleSetDailyExpenses = (action) => {
    if (typeof action === 'function') {
      setDailyExpenses(prev => {
        const updated = action(prev);
        syncExpensesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncExpensesWithDatabase(dailyExpenses, action);
      setDailyExpenses(action);
    }
  };

  // Purchase Invoices Sync Helpers
  const syncPurchasesWithDatabase = async (prev, updated) => {
    const added = updated.filter(u => !prev.some(p => p.id === u.id));
    const deleted = prev.filter(p => !updated.some(u => u.id === p.id));
    const edited = updated.filter(u => {
      const match = prev.find(p => p.id === u.id);
      return match && JSON.stringify(match) !== JSON.stringify(u);
    });

    for (const pur of [...added, ...edited]) {
      syncToBackend('/api/purchases', pur);
    }
    for (const pur of deleted) {
      try {
        await fetch(`${API_BASE_URL}/api/purchases/${pur.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete purchase invoice from MongoDB:', e);
      }
    }
  };

  const handleSetPurchaseInvoices = (action) => {
    if (typeof action === 'function') {
      setPurchaseInvoices(prev => {
        const updated = action(prev);
        syncPurchasesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncPurchasesWithDatabase(purchaseInvoices, action);
      setPurchaseInvoices(action);
    }
  };

  // Company Profile Sync Helper
  const handleSetCompanyProfile = async (action) => {
    const updated = typeof action === 'function' ? action(companyProfile) : action;
    const nextProfile = { ...(companyProfile || {}), ...(updated || {}) };
    const nextWithPrintSettings = {
      ...nextProfile,
      printSettings: nextProfile.printSettings || printSettings || DEFAULT_PRINT_SETTINGS
    };
    setCompanyProfile(nextWithPrintSettings);
    setPrintSettings(nextWithPrintSettings.printSettings || DEFAULT_PRINT_SETTINGS);
    localStorage.setItem('nandhi_app_company_profile', JSON.stringify(nextWithPrintSettings));
    localStorage.setItem('nandhi_company_profile', JSON.stringify(nextWithPrintSettings));
    try {
      await fetch(`${API_BASE_URL}/api/company-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextWithPrintSettings)
      });
    } catch (e) {
      console.error('Failed to sync company profile with MongoDB:', e);
    }
  };

  // System Stats for Dashboard Overview
  const [stats, setStats] = useState({
    leadsToday: 0,
    activeServices: 0,
    lowStockCount: 0,
    revenueToday: 0
  });

  // Recent Activity Feed for Dashboard
  const [activities, setActivities] = useState([]);

  // Quick helper to change tabs
  const handleTabChange = (tab, subTab = null) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
    } else {
      if (tab === 'leads') setActiveSubTab('sale-lead');
      else if (tab === 'service') setActiveSubTab('add-jobsheet');
      else if (tab === 'spares') setActiveSubTab('vehicle-list');
      else if (tab === 'purchase') setActiveSubTab('vehicle-purchase');
      else if (tab === 'accounting') setActiveSubTab('ledger');
      else if (tab === 'management') setActiveSubTab('customers');
      else if (tab === 'profile') setActiveSubTab(null);
      else setActiveSubTab(null);
    }
  };

  // Render placeholder page for options the user will customize later
  const renderPlaceholderSection = () => {
    const formatName = (str) => {
      if (!str) return '';
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const sectionTitle = formatName(activeSubTab || activeTab);
    const parentTitle = formatName(activeTab);

    return (
      <div className="card" style={{ borderTop: '4px solid #059669', animation: 'fadeIn 0.3s ease' }}>
        <div className="card-header">
          <h3 className="card-title">
            <span style={{ color: '#059669', fontWeight: 700 }}>{sectionTitle}</span>
          </h3>
          <span className="badge badge-success" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            Ready for Customization
          </span>
        </div>
        <div className="card-body" style={{ textAlign: 'center', padding: '60px 40px' }}>
          {/* Custom Visual Dotted Box indicating layout placeholder */}
          <div style={{
            maxWidth: '550px',
            margin: '0 auto',
            border: '2.5px dashed #10b981',
            borderRadius: '12px',
            padding: '40px 30px',
            backgroundColor: '#fafdfb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64, color: '#059669' }}>
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                {parentTitle} &gt; {sectionTitle} Module
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                This option is fully set up in the dashboard shell navigation. You can now build and integrate your custom components directly in this screen.
              </p>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#9ca3af', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '10px 16px', borderRadius: '8px', fontFamily: 'monospace' }}>
              Modify App.jsx to render your component for this tab.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dynamic alert count for Header Notification Badge
  const alertCount = React.useMemo(() => {
    const lowStock = spares.filter(s => Number(s.stock || s.qty || 0) <= Number(s.minStock || 5)).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const followupsDue = leads.filter(l => {
      if (l.reminder === 'OFF' || !l.followupDate) return false;
      let compDate = l.followupDate;
      if (l.followupDate.includes('/')) {
        const p = l.followupDate.split('/');
        if (p.length === 3) compDate = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
      }
      return compDate <= todayStr;
    }).length;
    return lowStock + followupsDue;
  }, [spares, leads]);

  if (!isAuthenticated) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">N</div>
            <div>
              <h1>NANDHI MOTORS</h1>
              <p>Dealer Management System</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-header">
              <h2>Sign in</h2>
            </div>

            <label>
              <span>Username</span>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="NANDHI MOTORS or 9791537272"
                autoComplete="username"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>

            {loginError && <div className="login-error">{loginError}</div>}

            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {globalToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            background: globalToast.tone === 'error' ? '#fee2e2' : '#ecfdf5',
            border: `1px solid ${globalToast.tone === 'error' ? '#fca5a5' : '#a7f3d0'}`,
            color: globalToast.tone === 'error' ? '#b91c1c' : '#047857',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            maxWidth: '360px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span style={{ fontSize: '1rem' }}>{globalToast.tone === 'error' ? '⚠' : '✓'}</span>
          <span>{globalToast.message}</span>
        </div>
      )}

      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onChangeTab={handleTabChange}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="main-content">
        {/* Header */}
        <Header
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onSearchChange={(query) => console.log('Searching:', query)}
          notificationCount={alertCount}
          onAlertClick={() => handleTabChange('management', 'alerts')}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          onLogout={handleLogout}
        />

        {/* Dynamic Page body */}
        <main className="page-body">
          {activeTab === 'dashboard' ? (
            <DashboardOverview
              leads={leads}
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'leads' ? (
            <LeadsManagement
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              leads={leads}
              setLeads={handleSetLeads}
              addLead={addLead}
              updateLead={updateLead}
              deleteLead={deleteLead}
              addCustomer={addCustomer}
              vehicles={vehicles}
              showPreviews={showPreviews}
              invoices={invoices}
              addInvoice={addInvoice}
              deleteInvoice={deleteInvoice}
              quotations={quotations}
              addQuotation={addQuotation}
              deleteQuotation={deleteQuotation}
              companyProfile={companyProfile}
              customers={customers}
            />
          ) : activeTab === 'service' ? (
            <VehicleServicePage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              jobSheets={jobSheets}
              setJobSheets={handleSetJobSheets}
              serviceBills={serviceBills}
              setServiceBills={handleSetServiceBills}
              spares={spares}
              showPreviews={showPreviews}
              customers={customers}
              companyProfile={{
                ...companyProfile,
                serviceLaborTypes: companyProfile?.serviceLaborTypes?.length > 0 
                  ? companyProfile.serviceLaborTypes 
                  : DEFAULT_SERVICE_LABOR_TYPES
              }}
            />
          ) : activeTab === 'settings' ? (
            <SettingsPage
              showPreviews={showPreviews}
              setShowPreviews={setShowPreviews}
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
              printSettings={printSettings}
              setPrintSettings={setPrintSettings}
            />
          ) : activeTab === 'management' && activeSubTab === 'customers' ? (
            <CustomersPage
              customers={customers}
              setCustomers={handleSetCustomers}
            />
          ) : activeTab === 'spares' && activeSubTab === 'vehicle-list' ? (
            <VehicleListPage
              vehicles={vehicles}
              setVehicles={handleSetVehicles}
            />
          ) : activeTab === 'spares' && activeSubTab === 'spare-inventory' ? (
            <SpareInventoryPage
              spares={spares}
              setSpares={handleSetSpares}
              showPreviews={showPreviews}
            />
          ) : activeTab === 'purchase' ? (
            <PurchasePage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              purchaseInvoices={purchaseInvoices}
              setPurchaseInvoices={handleSetPurchaseInvoices}
              spares={spares}
              setSpares={handleSetSpares}
              vehicles={vehicles}
              showPreviews={showPreviews}
              companyProfile={companyProfile}
            />
          ) : activeTab === 'accounting' ? (
            <AccountingLedgerPage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              invoices={invoices}
              setInvoices={setInvoices}
              addInvoice={addInvoice}
              serviceBills={serviceBills}
              setServiceBills={handleSetServiceBills}
              jobSheets={jobSheets}
              setJobSheets={handleSetJobSheets}
              dailyExpenses={dailyExpenses}
              setDailyExpenses={handleSetDailyExpenses}
              purchaseInvoices={purchaseInvoices}
              setPurchaseInvoices={handleSetPurchaseInvoices}
              spares={spares}
              vehicles={vehicles}
              customers={customers}
              companyProfile={companyProfile}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'warranty' ? (
            <WarrantyClaimPage
              customers={customers}
              vehicles={vehicles}
              spares={spares}
              companyProfile={companyProfile}
            />
          ) : activeTab === 'management' && activeSubTab === 'executives' ? (
            <ExecutivesPage />
          ) : activeTab === 'management' && activeSubTab === 'alerts' ? (
            <AlertsPage
              spares={spares}
              jobSheets={jobSheets}
              serviceBills={serviceBills}
              customers={customers}
              leads={leads}
              updateLead={updateLead}
              setLeads={handleSetLeads}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'management' && activeSubTab === 'birthday' ? (
            <BirthdayWishesPage
              customers={customers}
              invoices={invoices}
            />
          ) : activeTab === 'management' && activeSubTab === 'redeem' ? (
            <RedeemPointsPage
              customers={customers}
            />
          ) : activeTab === 'profile' ? (
            <CompanyProfilePage
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
            />
          ) : (
            renderPlaceholderSection()
          )}
        </main>
      </div>
    </div>
  );
}
