"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleInitialize = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/init-from-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `✓ Admin account initialized successfully! Username: ${data.admin.username}`
        })
        setTimeout(() => {
          router.push('/admin-login')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: `Error: ${data.error || 'Failed to initialize admin'}`
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e8e8eb] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-[#171532] mb-2">Admin Setup</h1>
        <p className="text-[#747384] mb-8">Initialize your admin account</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-900">
            This will create or update the admin account using the credentials stored in your environment secrets (ADMIN_USERNAME and ADMIN_PASSWORD).
          </p>
        </div>

        {message && (
          <div className={`rounded-xl p-4 mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors mb-4"
        >
          {loading ? 'Initializing...' : 'Initialize Admin Account'}
        </button>

        <p className="text-xs text-center text-[#747384]">
          After initialization, you'll be redirected to the admin login page.
        </p>
      </div>
    </div>
  )
}
