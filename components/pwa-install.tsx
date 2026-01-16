"use client"

import { useState, useEffect } from 'react'
import { Download, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI notify the user they can add to home screen
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false)
    }

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40 backdrop-blur-sm p-6 sm:justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-[40px] p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300">
        <div className="w-20 h-20 bg-[#f0f4f8] dark:bg-slate-700 rounded-3xl flex items-center justify-center mb-6">
          <Download className="w-10 h-10 text-[#4a6670] dark:text-slate-300" />
        </div>

        <h2 className="text-2xl font-bold text-[#171532] dark:text-white mb-3 text-center">
          Install JDSA Bank
        </h2>
        
        <p className="text-[#71717a] dark:text-slate-400 text-center mb-8 leading-relaxed">
          Download our app to your home screen for quick and easy access to your account.
        </p>

        <div className="w-full space-y-3">
          <Button 
            onClick={handleInstallClick}
            className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all"
          >
            Download App
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="ghost"
            className="w-full h-14 text-[#71717a] dark:text-slate-400 text-lg font-semibold rounded-2xl hover:bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      {/* Bottom Bar mimic from screenshot */}
      <div className="w-full max-w-sm mt-4">
        <div className="w-full h-16 bg-[#171532] rounded-2xl flex items-center justify-center gap-2 text-white font-medium cursor-pointer" onClick={handleCancel}>
          Find Your Account <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
