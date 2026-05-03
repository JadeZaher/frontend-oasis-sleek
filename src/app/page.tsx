'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper').then(mod => ({ default: mod.AuthWrapper })), {
  ssr: false,
})

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedChain, setSelectedChain] = useState('algorand')
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  const handleAuthSuccess = () => {
    setActiveTab('dashboard')
  }

  return (
    <AuthWrapper
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
      showAuthModal={showAuthModal}
      setShowAuthModal={setShowAuthModal}
      onAuthSuccess={handleAuthSuccess}
    />
  )
}