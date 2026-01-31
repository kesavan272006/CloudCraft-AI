import {
  LayoutDashboard,
  Brain,
  Hammer,
  Image as ImageIcon,
  CalendarDays,
  Radar,
  LineChart,
  Sparkles,
  Settings,
  HelpCircle,
} from 'lucide-react'

// Note: If red lines persist on the 'export', change this to: 
// export const sidebarData: any = {
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Kesavan G',
    email: 'kesavan@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'CloudCraft AI',
      logo: Sparkles,
      plan: 'AI for Bharat 2025',
    },
  ],
  navGroups: [
    {
      title: 'Core Workspace',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Brand Brain',
          url: '/brand_brain',
          icon: Brain,
        },
        {
          title: 'The Forge',
          url: '/forge',
          icon: Hammer,
        },
        {
          title: 'Vision Lab',
          url: '/vision-lab',
          icon: ImageIcon,
        },
      ],
    },
    {
      title: 'Planning & Growth',
      items: [
        {
          title: 'Campaign Architect',
          url: '/campaign-architect',
          icon: CalendarDays,
        },
        {
          title: 'Competitor Pulse',
          url: '/competitor-pulse',
          icon: Radar,
        },
        {
          title: 'Performance Oracle',
          url: '/performance-oracle',
          icon: LineChart,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
          // If 'items' causes red lines here, your template's SidebarData
          // does not support nested dropdowns. 
          items: [
            {
              title: 'Profile',
              url: '/settings/profile',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
            },
            {
              title: 'API Keys',
              url: '/settings/api-keys',
            },
          ],
        },
        {
          title: 'Help & Feedback',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}