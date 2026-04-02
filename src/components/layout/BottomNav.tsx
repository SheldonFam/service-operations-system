import { NavLink } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/orders', label: 'Jobs', icon: ClipboardList },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
