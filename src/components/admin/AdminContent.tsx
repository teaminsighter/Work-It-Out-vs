'use client';

import { adminCategories } from './AdminDashboard';
import PermissionWrapper from './PermissionWrapper';

interface AdminContentProps {
  activeCategory: string;
  activeTab: string;
  userId?: string;
}

const AdminContent = ({ activeCategory, activeTab, userId }: AdminContentProps) => {
  const currentCategory = adminCategories.find(cat => cat.id === activeCategory);
  const currentTab = currentCategory?.tabs.find(tab => tab.id === activeTab);

  if (!currentTab) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Content not found</div>
      </div>
    );
  }

  const TabComponent = currentTab.component;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <PermissionWrapper 
        categoryId={activeCategory} 
        tabId={activeTab} 
        userId={userId}
      >
        <TabComponent />
      </PermissionWrapper>
    </div>
  );
};

export default AdminContent;