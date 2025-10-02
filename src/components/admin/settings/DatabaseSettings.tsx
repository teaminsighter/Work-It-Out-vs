'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Server, 
  HardDrive,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Play,
  Pause,
  BarChart3,
  Clock,
  Trash2,
  Download,
  Upload,
  Settings,
  Shield,
  Key,
  Globe,
  Zap,
  Monitor,
  Calendar,
  FileText,
  Eye,
  Save
} from 'lucide-react';

interface DatabaseStats {
  totalSize: string;
  recordCount: number;
  tableCount: number;
  indexSize: string;
  avgQueryTime: string;
  connectionsActive: number;
  connectionsMax: number;
  uptime: string;
  lastBackup: string;
  cacheHitRatio: number;
}

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  avgQueryTime: string;
  lastAccessed: string;
  status: 'healthy' | 'warning' | 'error';
}

interface DatabaseConnection {
  id: string;
  user: string;
  database: string;
  host: string;
  state: 'active' | 'idle' | 'waiting';
  duration: string;
  query: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  poolSize: number;
  autoVacuum: boolean;
  logging: boolean;
  ssl: boolean;
  backupRetention: number;
  maintenanceWindow: string;
}

const DatabaseSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [config, setConfig] = useState<DatabaseConfig | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tables' | 'connections' | 'config'>('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasConfigChanges, setHasConfigChanges] = useState(false);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = () => {
    setIsLoading(true);

    const mockStats: DatabaseStats = {
      totalSize: '2.4 GB',
      recordCount: 125847,
      tableCount: 23,
      indexSize: '456 MB',
      avgQueryTime: '12.3ms',
      connectionsActive: 8,
      connectionsMax: 100,
      uptime: '15 days, 6 hours',
      lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      cacheHitRatio: 94.7
    };

    const mockTables: DatabaseTable[] = [
      {
        name: 'leads',
        rows: 8456,
        size: '234 MB',
        avgQueryTime: '8.2ms',
        lastAccessed: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'healthy'
      },
      {
        name: 'users',
        rows: 156,
        size: '12 MB',
        avgQueryTime: '3.1ms',
        lastAccessed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'healthy'
      },
      {
        name: 'analytics_events',
        rows: 95432,
        size: '1.2 GB',
        avgQueryTime: '45.6ms',
        lastAccessed: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        status: 'warning'
      },
      {
        name: 'sessions',
        rows: 12456,
        size: '89 MB',
        avgQueryTime: '15.3ms',
        lastAccessed: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        status: 'healthy'
      },
      {
        name: 'activity_logs',
        rows: 34567,
        size: '456 MB',
        avgQueryTime: '22.1ms',
        lastAccessed: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        status: 'healthy'
      },
      {
        name: 'temp_calculations',
        rows: 567,
        size: '5 MB',
        avgQueryTime: '125.4ms',
        lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'error'
      }
    ];

    const mockConnections: DatabaseConnection[] = [
      {
        id: 'conn_1',
        user: 'app_user',
        database: 'localpower_prod',
        host: '192.168.1.100',
        state: 'active',
        duration: '00:02:34',
        query: 'SELECT * FROM leads WHERE status = \'new\' ORDER BY created_at DESC'
      },
      {
        id: 'conn_2',
        user: 'analytics_user',
        database: 'localpower_prod',
        host: '192.168.1.101',
        state: 'active',
        duration: '00:00:45',
        query: 'INSERT INTO analytics_events (event_type, user_id, data) VALUES...'
      },
      {
        id: 'conn_3',
        user: 'backup_user',
        database: 'localpower_prod',
        host: '192.168.1.102',
        state: 'waiting',
        duration: '00:15:22',
        query: 'VACUUM ANALYZE leads'
      },
      {
        id: 'conn_4',
        user: 'app_user',
        database: 'localpower_prod',
        host: '192.168.1.100',
        state: 'idle',
        duration: '00:00:12',
        query: ''
      }
    ];

    const mockConfig: DatabaseConfig = {
      host: 'localhost',
      port: 5432,
      database: 'localpower_prod',
      username: 'postgres',
      maxConnections: 100,
      connectionTimeout: 30,
      queryTimeout: 60,
      poolSize: 20,
      autoVacuum: true,
      logging: true,
      ssl: true,
      backupRetention: 30,
      maintenanceWindow: '02:00-04:00'
    };

    setTimeout(() => {
      setStats(mockStats);
      setTables(mockTables);
      setConnections(mockConnections);
      setConfig(mockConfig);
      setIsLoading(false);
    }, 1000);
  };

  const optimizeDatabase = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      loadDatabaseData();
    }, 3000);
  };

  const updateConfig = (key: keyof DatabaseConfig, value: any) => {
    if (config) {
      setConfig({ ...config, [key]: value });
      setHasConfigChanges(true);
    }
  };

  const saveConfig = () => {
    setHasConfigChanges(false);
    // Simulate save
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionStateColor = (state: string) => {
    switch (state) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading database information...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600 mt-1">Monitor and configure database settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadDatabaseData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={optimizeDatabase}
            disabled={isOptimizing}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#146443' }}
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
                <p className="text-sm text-gray-600">Database Size</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.recordCount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.connectionsActive}/{stats.connectionsMax}</p>
                <p className="text-sm text-gray-600">Connections</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.cacheHitRatio}%</p>
                <p className="text-sm text-gray-600">Cache Hit Ratio</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {[
            { id: 'overview', name: 'Overview', icon: <Monitor className="w-4 h-4" /> },
            { id: 'tables', name: 'Tables', icon: <Database className="w-4 h-4" /> },
            { id: 'connections', name: 'Connections', icon: <Globe className="w-4 h-4" /> },
            { id: 'config', name: 'Configuration', icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTab === tab.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.name}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Query Time:</span>
                    <span className="text-gray-900">{stats.avgQueryTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache Hit Ratio:</span>
                    <span className="text-gray-900">{stats.cacheHitRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Index Size:</span>
                    <span className="text-gray-900">{stats.indexSize}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="text-gray-900">{stats.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tables:</span>
                    <span className="text-gray-900">{stats.tableCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="text-gray-900">{new Date(stats.lastBackup).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Storage</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Size:</span>
                    <span className="text-gray-900">{stats.totalSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Records:</span>
                    <span className="text-gray-900">{stats.recordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="text-gray-900">+2.3% / month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {selectedTab === 'tables' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Table Name</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Rows</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Size</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Avg Query Time</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Last Accessed</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{table.name}</div>
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {table.rows.toLocaleString()}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {table.size}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {table.avgQueryTime}
                      </td>
                      <td className="py-3 text-center text-xs text-gray-600">
                        {new Date(table.lastAccessed).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTableStatusIcon(table.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTableStatusColor(table.status)}`}>
                            {table.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {selectedTab === 'connections' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">User</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Database</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Host</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">State</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Duration</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Query</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn) => (
                    <tr key={conn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{conn.user}</div>
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {conn.database}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {conn.host}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectionStateColor(conn.state)}`}>
                          {conn.state}
                        </span>
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {conn.duration}
                      </td>
                      <td className="py-3 text-sm text-gray-600 max-w-xs truncate">
                        {conn.query || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {selectedTab === 'config' && config && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Database Configuration</h3>
              {hasConfigChanges && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveConfig}
                  className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  style={{ backgroundColor: '#146443' }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => updateConfig('host', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
                <input
                  type="text"
                  value={config.database}
                  onChange={(e) => updateConfig('database', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Connections</label>
                <input
                  type="number"
                  value={config.maxConnections}
                  onChange={(e) => updateConfig('maxConnections', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Connection Timeout (s)</label>
                <input
                  type="number"
                  value={config.connectionTimeout}
                  onChange={(e) => updateConfig('connectionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Query Timeout (s)</label>
                <input
                  type="number"
                  value={config.queryTimeout}
                  onChange={(e) => updateConfig('queryTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pool Size</label>
                <input
                  type="number"
                  value={config.poolSize}
                  onChange={(e) => updateConfig('poolSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                <input
                  type="number"
                  value={config.backupRetention}
                  onChange={(e) => updateConfig('backupRetention', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Window</label>
                <input
                  type="text"
                  value={config.maintenanceWindow}
                  onChange={(e) => updateConfig('maintenanceWindow', e.target.value)}
                  placeholder="HH:MM-HH:MM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Vacuum</label>
                  <p className="text-xs text-gray-500">Automatically clean up database</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoVacuum}
                  onChange={(e) => updateConfig('autoVacuum', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Logging</label>
                  <p className="text-xs text-gray-500">Log database queries and operations</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.logging}
                  onChange={(e) => updateConfig('logging', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SSL Enabled</label>
                  <p className="text-xs text-gray-500">Use SSL for database connections</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.ssl}
                  onChange={(e) => updateConfig('ssl', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSettings;