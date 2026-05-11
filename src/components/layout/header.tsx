'use client'

import { useOasis } from '@/lib/oasis-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogOut, ChevronDown } from 'lucide-react'
import { MobileSidebar } from './sidebar'

interface HeaderProps {
  chain: string
  onChainChange: (chain: string) => void
}

export function Header({ chain, onChainChange }: HeaderProps) {
  const { user, logout, defaultWallet } = useOasis()

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      <MobileSidebar />

      <div className="flex-1" />

      <Select value={chain} onValueChange={(v) => { if (v) onChainChange(v) }}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="algorand">Algorand</SelectItem>
          <SelectItem value="solana">Solana</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
          <Avatar size="sm">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">
            {user?.username ?? 'User'}
          </span>
          {defaultWallet && (
            <span className="hidden lg:inline text-xs text-muted-foreground font-mono">
              {defaultWallet.address.slice(0, 6)}…{defaultWallet.address.slice(-4)}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
