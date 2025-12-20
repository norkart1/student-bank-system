"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, TrendingUp, LogOut, ArrowUpRight, ArrowDownRight, History, Mail, Phone, User } from "lucide-react"
import { defaultStudents } from "@/lib/students"

export default function UserDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem("isUserAuthenticated")
    const role = localStorage.getItem("userRole")
    
    if (auth !== "true") {
      router.push("/login")
      return
    }

    setIsAuthenticated(true)

    try {
      if (role === "student") {
        const studentId = localStorage.getItem("studentId")
        const student = studentId ? defaultStudents.find((s) => s.id === studentId) : null
        
        setUserData({
          id: student?.id || studentId || "unknown",
          name: student?.name || "Student",
          username: student?.username || "student",
          email: student?.email || "Not set",
          mobile: student?.mobile || "Not set",
          balance: student?.balance || 0,
          transactions: student?.transactions || [],
        })
      } else if (role === "custom") {
        const customAccountId = localStorage.getItem("customAccountId")
        const customUsername = localStorage.getItem("customUsername")
        
        const customAccounts = JSON.parse(localStorage.getItem("customAccounts") || "[]")
        const account = customAccounts.find((acc: any) => acc.id === customAccountId)
        
        setUserData({
          id: account?.id || customAccountId || "unknown",
          name: customUsername || "User",
          username: customUsername || "user",
          email: "Not set",
          mobile: "Not set",
          balance: account?.balance || 0,
          transactions: account?.transactions || [],
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setUserData({
        name: "User",
        username: "user",
        email: "Not set",
        mobile: "Not set",
        balance: 0,
        transactions: [],
      })
    }
    
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isUserAuthenticated")
    localStorage.removeItem("userRole")
    localStorage.removeItem("studentId")
    localStorage.removeItem("studentName")
    localStorage.removeItem("customAccountId")
    localStorage.removeItem("customUsername")
    router.push("/login")
  }

  if (!isAuthenticated || isLoading) {
    return null
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#747384] mb-4">Loading your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-[#4a6670] to-[#3d565e] text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">JDSA Students Bank</h1>
                <p className="text-xs text-white/70">Welcome, {userData.name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-gradient-to-r from-[#4a6670] to-[#3d565e] rounded-2xl p-6 text-white shadow-lg border border-[#5a7680]/50">
            <p className="text-white/70 text-sm font-medium mb-2">Current Balance</p>
            <p className="text-5xl font-bold mb-6">₹{userData.balance?.toFixed(2) || "0.00"}</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-semibold gap-2 flex items-center justify-center transition-colors">
                <ArrowDownRight className="w-4 h-4" />
                Deposit
              </button>
              <button className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-semibold gap-2 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[#e5e7eb]">
              <History className="w-5 h-5 text-[#4a6670]" />
              <h3 className="font-bold text-[#171532]">Activity</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-[#171532]">{userData.transactions?.length || 0}</p>
              <p className="text-xs text-[#747384] mt-1">Total transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e5e7eb] mb-4">
            <User className="w-5 h-5 text-[#4a6670]" />
            <h2 className="text-lg font-bold text-[#171532]">Personal Information</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#747384] uppercase tracking-wide font-semibold mb-2">Full Name</p>
              <p className="text-lg font-bold text-[#171532]">{userData.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#747384] uppercase tracking-wide font-semibold mb-2">Username</p>
              <p className="text-lg font-bold text-[#171532]">@{userData.username}</p>
            </div>
            <div>
              <p className="text-xs text-[#747384] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="text-lg font-bold text-[#171532]">{userData.email || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-[#747384] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Mobile
              </p>
              <p className="text-lg font-bold text-[#171532]">{userData.mobile || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[#e5e7eb]">
              <TrendingUp className="w-5 h-5 text-[#4a6670]" />
              <h3 className="font-bold text-[#171532]">Status</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-[#10B981]">Active</p>
              <p className="text-xs text-[#747384] mt-1">Account in good standing</p>
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[#e5e7eb]">
              <Wallet className="w-5 h-5 text-[#4a6670]" />
              <h3 className="font-bold text-[#171532]">Balance</h3>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-[#10B981]">₹{userData.balance?.toFixed(2) || "0.00"}</p>
              <p className="text-xs text-[#747384] mt-1">Current balance</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-bold text-[#171532]">Recent Transactions</h2>
            <p className="text-xs text-[#747384] mt-1">Your latest account activity</p>
          </div>
          <div className="px-6 py-4">
            {userData.transactions && userData.transactions.length > 0 ? (
              <div className="space-y-3">
                {userData.transactions.slice(-5).reverse().map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb] hover:border-[#4a6670] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'deposit' ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                        {t.type === 'deposit' ? (
                          <ArrowDownRight className="w-5 h-5 text-[#10B981]" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-[#EF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#171532] capitalize">{t.type}</p>
                        <p className="text-xs text-[#747384]">{t.date || 'Recent'}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${t.type === 'deposit' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {t.type === 'deposit' ? '+' : '-'}₹{t.amount?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#747384]">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
