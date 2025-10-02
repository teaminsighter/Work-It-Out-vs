'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye,
  Edit,
  Trash2,
  Download,
  Users,
  Crown,
  UserCheck,
  Settings,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  Save,
  AlertTriangle,
  Plus,
  BarChart3,
  CreditCard,
  Layout,
  Activity,
  Brain,
  Link,
  User,
  Database
} from 'lucide-react';
import { capitalizeStatus, capitalizeAction, capitalizeWords } from '@/utils/textUtils';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  isActive: boolean;
  permissions: UserPermission[];
}

interface UserPermission {
  id: string;
  categoryId: string;
  tabId: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

interface AdminCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tabs: AdminTab[];
}

interface AdminTab {
  id: string;
  name: string;
}

const Permissions = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Record<string, UserPermission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Define admin categories and tabs (same as AdminDashboard)
  const adminCategories: AdminCategory[] = [
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      tabs: [
        { id: 'overview', name: 'Overview' },
        { id: 'steps', name: 'Step Analytics' },
        { id: 'forms', name: 'Form Analysis' },
        { id: 'leads', name: 'Lead Analysis' },
        { id: 'marketing', name: 'Marketing Analysis' },
        { id: 'realtime', name: 'Real-time Tracking' },
        { id: 'visitors', name: 'Visitor Tracking' }
      ]
    },
    {
      id: 'lead-management',
      name: 'CRM',
      icon: <Users className="w-5 h-5" />,
      tabs: [
        { id: 'all-leads', name: 'All Leads' },
        { id: 'lead-analysis', name: 'Lead Analysis' },
        { id: 'visitor-analysis', name: 'Visitor Analysis' },
        { id: 'duplicates', name: 'Duplicate Analysis' },
        { id: 'reports', name: 'Export/Reports' }
      ]
    },
    {
      id: 'page-builder',
      name: 'Page Builder',
      icon: <Layout className="w-5 h-5" />,
      tabs: [
        { id: 'landing-pages', name: 'Landing Pages' },
        { id: 'forms', name: 'Forms' },
        { id: 'templates', name: 'Templates' },
        { id: 'ab-testing', name: 'A/B Testing' }
      ]
    },
    {
      id: 'tracking',
      name: 'Tracking Setup',
      icon: <Activity className="w-5 h-5" />,
      tabs: [
        { id: 'datalayer', name: 'DataLayer Events' },
        { id: 'gtm-config', name: 'GTM Config' },
        { id: 'integrations', name: 'Platform Integrations' },
        { id: 'conversion-api', name: 'Conversion API' }
      ]
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      icon: <Brain className="w-5 h-5" />,
      tabs: [
        { id: 'chatbot', name: 'Chatbot Query' },
        { id: 'auto-reports', name: 'Auto Reports' },
        { id: 'recommendations', name: 'Recommendations' },
        { id: 'alerts', name: 'Performance Alerts' }
      ]
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: <Link className="w-5 h-5" />,
      tabs: [
        { id: 'google-ads', name: 'Google Ads' },
        { id: 'facebook-ads', name: 'Facebook Ads' },
        { id: 'ga4', name: 'GA4' },
        { id: 'webhooks', name: 'Webhooks/APIs' }
      ]
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: <User className="w-5 h-5" />,
      tabs: [
        { id: 'profile', name: 'My Profile' },
        { id: 'admin-users', name: 'Manage Users' },
        { id: 'permissions', name: 'Permissions' },
        { id: 'activity-logs', name: 'Activity Logs' }
      ]
    },
    {
      id: 'system',
      name: 'System Settings',
      icon: <Settings className="w-5 h-5" />,
      tabs: [
        { id: 'general', name: 'General Settings' },
        { id: 'api-config', name: 'API Configuration' },
        { id: 'solar-pricing', name: 'Solar Pricing' },
        { id: 'database', name: 'Database Settings' },
        { id: 'backup', name: 'Backup Settings' }
      ]
    }
  ];

  useEffect(() => {
    loadUsers();
    initializePermissionTemplates();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  const initializePermissionTemplates = async () => {
    try {
      await fetch('/api/admin/permissions/templates', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to initialize permission templates:', error);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/permissions');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        if (data.data.users.length > 0 && !selectedUser) {
          setSelectedUser(data.data.users[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    setIsLoading(false);
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/permissions?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const permissionMap: Record<string, UserPermission> = {};
        data.data.permissions.forEach((perm: UserPermission) => {
          const key = `${perm.categoryId}.${perm.tabId}`;
          permissionMap[key] = perm;
        });
        setPermissions(permissionMap);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  };

  const applyRoleTemplate = async (userId: string, role: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role,
          grantedBy: 'current-admin-user' // In real app, get from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadUsers();
        if (selectedUser?.id === userId) {
          await loadUserPermissions(userId);
        }
      }
    } catch (error) {
      console.error('Failed to apply role template:', error);
    }
    setIsSaving(false);
  };

  const updatePermission = (categoryId: string, tabId: string, field: keyof UserPermission, value: boolean) => {
    const key = `${categoryId}.${tabId}`;
    const existingPerm = permissions[key] || {
      id: '',
      categoryId,
      tabId,
      canView: false,
      canEdit: false,
      canDelete: false,
      canExport: false
    };

    setPermissions(prev => ({
      ...prev,
      [key]: {
        ...existingPerm,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const permissionsArray = Object.values(permissions).filter(perm => 
        perm.canView || perm.canEdit || perm.canDelete || perm.canExport
      );

      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          permissions: permissionsArray,
          grantedBy: 'current-admin-user' // In real app, get from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        await loadUsers();
        await loadUserPermissions(selectedUser.id);
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
    setIsSaving(false);
  };

  const getPermission = (categoryId: string, tabId: string) => {
    const key = `${categoryId}.${tabId}`;
    return permissions[key] || {
      id: '',
      categoryId,
      tabId,
      canView: false,
      canEdit: false,
      canDelete: false,
      canExport: false
    };
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'VIEWER': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading permissions...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user access to admin dashboard tabs</p>
        </div>
        
        {hasChanges && selectedUser && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={savePermissions}
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? capitalizeAction('saving') + '...' : capitalizeAction('save') + ' Changes'}
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>

          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedUser?.id === user.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
          {selectedUser ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Permissions for {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                    
                    {/* Quick Role Templates */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500">{capitalizeAction('apply')} template:</span>
                      <button
                        onClick={() => applyRoleTemplate(selectedUser.id, 'VIEWER')}
                        disabled={isSaving}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        {capitalizeWords('viewer')}
                      </button>
                      <button
                        onClick={() => applyRoleTemplate(selectedUser.id, 'MEMBER')}
                        disabled={isSaving}
                        className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
                      >
                        {capitalizeWords('member')}
                      </button>
                      <button
                        onClick={() => applyRoleTemplate(selectedUser.id, 'EDITOR')}
                        disabled={isSaving}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
                      >
                        {capitalizeWords('editor')}
                      </button>
                      <button
                        onClick={() => applyRoleTemplate(selectedUser.id, 'ADMIN')}
                        disabled={isSaving}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        {capitalizeWords('admin')}
                      </button>
                      <button
                        onClick={() => applyRoleTemplate(selectedUser.id, 'SUPER_ADMIN')}
                        disabled={isSaving}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
                      >
                        {capitalizeWords('super admin')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category & Tab</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" />
                            {capitalizeAction('view')}
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center justify-center gap-1">
                            <Edit className="w-4 h-4" />
                            {capitalizeAction('edit')}
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center justify-center gap-1">
                            <Trash2 className="w-4 h-4" />
                            {capitalizeAction('delete')}
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <div className="flex items-center justify-center gap-1">
                            <Download className="w-4 h-4" />
                            {capitalizeAction('export')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCategories.map((category) => (
                        <React.Fragment key={category.id}>
                          {/* Category Header */}
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="py-3 px-4">
                              <div className="flex items-center gap-2 font-medium text-gray-900">
                                {category.icon}
                                {category.name}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Category Tabs */}
                          {category.tabs.map((tab) => {
                            const perm = getPermission(category.id, tab.id);
                            return (
                              <tr key={`${category.id}.${tab.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 pl-8">
                                  <span className="text-gray-700">{tab.name}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={perm.canView}
                                    onChange={(e) => updatePermission(category.id, tab.id, 'canView', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={perm.canEdit}
                                    onChange={(e) => updatePermission(category.id, tab.id, 'canEdit', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={perm.canDelete}
                                    onChange={(e) => updatePermission(category.id, tab.id, 'canDelete', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={perm.canExport}
                                    onChange={(e) => updatePermission(category.id, tab.id, 'canExport', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasChanges && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">You have unsaved changes</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Click "Save Changes" to apply the new permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a user to manage their permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permissions;