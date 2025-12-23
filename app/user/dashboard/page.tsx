"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"

export default function UserDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const loadUserData = async () => {
    try {
      const auth = localStorage.getItem("isUserAuthenticated")
      const role = localStorage.getItem("userRole")
      const studentId = localStorage.getItem("studentId")
      
      if (auth !== "true" || !studentId) {
        router.push("/login")
        return
      }

      if (role === "admin") {
        router.push("/admin/dashboard")
        return
      }

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      })
      
      if (!res.ok) {
        console.error("Failed to fetch student:", res.status)
        return
      }
      
      const student = await res.json()
      setUserData({
        id: student._id,
        name: student.name || "User",
        code: student.code || "NA-0000",
        balance: student.balance || 0,
      })
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  // Refresh data every 2 seconds to get real-time balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserData()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isUserAuthenticated")
    localStorage.removeItem("userRole")
    localStorage.removeItem("studentId")
    router.push("/login")
  }

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#4a6670] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#747384]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-6">
          <h1 className="text-2xl font-bold text-[#171532]">Dashboard</h1>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-[#4a6670]" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-[#171532] text-center">{userData?.name || 'User'}</h2>
            <p className="text-sm text-[#747384]">Code: {userData?.code || 'NA-0000'}</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl p-5 mb-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/70 text-sm font-medium">Total Balance</p>
            </div>
            <p className="text-3xl font-bold text-white">₹{(userData?.balance || 0)?.toFixed(2)}</p>
          </div>

          {/* Profile Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
              <User className="w-5 h-5 text-[#4a6670]" />
              <div>
                <p className="text-xs text-[#747384]">Full Name</p>
                <p className="font-semibold text-[#171532]">{userData?.name || 'User'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-in scale-in duration-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-bold text-[#171532]">Logout</h3>
              </div>
              
              <div className="px-6 py-6">
                <p className="text-[#747384] mb-6">Are you sure you want to logout?</p>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-[#f8f9fa] hover:bg-[#f0f0f0] text-[#171532] rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
