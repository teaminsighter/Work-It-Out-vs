'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface RealTimeData {
  success: boolean;
  data: {
    realtime: {
      activeUsers: number;
      leadsToday: number;
      conversionRate: number;
      avgSessionDuration: number;
      pageViewsToday: number;
      pageViewsLast5Min: number;
      bounceRate: number;
    };
    liveActivity: Array<{
      type: string;
      page: string;
      location: string;
      device: string;
      timestamp: string;
      timeAgo: string;
    }>;
    geoDistribution: Array<{
      location: string;
      visitors: number;
      percentage: number;
    }>;
    deviceBreakdown: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    trafficSources: Array<{
      source: string;
      leads: number;
      percentage: number;
    }>;
    timestamp: string;
  };
}

const RealTimeTracking = () => {
  const [realtimeData, setRealtimeData] = useState<RealTimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRealTimeData();
    
    if (!isPaused) {
      // Update real-time data every 30 seconds
      const interval = setInterval(() => {
        loadRealTimeData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const loadRealTimeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/realtime');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch real-time data');
      }
      
      setRealtimeData(data);
    } catch (error) {
      console.error('Error loading real-time data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load real-time data');
      // Set empty state for production
      setRealtimeData({
        success: true,
        data: {
          realtime: {
            activeUsers: 0,
            leadsToday: 0,
            conversionRate: 0,
            avgSessionDuration: 0,
            pageViewsToday: 0,
            pageViewsLast5Min: 0,
            bounceRate: 0
          },
          liveActivity: [],
          geoDistribution: [],
          deviceBreakdown: [],
          trafficSources: [],
          timestamp: new Date().toISOString()
        }
      });
    }
    
    setIsLoading(false);
  };


  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'lead': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'form_start': return <MousePointer className="w-4 h-4 text-purple-500" />;
      case 'conversion': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-green-500" />;
      case 'desktop': return <Monitor className="w-4 h-4 text-purple-500" />;
      default: return <Monitor className="w-4 h-4 text-gray-500" />;
    }
  };


  // Extract data from API response
  const realTimeMetrics = realtimeData?.data.realtime || {
    activeUsers: 0,
    leadsToday: 0,
    conversionRate: 0,
    avgSessionDuration: 0,
    pageViewsToday: 0,
    pageViewsLast5Min: 0,
    bounceRate: 0
  };
  const liveActivity = realtimeData?.data.liveActivity || [];
  const geoDistribution = realtimeData?.data.geoDistribution || [];
  const deviceBreakdown = realtimeData?.data.deviceBreakdown || [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading real-time analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-900 font-medium mb-2">Unable to load real-time data</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadRealTimeData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Tracking</h1>
          <p className="text-gray-600 mt-1">Live user activity and insurance quote form performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isPaused 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadRealTimeData}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-sm font-medium text-green-700">
              {isPaused ? 'Paused' : 'Live Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{realTimeMetrics.activeUsers}</p>
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-xs text-green-600">currently active</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-blue-600 flex items-center text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>+{realTimeMetrics.pageViewsLast5Min}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{realTimeMetrics.pageViewsToday}</p>
          <p className="text-sm text-gray-600">Page Views Today</p>
          <p className="text-xs text-blue-600">across all pages</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{Math.floor(realTimeMetrics.avgSessionDuration / 60)}:{(realTimeMetrics.avgSessionDuration % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm text-gray-600">Avg Session</p>
          <p className="text-xs text-purple-600">duration</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-green-600 flex items-center text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>2.3%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{realTimeMetrics.conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Live Conversion</p>
          <p className="text-xs text-yellow-600">quote form to lead</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Live Activity Feed</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
              {liveActivity.length} recent events
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveActivity.map((activity, index) => (
              <motion.div
                key={`${activity.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  {getEventIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    User viewed {activity.page}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(activity.device)}
                      <span>{activity.device}</span>
                    </div>
                    <span>{activity.timeAgo}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {liveActivity.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs">Activity will appear here as users visit your website</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Traffic Sources</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(realtimeData?.data.trafficSources || []).slice(0, 5).map((source, index) => (
              <div key={source.source} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.leads} leads</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: '#146443'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{source.percentage.toFixed(1)}% of leads</p>
              </div>
            ))}
            {(realtimeData?.data.trafficSources || []).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No traffic sources</p>
                <p className="text-gray-400 text-xs">Data will appear as leads are generated</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Live Device Distribution</h3>
          <div className="space-y-4">
            {deviceBreakdown.map((device) => (
              <div key={device.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{device.type}</p>
                    <p className="text-sm text-gray-500">{device.count} visitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{device.percentage.toFixed(1)}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${device.percentage}%`,
                        backgroundColor: '#146443'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {deviceBreakdown.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">No device data available</p>
            )}
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Live Geographic Activity</h3>
          <div className="space-y-4">
            {geoDistribution.slice(0, 8).map((geo) => (
              <div key={geo.location} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{geo.location}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{geo.visitors}</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${geo.percentage}%`,
                        backgroundColor: '#146443'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {geoDistribution.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">No geographic data available</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RealTimeTracking;