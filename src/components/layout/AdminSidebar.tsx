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
} from '@/components/ui/sidebar'
import { LayoutDashboard, ClipboardList, PlusCircle } from 'lucide-react'

export function AdminSidebar() {
  const { role } = useAuth()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive ? 'bg-sidebar-accent' : ''
                  }
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/orders"
                  end
                  className={({ isActive }) =>
                    isActive ? 'bg-sidebar-accent' : ''
                  }
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Orders</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {role === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/orders/new"
                    className={({ isActive }) =>
                      isActive ? 'bg-sidebar-accent' : ''
                    }
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>New Order</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-4 pb-2 text-xs text-muted-foreground">
          Sejuk Sejuk Service v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
