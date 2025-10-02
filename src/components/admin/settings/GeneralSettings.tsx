'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Clock, 
  Monitor,
  Palette,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Languages,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Shield,
  Bell,
  Database,
  HardDrive,
  Wifi,
  Lock,
  Key,
  Mail,
  Phone,
  Building,
  User
} from 'lucide-react';

interface GeneralSettings {
  // Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  companyLogo: string;
  
  // Admin Panel Customization
  adminPanelName: string;
  primaryColor: string;
  secondaryColor: string;
  navbarColor: string;
  buttonColor: string;
  
  // Localization
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  logoPosition: 'left' | 'center' | 'right';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // System Preferences
  autoSave: boolean;
  autoBackup: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationSound: boolean;
  
  // Privacy & Security
  twoFactorRequired: boolean;
  passwordComplexity: 'low' | 'medium' | 'high';
  dataRetention: number;
  activityLogging: boolean;
  ipWhitelist: string[];
  
  // Performance
  cacheEnabled: boolean;
  compressionEnabled: boolean;
  cdnEnabled: boolean;
  maxFileSize: number;
  
  // Regional Settings
  country: string;
  region: string;
  city: string;
  postalCode: string;
}

const GeneralSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings changes immediately for live preview
  useEffect(() => {
    if (settings) {
      applyThemeSettings(settings);
      applyLanguageSettings(settings);
      applyTimezoneSettings(settings);
    }
  }, [settings?.primaryColor, settings?.navbarColor, settings?.buttonColor, settings?.secondaryColor, settings?.theme, settings?.language, settings?.timezone, settings?.compactMode]);

  // Apply language settings
  const applyLanguageSettings = (settings: GeneralSettings) => {
    // Set HTML lang attribute
    document.documentElement.lang = settings.language.split('-')[0];
    
    // Store language preference
    localStorage.setItem('preferredLanguage', settings.language);
    
    // Apply RTL/LTR direction if needed
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isRTL = rtlLanguages.includes(settings.language.split('-')[0]);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  };

  // Apply timezone settings
  const applyTimezoneSettings = (settings: GeneralSettings) => {
    // Store timezone preference
    localStorage.setItem('preferredTimezone', settings.timezone);
    
    // Update any displayed times (this would typically trigger a re-render of time components)
    const event = new CustomEvent('timezoneChanged', { detail: settings.timezone });
    window.dispatchEvent(event);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        console.error('Failed to load settings:', data.error);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof GeneralSettings, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      setHasChanges(true);
      
      // Apply auto-save if enabled
      if (settings.autoSave && key !== 'autoSave') {
        setTimeout(() => {
          localStorage.setItem('generalSettings', JSON.stringify(newSettings));
          applySystemPreferences(newSettings);
        }, 1000);
      }
    }
  };

  // Apply system preferences
  const applySystemPreferences = (settings: GeneralSettings) => {
    // Session timeout
    if (settings.sessionTimeout) {
      const timeout = settings.sessionTimeout * 60 * 1000; // Convert to milliseconds
      localStorage.setItem('sessionTimeout', timeout.toString());
      
      // Set up session timeout warning
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
      
      window.sessionTimeoutId = setTimeout(() => {
        if (confirm('Your session is about to expire. Would you like to extend it?')) {
          applySystemPreferences(settings); // Reset timeout
        } else {
          // Handle logout
          window.location.href = '/admin/login';
        }
      }, timeout - 300000); // 5 minutes warning
    }
    
    // Auto backup
    if (settings.autoBackup) {
      localStorage.setItem('autoBackupEnabled', 'true');
      // Trigger backup process
      scheduleAutoBackup();
    } else {
      localStorage.setItem('autoBackupEnabled', 'false');
    }
    
    // Activity logging
    if (settings.activityLogging) {
      localStorage.setItem('activityLoggingEnabled', 'true');
      // Log this settings change
      logActivity('Settings updated', { timestamp: new Date().toISOString() });
    } else {
      localStorage.setItem('activityLoggingEnabled', 'false');
    }
  };

  // Schedule auto backup
  const scheduleAutoBackup = () => {
    const lastBackup = localStorage.getItem('lastBackupTime');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!lastBackup || now - parseInt(lastBackup) > oneDayMs) {
      // Perform backup
      performBackup();
      localStorage.setItem('lastBackupTime', now.toString());
    }
  };

  // Perform backup
  const performBackup = () => {
    const backupData = {
      settings: localStorage.getItem('generalSettings'),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('systemBackup', JSON.stringify(backupData));
    console.log('Auto backup completed at', new Date().toISOString());
  };

  // Log activity
  const logActivity = (action: string, details: any) => {
    const activityLog = JSON.parse(localStorage.getItem('activityLog') || '[]');
    activityLog.push({
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'admin'
    });
    
    // Keep only last 1000 entries
    if (activityLog.length > 1000) {
      activityLog.splice(0, activityLog.length - 1000);
    }
    
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings,
          userId: 'admin' // TODO: Get from auth context
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveSuccess(true);
        setHasChanges(false);
        
        // Apply theme immediately
        if (settings) {
          applyThemeSettings(settings);
        }
        
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply theme settings to document
  const applyThemeSettings = (settings: GeneralSettings) => {
    // Apply primary color and generate variations
    const primaryColor = settings.primaryColor;
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Apply navbar color
    const navbarColor = settings.navbarColor;
    document.documentElement.style.setProperty('--navbar-color', navbarColor);
    
    // Apply button color
    const buttonColor = settings.buttonColor;
    document.documentElement.style.setProperty('--button-color', buttonColor);
    
    // Apply secondary color
    const secondaryColor = settings.secondaryColor;
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    // Generate color variations
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      document.documentElement.style.setProperty('--primary-50', `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`);
      document.documentElement.style.setProperty('--primary-100', `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
      document.documentElement.style.setProperty('--primary-600', `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`);
      document.documentElement.style.setProperty('--primary-700', `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})`);
    }
    
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    } else {
      // Auto theme - use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#111827';
        document.body.style.color = '#f9fafb';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#111827';
      }
    }
    
    // Apply compact mode
    if (settings.compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const resetSettings = () => {
    loadSettings();
    setHasChanges(false);
  };

  const languages = [
    { code: 'en-NZ', name: 'English (New Zealand)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'es-ES', name: 'Español (Spain)' },
    { code: 'fr-FR', name: 'Français (France)' },
    { code: 'de-DE', name: 'Deutsch (Germany)' },
    { code: 'it-IT', name: 'Italiano (Italy)' },
    { code: 'pt-BR', name: 'Português (Brazil)' },
    { code: 'zh-CN', name: '中文 (Simplified)' },
    { code: 'ja-JP', name: '日本語 (Japanese)' }
  ];

  const timezones = [
    'Pacific/Auckland',
    'Pacific/Chatham',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore'
  ];

  const currencies = [
    { code: 'AUD', name: 'Australian Dollar (AUD)', symbol: '$' },
    { code: 'USD', name: 'US Dollar (USD)', symbol: '$' },
    { code: 'EUR', name: 'Euro (EUR)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (GBP)', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar (CAD)', symbol: '$' },
    { code: 'NZD', name: 'New Zealand Dollar (NZD)', symbol: '$' },
    { code: 'JPY', name: 'Japanese Yen (JPY)', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan (CNY)', symbol: '¥' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading general settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide preferences and settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetSettings}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: hasChanges ? '#146443' : '#9CA3AF' }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">You have unsaved changes</span>
          </div>
        </motion.div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => updateSetting('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => updateSetting('companyEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.companyPhone}
              onChange={(e) => updateSetting('companyPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.companyWebsite}
              onChange={(e) => updateSetting('companyWebsite', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={settings.companyAddress}
              onChange={(e) => updateSetting('companyAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Admin Panel Customization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel Customization</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Panel Name</label>
            <input
              type="text"
              value={settings.adminPanelName}
              onChange={(e) => updateSetting('adminPanelName', e.target.value)}
              placeholder="e.g., Work It Out Admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Navbar Color</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.navbarColor}
                  onChange={(e) => updateSetting('navbarColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.navbarColor}
                  onChange={(e) => updateSetting('navbarColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.buttonColor}
                  onChange={(e) => updateSetting('buttonColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.buttonColor}
                  onChange={(e) => updateSetting('buttonColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Panel Preview */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Admin Panel Preview</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="px-3 py-1 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: settings.navbarColor }}
              >
                {settings.adminPanelName}
              </div>
              <span className="text-sm text-gray-600">← Navbar appearance</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: settings.buttonColor }}
              >
                Sample Button
              </button>
              <span className="text-sm text-gray-600">← Button appearance</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: settings.secondaryColor }}
              >
                Secondary Element
              </div>
              <span className="text-sm text-gray-600">← Secondary color elements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Localization Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Localization & Regional Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSetting('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
            <select
              value={settings.numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1,234.56">1,234.56</option>
              <option value="1.234,56">1.234,56</option>
              <option value="1 234,56">1 234,56</option>
              <option value="1234.56">1234.56</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Appearance & Interface</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              
              {/* Preset Colors */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Quick Presets:</p>
                <div className="flex gap-2">
                  {[
                    '#146443', // Default Green
                    '#3B82F6', // Blue
                    '#EF4444', // Red
                    '#8B5CF6', // Purple
                    '#F59E0B', // Orange
                    '#10B981', // Emerald
                    '#6366F1', // Indigo
                    '#EC4899'  // Pink
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateSetting('primaryColor', color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        settings.primaryColor === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Position</label>
            <select
              value={settings.logoPosition}
              onChange={(e) => updateSetting('logoPosition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compact Mode</label>
              <p className="text-xs text-gray-500">Reduce spacing and padding for smaller screens</p>
            </div>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => updateSetting('compactMode', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Sidebar Collapsed by Default</label>
              <p className="text-xs text-gray-500">Start with sidebar in collapsed state</p>
            </div>
            <input
              type="checkbox"
              checked={settings.sidebarCollapsed}
              onChange={(e) => updateSetting('sidebarCollapsed', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all"
                style={{ backgroundColor: settings.primaryColor }}
              >
                ✓
              </div>
              <span className="text-sm text-gray-600">Primary color preview</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Sample Button
              </button>
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Badge
              </div>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: settings.primaryColor }}
              ></div>
              <span className="text-xs text-gray-500">How components will appear</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-500">Current Settings:</div>
                <div className="space-y-1 mt-1">
                  <div>Theme: <span className="font-medium capitalize">{settings.theme}</span></div>
                  <div>Language: <span className="font-medium">{languages.find(l => l.code === settings.language)?.name}</span></div>
                  <div>Currency: <span className="font-medium">{settings.currency}</span></div>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Live Time:</div>
                <div className="space-y-1 mt-1">
                  <div className="font-mono">
                    {new Date().toLocaleString(settings.language, {
                      timeZone: settings.timezone,
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    })}
                  </div>
                  <div className="text-gray-500">in {settings.timezone}</div>
                </div>
              </div>
            </div>
            
            {/* System Status */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.autoSave ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  Auto-save: {settings.autoSave ? 'Enabled' : 'Disabled'}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.autoBackup ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  Auto-backup: {settings.autoBackup ? 'Enabled' : 'Disabled'}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${settings.activityLogging ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  Activity Logging: {settings.activityLogging ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Preferences</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              min="15"
              max="1440"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              min="3"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
              min="30"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Save</label>
              <p className="text-xs text-gray-500">Automatically save changes as you work</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSetting('autoSave', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Backup</label>
              <p className="text-xs text-gray-500">Automatically backup data daily</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => updateSetting('autoBackup', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Activity Logging</label>
              <p className="text-xs text-gray-500">Log user activities for audit purposes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.activityLogging}
              onChange={(e) => updateSetting('activityLogging', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-xs text-gray-500">Receive browser push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              <p className="text-xs text-gray-500">Receive notifications via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Notification Sound</label>
              <p className="text-xs text-gray-500">Play sound for notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSound}
              onChange={(e) => updateSetting('notificationSound', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;