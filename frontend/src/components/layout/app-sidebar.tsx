import { useEffect } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  
  // 1. Grab the auth object from the store
  const { user } = useAuthStore((state) => state.auth)

  // DEBUG: Check your browser console (F12) to see if this data is actually there
  useEffect(() => {
    console.log('Sidebar Auth Check:', user)
  }, [user])

  // 2. Prepare the dynamic user object
  const dynamicUser = {
    // Priority: Store Name -> Sliced Email -> Fallback
    name: user?.name || (user?.email ? user.email.split('@')[0] : 'Cloud Crafter'),
    email: user?.email || 'not-signed-in@cloudcraft.ai',
    avatar: user?.avatar || '/avatars/default.jpg',
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        {/* Pass the dynamic user object here */}
        <NavUser user={dynamicUser} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}