"use client"

import { useState, useEffect } from 'react'
import { Download, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true) // Force visibility initially for testing
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false)
    }

    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Show the UI
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleCancel = () => {
    setIsVisible(false)
  }

  if (!mounted || !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40 backdrop-blur-sm p-4 sm:justify-center">
      <div className="w-full max-w-[280px] bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300">
        <div className="w-16 h-16 bg-[#f0f4f8] dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
          <Download className="w-8 h-8 text-[#4a6670] dark:text-slate-300" />
        </div>

        <h2 className="text-xl font-bold text-[#171532] dark:text-white mb-2 text-center">
          Install JDSA Bank
        </h2>
        
        <p className="text-sm text-[#71717a] dark:text-slate-400 text-center mb-6 leading-snug">
          Download our app to your home screen for quick and easy access to your account.
        </p>

        <div className="w-full space-y-2">
          <Button 
            onClick={handleInstallClick}
            className="w-full h-11 bg-[#4a6670] hover:bg-[#3d565e] text-white text-base font-semibold rounded-xl shadow-md transition-all"
          >
            Download App
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="ghost"
            className="w-full h-10 text-[#71717a] dark:text-slate-400 text-base font-semibold rounded-xl hover:bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      {/* Bottom Bar mimic from screenshot */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="w-full h-12 bg-[#171532] rounded-xl flex items-center justify-center gap-2 text-white text-sm font-medium cursor-pointer" onClick={handleCancel}>
          Find Your Account <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}
