'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Users,
  Box,
  Wallet,
  Image,
  UserCircle,
  Link2,
  ArrowLeftRight,
  Globe,
  Search,
  Star,
  KeyRound,
  Settings,
  TestTube,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/avatars', label: 'Avatars', icon: Users },
  { href: '/holons', label: 'Holons', icon: Box },
  { href: '/wallets', label: 'Wallets', icon: Wallet },
  { href: '/nfts', label: 'NFTs', icon: Image },
  { href: '/avatar-nfts', label: 'Avatar NFTs', icon: UserCircle },
  { href: '/blockchain', label: 'Blockchain', icon: Link2 },
  { href: '/swap', label: 'Swap', icon: ArrowLeftRight },
  { href: '/bridge', label: 'Bridge', icon: Globe },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/quests', label: 'Quests', icon: Star },
  { href: '/star-odk', label: 'Star ODK', icon: Star },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/tests', label: 'Tests', icon: TestTube },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r border-border bg-card">
      <div className="flex h-14 items-center px-4 font-bold text-lg">
        OASIS Sleek
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <NavLinks />
      </ScrollArea>
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium hover:bg-accent md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetTitle className="flex h-14 items-center px-4 font-bold text-lg">
          OASIS Sleek
        </SheetTitle>
        <Separator />
        <ScrollArea className="flex-1 py-2">
          <NavLinks onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
