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
  Radio,
  Layers,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  // We leave this empty or with placeholders; the component will override this
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: 'CloudCraft AI',
      logo: Sparkles,
      plan: 'AI for Bharat 2026',
    },
  ],
  navGroups: [
    {
      title: 'Core Workspace',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
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
        {
          title: 'Local Scout',
          url: '/local-scout',
          icon: Radio,
        },
      ],
    },
    {
      title: 'Planning & Growth',
      items: [
        {
          title: 'Campaign Architect',
          url: '/campaign-architect',
          icon: Layers,
        },
        {
          title: 'Campaign Calendar',
          url: '/calendar',
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
          icon: Settings,
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