'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HardDrive, 
  Cloud, 
  Shield,
  Calendar,
  Clock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Play,
  Pause,
  Settings,
  Database,
  FileText,
  Archive,
  Trash2,
  Eye,
  Save,
  Copy,
  Server,
  Lock,
  Unlock,
  Zap,
  Timer
} from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
  size: string;
  duration: string;
  retention: number;
  location: 'local' | 'cloud' | 'both';
}

interface BackupHistory {
  id: string;
  jobName: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'success' | 'failed' | 'partial';
  size: string;
  duration: string;
  location: string;
  errorMessage?: string;
}

interface BackupSettings {
  autoBackup: boolean;
  backupTime: string;
  compression: boolean;
  encryption: boolean;
  verifyBackups: boolean;
  localPath: string;
  cloudProvider: 'aws' | 'azure' | 'gcp' | 'dropbox' | 'none';
  cloudBucket: string;
  maxRetention: number;
  alertOnFailure: boolean;
  alertEmail: string;
  bandwidthLimit: number;
  parallelJobs: number;
}

const BackupSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [selectedTab, setSelectedTab] = useState<'jobs' | 'history' | 'settings'>('jobs');
  const [hasChanges, setHasChanges] = useState(false);
  const [isRunningBackup, setIsRunningBackup] = useState<string>('');

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = () => {
    setIsLoading(true);

    const mockJobs: BackupJob[] = [
      {
        id: 'job_1',
        name: 'Daily Database Backup',
        type: 'incremental',
        frequency: 'daily',
        status: 'active',
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        size: '245 MB',
        duration: '3m 45s',
        retention: 30,
        location: 'both'
      },
      {
        id: 'job_2',
        name: 'Weekly Full System Backup',
        type: 'full',
        frequency: 'weekly',
        status: 'active',
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        size: '2.4 GB',
        duration: '24m 12s',
        retention: 12,
        location: 'cloud'
      },
      {
        id: 'job_3',
        name: 'Configuration Backup',
        type: 'differential',
        frequency: 'weekly',
        status: 'active',
        lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        size: '12 MB',
        duration: '45s',
        retention: 52,
        location: 'local'
      },
      {
        id: 'job_4',
        name: 'User Data Backup',
        type: 'incremental',
        frequency: 'daily',
        status: 'error',
        lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        size: '0 MB',
        duration: '0s',
        retention: 7,
        location: 'local'
      }
    ];

    const mockHistory: BackupHistory[] = [
      {
        id: 'hist_1',
        jobName: 'Daily Database Backup',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'incremental',
        status: 'success',
        size: '245 MB',
        duration: '3m 45s',
        location: 'AWS S3 + Local'
      },
      {
        id: 'hist_2',
        jobName: 'Configuration Backup',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'differential',
        status: 'success',
        size: '12 MB',
        duration: '45s',
        location: 'Local Storage'
      },
      {
        id: 'hist_3',
        jobName: 'Weekly Full System Backup',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'full',
        status: 'success',
        size: '2.4 GB',
        duration: '24m 12s',
        location: 'AWS S3'
      },
      {
        id: 'hist_4',
        jobName: 'User Data Backup',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        type: 'incremental',
        status: 'failed',
        size: '0 MB',
        duration: '5s',
        location: 'Local Storage',
        errorMessage: 'Permission denied: Unable to access user data directory'
      },
      {
        id: 'hist_5',
        jobName: 'Daily Database Backup',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        type: 'incremental',
        status: 'success',
        size: '238 MB',
        duration: '3m 22s',
        location: 'AWS S3 + Local'
      }
    ];

    const mockSettings: BackupSettings = {
      autoBackup: true,
      backupTime: '02:00',
      compression: true,
      encryption: true,
      verifyBackups: true,
      localPath: '/var/backups/localpower',
      cloudProvider: 'aws',
      cloudBucket: 'localpower-backups',
      maxRetention: 90,
      alertOnFailure: true,
      alertEmail: 'admin@localpower.com',
      bandwidthLimit: 50,
      parallelJobs: 2
    };

    setTimeout(() => {
      setJobs(mockJobs);
      setHistory(mockHistory);
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  };

  const runBackup = (jobId: string) => {
    setIsRunningBackup(jobId);
    setTimeout(() => {
      setIsRunningBackup('');
      loadBackupData();
    }, 3000);
  };

  const toggleJobStatus = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === 'active' ? 'paused' : 'active' }
        : job
    ));
  };

  const updateSetting = (key: keyof BackupSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const saveSettings = () => {
    setHasChanges(false);
    // Simulate save
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHistoryStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'text-purple-600 bg-purple-100';
      case 'incremental': return 'text-blue-600 bg-blue-100';
      case 'differential': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'local': return <HardDrive className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'both': return <Server className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading backup settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const errorJobs = jobs.filter(j => j.status === 'error').length;
  const successfulBackups = history.filter(h => h.status === 'success').length;
  const totalBackupSize = history.reduce((total, backup) => {
    const size = parseFloat(backup.size.replace(/[^\d.]/g, ''));
    const unit = backup.size.includes('GB') ? 1024 : 1;
    return total + (size * unit);
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
          <p className="text-gray-600 mt-1">Configure and monitor system backups</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadBackupData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Play className="w-4 h-4" />
            Run Backup
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
              <p className="text-sm text-gray-600">Active Jobs</p>
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Archive className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{successfulBackups}</p>
              <p className="text-sm text-gray-600">Successful Backups</p>
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBackupSize.toFixed(1)} GB</p>
              <p className="text-sm text-gray-600">Total Backup Size</p>
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{errorJobs}</p>
              <p className="text-sm text-gray-600">Failed Jobs</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {[
            { id: 'jobs', name: 'Backup Jobs', count: jobs.length },
            { id: 'history', name: 'Backup History', count: history.length },
            { id: 'settings', name: 'Settings', count: null }
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
              {tab.name} {tab.count !== null && `(${tab.count})`}
            </motion.button>
          ))}
        </div>

        {/* Backup Jobs Tab */}
        {selectedTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getJobStatusIcon(job.status)}
                      <h3 className="font-semibold text-gray-900">{job.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBackupTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                        {getLocationIcon(job.location)}
                        {job.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => runBackup(job.id)}
                      disabled={isRunningBackup === job.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isRunningBackup === job.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Run Now
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleJobStatus(job.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                        job.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {job.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Resume
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium text-gray-900 capitalize">{job.frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Run:</span>
                    <p className="font-medium text-gray-900">{new Date(job.lastRun).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Run:</span>
                    <p className="font-medium text-gray-900">{new Date(job.nextRun).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <p className="font-medium text-gray-900">{job.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium text-gray-900">{job.duration}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Backup History Tab */}
        {selectedTab === 'history' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Job Name</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Timestamp</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Size</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Duration</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Location</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((backup) => (
                    <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{backup.jobName}</div>
                        {backup.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">{backup.errorMessage}</div>
                        )}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {new Date(backup.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBackupTypeColor(backup.type)}`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHistoryStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {backup.size}
                      </td>
                      <td className="py-3 text-center text-sm text-gray-900">
                        {backup.duration}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {backup.location}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Settings Tab */}
        {selectedTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Backup Configuration</h3>
              {hasChanges && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveSettings}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
                <input
                  type="time"
                  value={settings.backupTime}
                  onChange={(e) => updateSetting('backupTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Local Backup Path</label>
                <input
                  type="text"
                  value={settings.localPath}
                  onChange={(e) => updateSetting('localPath', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Provider</label>
                <select
                  value={settings.cloudProvider}
                  onChange={(e) => updateSetting('cloudProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="aws">Amazon S3</option>
                  <option value="azure">Azure Blob</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="dropbox">Dropbox</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Bucket/Container</label>
                <input
                  type="text"
                  value={settings.cloudBucket}
                  onChange={(e) => updateSetting('cloudBucket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Retention (days)</label>
                <input
                  type="number"
                  value={settings.maxRetention}
                  onChange={(e) => updateSetting('maxRetention', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Email</label>
                <input
                  type="email"
                  value={settings.alertEmail}
                  onChange={(e) => updateSetting('alertEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bandwidth Limit (MB/s)</label>
                <input
                  type="number"
                  value={settings.bandwidthLimit}
                  onChange={(e) => updateSetting('bandwidthLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parallel Jobs</label>
                <input
                  type="number"
                  value={settings.parallelJobs}
                  onChange={(e) => updateSetting('parallelJobs', parseInt(e.target.value))}
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                  <p className="text-xs text-gray-500">Automatically run scheduled backups</p>
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
                  <label className="text-sm font-medium text-gray-700">Compression</label>
                  <p className="text-xs text-gray-500">Compress backup files to save space</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.compression}
                  onChange={(e) => updateSetting('compression', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Encryption</label>
                  <p className="text-xs text-gray-500">Encrypt backup files for security</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.encryption}
                  onChange={(e) => updateSetting('encryption', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Verify Backups</label>
                  <p className="text-xs text-gray-500">Automatically verify backup integrity</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.verifyBackups}
                  onChange={(e) => updateSetting('verifyBackups', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Alert on Failure</label>
                  <p className="text-xs text-gray-500">Send email alerts when backups fail</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alertOnFailure}
                  onChange={(e) => updateSetting('alertOnFailure', e.target.checked)}
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

export default BackupSettings;