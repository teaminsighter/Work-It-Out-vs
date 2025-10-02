'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Users, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingUp,
  Eye,
  Clock,
  Shield,
  Copy,
  Check
} from 'lucide-react';

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  topCountries: { country: string; count: number }[];
  deviceBreakdown: Record<string, number>;
  recentVisitors?: VisitorRecord[];
}

interface VisitorRecord {
  id: string;
  ipAddress: string;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  page: string;
  deviceType: string | null;
  browser: string | null;
  timestamp: string;
  isBot: boolean;
}

const VisitorTrackingDashboard = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState(7);
  const [mounted, setMounted] = useState(false);
  const [copiedIP, setCopiedIP] = useState<string | null>(null);

  const fetchVisitorData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch(`/api/track-visitor?days=${timeFrame}`);
      const statsData = await statsResponse.json();
      
      // Provide defaults if no data
      const defaultStats = {
        totalVisitors: 0,
        uniqueVisitors: 0,
        topCountries: [],
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 }
      };
      
      setStats({ ...defaultStats, ...statsData });
      
      // Use real recent visitors data from API
      if (statsData.recentVisitors) {
        setRecentVisitors(statsData.recentVisitors);
      }
      
    } catch (error) {
      console.error('Failed to fetch visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchVisitorData();
  }, [timeFrame]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (typeof window === 'undefined') return timestamp; // SSR fallback
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIP(text);
      setTimeout(() => setCopiedIP(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getIPType = (ip: string) => {
    // Check if it's IPv6
    if (ip.includes(':')) {
      return 'IPv6';
    }
    // Check if it's IPv4
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      return 'IPv4';
    }
    return 'Unknown';
  };

  const formatIP = (ip: string) => {
    // For IPv6, show in traditional format with compression
    if (ip.includes(':')) {
      // Handle IPv6 loopback
      if (ip === '::1') {
        return '::1 (localhost)';
      }
      // For long IPv6, show first and last parts
      if (ip.length > 20) {
        const parts = ip.split(':');
        return `${parts.slice(0, 3).join(':')}...${parts.slice(-2).join(':')}`;
      }
      return ip;
    }
    // IPv4 stays as is
    return ip;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visitor Tracking</h2>
          <p className="text-gray-600">Monitor website traffic and user behavior</p>
        </div>
        
        {/* Time Frame Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Time frame:</label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Visitors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Unique Visitors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueVisitors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Top Country */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Country</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.topCountries.length > 0 ? stats.topCountries[0].country : 'No Data'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.topCountries.length > 0 ? `${stats.topCountries[0].count} visitors` : '0 visitors'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          {/* Top Device */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Device</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {Object.keys(stats.deviceBreakdown).length > 0 
                    ? Object.entries(stats.deviceBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No Data' 
                    : 'No Data'}
                </p>
                <p className="text-sm text-gray-500">
                  {Object.keys(stats.deviceBreakdown).length > 0 
                    ? `${Object.entries(stats.deviceBreakdown).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} visitors`
                    : '0 visitors'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                {getDeviceIcon(Object.entries(stats.deviceBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'desktop')}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-3">
              {stats.topCountries.slice(0, 5).map((country, index) => {
                const total = stats.topCountries.reduce((sum, c) => sum + c.count, 0);
                const percentage = total > 0 ? (country.count / total) * 100 : 0;
                
                return (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {country.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Device Breakdown */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
            <div className="space-y-3">
              {Object.entries(stats.deviceBreakdown).map(([device, count], index) => {
                const total = Object.values(stats.deviceBreakdown).reduce((sum, c) => sum + c, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getDeviceIcon(device)}
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Visitors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Visitors</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Full IP addresses with copy functionality</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {visitor.city && visitor.country 
                          ? `${visitor.city}, ${visitor.country}`
                          : visitor.country || 'Unknown'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getIPType(visitor.ipAddress) === 'IPv4' ? (
                        // IPv4 Display - Blue background style
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-2">
                            <span className="text-xs font-medium">IPv4:</span>
                            <span className="text-xs">?</span>
                            <span className="font-mono text-sm underline decoration-white">
                              {visitor.ipAddress}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(visitor.ipAddress)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy IPv4 address"
                          >
                            {copiedIP === visitor.ipAddress ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      ) : (
                        // IPv6 Display - Fallback style
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-600 text-white px-3 py-1 rounded-md flex items-center gap-2">
                            <span className="text-xs font-medium">IPv6:</span>
                            <span className="font-mono text-sm">
                              {formatIP(visitor.ipAddress)}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(visitor.ipAddress)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy IPv6 address"
                          >
                            {copiedIP === visitor.ipAddress ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(visitor.deviceType || 'desktop')}
                      <span className="text-sm text-gray-900 capitalize">
                        {visitor.deviceType} / {visitor.browser}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visitor.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTimestamp(visitor.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default VisitorTrackingDashboard;