"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, CreditCard, MoreHorizontal, Send, Receipt, Banknote, QrCode, Bell, Grid3X3 } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthenticated")
    const role = localStorage.getItem("userRole")
    if (auth !== "true" || role !== "admin") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  const recentUsers = [
    { name: "Jam Vana", account: "1234-0987-123", color: "bg-orange-100" },
    { name: "Smart", account: "098-123-456", color: "bg-red-100" },
    { name: "Sovannaphum", account: "123-123-456", color: "bg-yellow-100" },
    { name: "Smart", account: "098-123-456", color: "bg-red-100" },
  ]

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a6670] to-[#3d565e] flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#171532]">Morning, Admin!</h1>
              <p className="text-xs text-[#747384]">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#4a6670]" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-[#747384]">Account Name</p>
                <div className="w-4 h-4 rounded-full bg-[#e5e7eb] flex items-center justify-center">
                  <span className="text-[8px]">●</span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#171532] mb-3">1234-5678-90</p>
              <div className="inline-block px-3 py-1 bg-[#4a6670] rounded-full">
                <span className="text-xs text-white font-medium">Primary</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-14 h-14 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-[#4a6670]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18.5 7h-13L12 4.5zM4 10v9h3v-7h2v7h2v-7h2v7h2v-7h2v7h3v-9H4zm-2 11v2h20v-2H2z"/>
                </svg>
              </div>
              <p className="text-xs text-[#747384]">Available Balance</p>
              <p className="text-2xl font-bold text-[#171532]">$2,749.00</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#171532]">Services</h2>
          <button className="text-[#747384]">
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-[#4a6670]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Transfer</span>
          </button>
          
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-[#4a6670]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Payment</span>
          </button>
          
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <Banknote className="w-6 h-6 text-[#4a6670]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Withdraw</span>
          </button>
          
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6 text-[#4a6670]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Scan Pay</span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
          <div className="w-6 h-2 rounded-full bg-[#4a6670]"></div>
          <div className="w-2 h-2 rounded-full bg-[#c9c9ce]"></div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#171532] mb-4">Recent</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentUsers.map((user, index) => (
              <div key={index} className="flex flex-col items-center min-w-[70px]">
                <div className={`w-14 h-14 rounded-full ${user.color} flex items-center justify-center mb-2 text-lg font-bold text-[#4a6670]`}>
                  {user.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-[#171532] text-center truncate w-full">{user.name}</p>
                <p className="text-[10px] text-[#747384] text-center">{user.account}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-20 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <div className="max-w-md mx-auto bg-gradient-to-r from-[#e8f4f8] to-[#d4eef5] rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === "home"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === "accounts"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Accounts</span>
          </button>
          
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === "cards"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Cards</span>
          </button>
          
          <button
            onClick={() => setActiveTab("more")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === "more"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  )
}
