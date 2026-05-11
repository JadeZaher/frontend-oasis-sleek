'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOasisAuth } from '@/lib/oasis-auth'

export default function Home() {
  const { isAuthenticated, loading } = useOasisAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(isAuthenticated ? '/overview' : '/login')
    }
  }, [loading, isAuthenticated, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
