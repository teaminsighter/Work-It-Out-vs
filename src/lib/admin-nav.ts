import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  TestTube2,
  Presentation,
  Plug,
  FileJson,
  BrainCircuit,
  Settings,
  UserCircle,
  CreditCard,
  Building,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  subitems?: NavItem[];
}

export const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Leads Management',
    href: '/admin/leads',
    icon: Users,
    subitems: [
      { label: 'All Leads', href: '/admin/leads/all', icon: Users },
      { label: 'Repeat Leads', href: '/admin/leads/repeat', icon: Users },
      { label: 'Lead Analytics', href: '/admin/leads/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    subitems: [
      { label: 'User Journey', href: '/admin/analytics/journey', icon: BarChart3 },
      { label: 'Form Analytics', href: '/admin/analytics/forms', icon: FileText },
      { label: 'Event Tracking', href: '/admin/analytics/events', icon: BarChart3 },
    ],
  },
  {
    label: 'Pages & Forms',
    href: '/admin/pages',
    icon: FileText,
    subitems: [
      { label: 'Landing Pages', href: '/admin/pages/landing', icon: FileText },
      { label: 'Forms Builder', href: '/admin/pages/forms', icon: FileText },
      { label: 'A/B Tests', href: '/admin/pages/ab-tests', icon: TestTube2 },
    ],
  },
  {
    label: 'Marketing',
    href: '/admin/marketing',
    icon: Presentation,
    subitems: [
      { label: 'Campaigns', href: '/admin/marketing/campaigns', icon: Presentation },
      { label: 'Attribution', href: '/admin/marketing/attribution', icon: Presentation },
      { label: 'ROI Calculator', href: '/admin/marketing/roi', icon: Presentation },
    ],
  },
    {
    label: 'Integrations',
    href: '/admin/integrations',
    icon: Plug,
    subitems: [
      { label: 'Connections', href: '/admin/integrations/connections', icon: Plug },
      { label: 'API & Webhooks', href: '/admin/integrations/api', icon: Plug },
      { label: 'GTM Templates', href: '/admin/integrations/gtm', icon: FileJson },
    ],
  },
  {
    label: 'AI Assistant',
    href: '/admin/ai-assistant',
    icon: BrainCircuit,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    subitems: [
      { label: 'Users & Teams', href: '/admin/settings/users', icon: UserCircle },
      { label: 'Permissions', href: '/admin/settings/permissions', icon: UserCircle },
      { label: 'Billing', href: '/admin/settings/billing', icon: CreditCard },
      { label: 'Company', href: '/admin/settings/company', icon: Building },
    ],
  },
];
