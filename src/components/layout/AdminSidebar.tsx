import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { LayoutDashboard, ClipboardList, PlusCircle } from 'lucide-react'

const APP_VERSION = __APP_VERSION__

export function AdminSidebar() {
  const { role } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeOnNav = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {role === 'manager' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    onClick={closeOnNav}
                    className={({ isActive }) => (isActive ? 'bg-sidebar-accent' : '')}
                  >
                    <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/orders"
                  end
                  onClick={closeOnNav}
                  className={({ isActive }) => (isActive ? 'bg-sidebar-accent' : '')}
                >
                  <ClipboardList aria-hidden="true" className="h-4 w-4" />
                  <span>Orders</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {role === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/orders/new"
                    onClick={closeOnNav}
                    className={({ isActive }) => (isActive ? 'bg-sidebar-accent' : '')}
                  >
                    <PlusCircle aria-hidden="true" className="h-4 w-4" />
                    <span>New Order</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-4 pb-2 text-xs text-muted-foreground">Sejuk Sejuk Service v{APP_VERSION}</p>
      </SidebarFooter>
    </Sidebar>
  )
}
