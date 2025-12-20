"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, ArrowUpRight, ArrowDownRight, History, Mail, Phone, User, Bell, Home, Settings } from "lucide-react"
import { defaultStudents } from "@/lib/students"

export default function UserDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

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

  const getTotalDeposited = () => {
    return userData?.transactions?.reduce((sum: number, t: any) => t.type === 'deposit' ? sum + t.amount : sum, 0) || 0
  }

  const getTotalWithdrawn = () => {
    return userData?.transactions?.reduce((sum: number, t: any) => t.type === 'withdraw' ? sum + t.amount : sum, 0) || 0
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Morning"
    if (hour < 18) return "Afternoon"
    return "Evening"
  }

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
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Greeting Section with Notification */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#4a6670] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userData.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#171532]">{getGreeting()}, {userData.name}!</h1>
              <p className="text-xs text-[#747384]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <button className="p-3 hover:bg-[#f0f0f0] rounded-full transition-colors">
            <Bell className="w-6 h-6 text-[#4a6670]" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-2xl p-6 text-white shadow-lg border border-[#5a7680]/50 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Total Balance</p>
              <p className="text-5xl font-bold">₹{userData.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
                <p className="text-white/70 text-sm">Deposited</p>
              </div>
              <p className="text-2xl font-bold text-white">₹{getTotalDeposited().toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />
                <p className="text-white/70 text-sm">Withdrawn</p>
              </div>
              <p className="text-2xl font-bold text-white">₹{getTotalWithdrawn().toFixed(2)}</p>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-around">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-colors ${activeTab === "home" ? "bg-[#c17f59] text-white" : "text-[#747384] hover:text-[#4a6670]"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-colors ${activeTab === "accounts" ? "bg-[#c17f59] text-white" : "text-[#747384] hover:text-[#4a6670]"}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-semibold">Accounts</span>
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-colors ${activeTab === "profile" ? "bg-[#c17f59] text-white" : "text-[#747384] hover:text-[#4a6670]"}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
