"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, ArrowUpRight, ArrowDownRight, History, Mail, Phone, User, Bell, Home, Settings, ChevronLeft, Calendar, Calculator, AlertCircle, Headphones, MessageCircle, BarChart3, Sparkles, Send, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { defaultStudents } from "@/lib/students"

export default function UserDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>({
    id: "unknown",
    name: "User",
    username: "user",
    email: "Not set",
    mobile: "Not set",
    balance: 0,
    transactions: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [aiMessages, setAiMessages] = useState<Array<{role: string, text: string}>>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [calcDisplay, setCalcDisplay] = useState("0")
  const [calcExpression, setCalcExpression] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{role: string, text: string}>>([])
  const [chatInput, setChatInput] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [greeting, setGreeting] = useState("Good day")
  const [displayDate, setDisplayDate] = useState("")

  const loadUserData = () => {
    const auth = localStorage.getItem("isUserAuthenticated")
    const role = localStorage.getItem("userRole")
    
    if (auth !== "true") {
      router.push("/login")
      return
    }

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
        
        if (account) {
          setUserData({
            id: account?.id || customAccountId || "unknown",
            name: customUsername || "User",
            username: customUsername || "user",
            email: "Not set",
            mobile: "Not set",
            balance: account?.balance || 0,
            transactions: account?.transactions || [],
          })
        } else {
          setUserData({
            id: customAccountId || "unknown",
            name: customUsername || "User",
            username: customUsername || "user",
            email: "Not set",
            mobile: "Not set",
            balance: 0,
            transactions: [],
          })
        }
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
  }

  useEffect(() => {
    loadUserData()
    setIsAuthenticated(true)
    setIsLoading(false)

    // Set greeting and date to fix hydration mismatch
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Morning")
    } else if (hour < 18) {
      setGreeting("Afternoon")
    } else {
      setGreeting("Evening")
    }
    setDisplayDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))

    // Listen for storage changes to update balance in real-time
    const handleStorageChange = () => {
      loadUserData()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [router])

  // Refresh data every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserData()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

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

  const handleCalcInput = (value: string) => {
    if (value === "C") {
      setCalcDisplay("0")
      setCalcExpression("")
    } else if (value === "=") {
      try {
        const result = eval(calcExpression || calcDisplay)
        setCalcDisplay(String(result))
        setCalcExpression("")
      } catch {
        setCalcDisplay("Error")
      }
    } else if (["+", "-", "*", "/"].includes(value)) {
      setCalcExpression(calcDisplay + value)
      setCalcDisplay("0")
    } else {
      setCalcDisplay(calcDisplay === "0" ? value : calcDisplay + value)
    }
  }

  const handleSendAIMessage = async (message?: string) => {
    const msg = message || aiInput
    if (!msg.trim()) return
    setAiInput("")
    setAiMessages(prev => [...prev, { role: "user", text: msg }])
    setAiLoading(true)
    
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: msg,
          studentContext: `${userData.name} has balance ₹${userData.balance.toFixed(2)}`,
          adminName: userData.name
        })
      })
      const data = await response.json()
      setAiMessages(prev => [...prev, { role: "assistant", text: data.response || "No response" }])
    } catch (error) {
      setAiMessages(prev => [...prev, { role: "assistant", text: "Error: Failed to get response" }])
    }
    setAiLoading(false)
  }

  const renderHomeTab = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#4a6670] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {userData.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#171532]">{greeting}, {userData.name}!</h1>
            <p className="text-xs text-[#747384]">{displayDate}</p>
          </div>
        </div>
        <button className="p-3 hover:bg-[#f0f0f0] rounded-full transition-colors">
          <Bell className="w-6 h-6 text-[#4a6670]" />
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-2xl p-5 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-white">₹{userData.balance?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
              </div>
              <p className="text-white/70 text-xs">Deposited</p>
            </div>
            <p className="text-lg font-bold text-white">₹{getTotalDeposited().toFixed(2)}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />
              </div>
              <p className="text-white/70 text-xs">Withdrawn</p>
            </div>
            <p className="text-lg font-bold text-white">₹{getTotalWithdrawn().toFixed(2)}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-[#171532] mb-4">Options</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <button onClick={() => setActiveTab("ai")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">AI</span>
        </button>
        <button onClick={() => setActiveTab("reports")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">Reports</span>
        </button>
        <button onClick={() => setActiveTab("chats")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">Chats</span>
        </button>
        <button onClick={() => setActiveTab("support")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">Support</span>
        </button>
        <button onClick={() => setActiveTab("calculator")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">Calculator</span>
        </button>
        <button onClick={() => setActiveTab("calendar")} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-bold text-[#171532]">Calendar</span>
        </button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-[#e5e7eb] mb-4">
          <User className="w-5 h-5 text-[#4a6670]" />
          <h2 className="text-lg font-bold text-[#171532]">Recent Transactions</h2>
        </div>
        <div className="space-y-3">
          {userData.transactions && userData.transactions.length > 0 ? (
            userData.transactions.slice(-5).reverse().map((t: any, i: number) => (
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
            ))
          ) : (
            <p className="text-center text-[#747384] py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </>
  )

  const renderAITab = () => (
    <div className="flex flex-col h-full pb-20">
      <div className="flex items-center justify-between gap-3 pb-4 bg-gradient-to-r from-[#4a6670] to-[#3d565e] text-white rounded-2xl p-4 mb-4 border-2 border-[#5a7680]/50 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Ask AI</h1>
            <p className="text-xs text-white/70">Get instant help</p>
          </div>
        </div>
        {aiMessages.length > 0 && (
          <button onClick={() => setAiMessages([])} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0" title="Clear conversation">
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        {aiMessages.length === 0 ? (
          <div className="space-y-3">
            <button onClick={() => handleSendAIMessage("What is my current balance?")} className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl p-3 text-left hover:border-purple-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#171532] text-sm">💰 Check Balance</h3>
                  <p className="text-xs text-[#747384] mt-0.5">View your account balance</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {aiMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                )}
                <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm break-words ${msg.role === "user" ? "bg-amber-700 text-white rounded-br-3xl" : "bg-white text-[#171532] border border-gray-200 rounded-bl-3xl shadow-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start gap-2 items-center pt-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-3xl flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-28 left-4 right-4 bg-white border-2 border-[#e5e7eb] rounded-xl p-3 space-y-2">
        <p className="text-xs font-bold text-[#4a6670]">✨ ASK AI</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendAIMessage()}
            placeholder="Type your question..."
            disabled={aiLoading}
            className="flex-1 px-3 py-2 bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#171532] placeholder:text-[#b0b0b0] focus:outline-none focus:border-purple-400 focus:bg-white disabled:opacity-50 transition-all text-xs"
          />
          <button
            onClick={() => handleSendAIMessage()}
            disabled={aiLoading || !aiInput.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-lg font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center flex-shrink-0 h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <h2 className="text-lg font-bold text-[#171532]">Your Reports</h2>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[#f39c12]" />
          ) : (
            <Moon className="w-5 h-5 text-[#4a6670]" />
          )}
        </button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-[#171532] mb-4">Personal Account Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
            <span className="text-[#747384]">Total Transactions</span>
            <span className="font-bold text-[#171532]">{userData.transactions?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
            <span className="text-[#747384]">Total Deposited</span>
            <span className="font-bold text-[#10B981]">₹{getTotalDeposited().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
            <span className="text-[#747384]">Total Withdrawn</span>
            <span className="font-bold text-[#EF4444]">₹{getTotalWithdrawn().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
            <span className="text-[#747384]">Current Balance</span>
            <span className="font-bold text-[#4a6670]">₹{userData.balance?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  )

  const renderChatsTab = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
        </button>
        <h2 className="text-lg font-bold text-[#171532]">Messages</h2>
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-sm flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pb-4 border-b border-[#e5e7eb]">
          {chatMessages.length === 0 && (
            <p className="text-center text-[#747384] py-8">No messages yet. Start a conversation!</p>
          )}
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-[#4a6670] text-white' : 'bg-[#f0f0f0] text-[#171532]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#4a6670]" />
          <button className="bg-[#4a6670] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#3d565e]">Send</button>
        </div>
      </div>
    </>
  )

  const renderSupportTab = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
        </button>
        <h2 className="text-lg font-bold text-[#171532]">Support</h2>
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e5e7eb]">
          <p className="text-sm font-semibold text-[#4a6670] mb-2">How can we help?</p>
          <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe your issue..." className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#4a6670] text-[#171532]" rows={4}></textarea>
        </div>
        <button className="w-full bg-[#4a6670] text-white py-3 rounded-xl font-semibold hover:bg-[#3d565e] transition-all">Submit Ticket</button>
      </div>
    </>
  )

  const renderCalculatorTab = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
        </button>
        <h2 className="text-lg font-bold text-[#171532]">Calculator</h2>
      </div>
      
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-3xl p-6 shadow-2xl border border-[#5a7680]/50">
          <div className="space-y-4">
            <div className="text-right space-y-2">
              <p className="text-white/60 text-sm">{calcExpression}</p>
              <p className="text-5xl font-bold text-white tracking-tight">{calcDisplay}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mt-6">
            <button onClick={() => handleCalcInput("7")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">7</button>
            <button onClick={() => handleCalcInput("8")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">8</button>
            <button onClick={() => handleCalcInput("9")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">9</button>
            <button onClick={() => handleCalcInput("+")} className="bg-[#c17f59] hover:bg-[#d8956d] text-white py-4 rounded-2xl font-bold text-lg transition-colors">+</button>
            
            <button onClick={() => handleCalcInput("4")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">4</button>
            <button onClick={() => handleCalcInput("5")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">5</button>
            <button onClick={() => handleCalcInput("6")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">6</button>
            <button onClick={() => handleCalcInput("-")} className="bg-[#c17f59] hover:bg-[#d8956d] text-white py-4 rounded-2xl font-bold text-lg transition-colors">−</button>
            
            <button onClick={() => handleCalcInput("1")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">1</button>
            <button onClick={() => handleCalcInput("2")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">2</button>
            <button onClick={() => handleCalcInput("3")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">3</button>
            <button onClick={() => handleCalcInput("*")} className="bg-[#c17f59] hover:bg-[#d8956d] text-white py-4 rounded-2xl font-bold text-lg transition-colors">×</button>
            
            <button onClick={() => handleCalcInput("0")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">0</button>
            <button onClick={() => handleCalcInput(".")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg transition-colors">.</button>
            <button onClick={() => handleCalcInput("/")} className="bg-[#c17f59] hover:bg-[#d8956d] text-white py-4 rounded-2xl font-bold text-lg transition-colors">÷</button>
            
            <button onClick={() => handleCalcInput("=")} className="bg-[#10B981] hover:bg-[#0fa06f] text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">=</button>
            <button onClick={() => handleCalcInput("C")} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">C</button>
          </div>
        </div>
      </div>
    </>
  )

  const renderCalendarTab = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <h2 className="text-lg font-bold text-[#171532]">Calendar</h2>
        </div>
        <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-2xl p-6 shadow-lg border border-[#5a7680]/50">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-white">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-white/70 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div key={idx} className={`aspect-square flex items-center justify-center rounded-lg font-semibold transition-colors ${
                day === today.getDate() 
                  ? 'bg-[#c17f59] text-white shadow-md' 
                  : day 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'text-transparent'
              }`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      </>
    )
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

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "ai" && renderAITab()}
        {activeTab === "reports" && renderReportsTab()}
        {activeTab === "chats" && renderChatsTab()}
        {activeTab === "support" && renderSupportTab()}
        {activeTab === "calculator" && renderCalculatorTab()}
        {activeTab === "calendar" && renderCalendarTab()}
      </main>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-20 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <div className="max-w-md mx-auto bg-gradient-to-r from-[#e8f4f8] to-[#d4eef5] rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 ${
              activeTab === "home"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 ${
              activeTab === "chats"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Chats</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 ${
              activeTab === "profile"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
