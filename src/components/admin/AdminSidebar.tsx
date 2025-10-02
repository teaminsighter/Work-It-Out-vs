'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { adminCategories } from './AdminDashboard';
import { usePermissions } from '@/hooks/usePermissions';

interface AdminSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userId?: string;
}

const AdminSidebar = ({ 
  activeCategory, 
  onCategoryChange, 
  collapsed, 
  onToggleCollapse,
  userId 
}: AdminSidebarProps) => {
  const { hasPermission } = usePermissions(userId);
  const [settings, setSettings] = useState<any>(null);

  // Load settings for custom colors
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Get colors from settings or use defaults
  const getColor = (colorType: string) => {
    if (!settings) return getDefaultColor(colorType);
    return settings[colorType] || getDefaultColor(colorType);
  };

  const getDefaultColor = (colorType: string) => {
    const defaults: { [key: string]: string } = {
      primaryColor: '#146443',
      navbarColor: '#1F2937',
      buttonColor: '#146443',
      secondaryColor: '#10B981'
    };
    return defaults[colorType] || '#146443';
  };

  // Filter categories based on user permissions
  const visibleCategories = process.env.NODE_ENV === 'development' 
    ? adminCategories // Show all categories in development mode
    : adminCategories.filter(category => {
        // For now, check if user has view permission for at least one tab in the category
        return category.tabs.some(tab => hasPermission(category.id, tab.id, 'view'));
      });
  return (
    <motion.div
      className="text-white flex flex-col shadow-xl"
      style={{ backgroundColor: getColor('navbarColor') }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-white">
                {settings?.companyName || 'Work It Out'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">{settings?.adminPanelName || 'Admin Panel'}</p>
            </motion.div>
          )}
          
          <motion.button
            onClick={onToggleCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-2 px-3">
          {visibleCategories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                activeCategory === category.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={activeCategory === category.id ? 
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' } : 
                {}
              }
              onMouseEnter={(e) => {
                if (activeCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className={`flex-shrink-0 ${activeCategory === category.id ? 'text-white' : 'text-gray-400'}`}>
                {category.icon}
              </div>
              
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium truncate">
                    {category.name}
                  </div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {category.tabs.length} sections
                  </div>
                </motion.div>
              )}
              
              {activeCategory === category.id && (
                <motion.div
                  className="w-1 h-8 bg-white rounded-full absolute right-0"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-gray-400">Super Admin</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;