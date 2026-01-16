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
    if (!deferredPrompt) {
      // For some browsers, we can try to use the navigator.install() if available (experimental)
      // but generally, we need the event.
      alert('To install JDSA Bank, please tap the browser menu (three dots) and select "Add to Home Screen" or "Install App".')
      return
    }

    // Show the prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleCancel = () => {
    setIsVisible(false)
  }

  if (!mounted || !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-6">
      <div className="w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-100/50 dark:ring-slate-800/10">
          <Download className="w-6 h-6 text-[#4a6670]" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
          Install JDSA Bank
        </h2>
        
        <p className="text-[14px] text-slate-500 dark:text-slate-400 text-center mb-8 leading-snug px-2">
          Download our app to your home screen for quick and easy access to your account.
        </p>

        <div className="w-full flex gap-3">
          <Button 
            onClick={handleCancel}
            variant="ghost"
            className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl transition-all"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleInstallClick}
            className="flex-1 h-12 bg-[#4a6670] hover:bg-[#3d565e] text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
