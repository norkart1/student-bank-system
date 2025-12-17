"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, CreditCard, MoreHorizontal, Send, Receipt, Banknote, QrCode, Bell, Grid3X3, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react"

interface Transaction {
  type: string
  amount: number
  date?: string
}

interface Student {
  name: string
  balance: number
  transactions: Transaction[]
}

const defaultStudents: Student[] = [
  { name: "Dara Sok", balance: 1250.00, transactions: [{ type: 'deposit', amount: 1500, date: 'Dec 15, 2025' }, { type: 'withdraw', amount: 250, date: 'Dec 16, 2025' }] },
  { name: "Sophea Chan", balance: 890.50, transactions: [{ type: 'deposit', amount: 1000, date: 'Dec 14, 2025' }, { type: 'withdraw', amount: 109.50, date: 'Dec 16, 2025' }] },
  { name: "Visal Meng", balance: 2100.00, transactions: [{ type: 'deposit', amount: 2500, date: 'Dec 12, 2025' }, { type: 'withdraw', amount: 400, date: 'Dec 15, 2025' }] },
  { name: "Sreynich Phan", balance: 675.25, transactions: [{ type: 'deposit', amount: 800, date: 'Dec 13, 2025' }, { type: 'withdraw', amount: 124.75, date: 'Dec 17, 2025' }] },
  { name: "Ratanak Ly", balance: 1580.00, transactions: [{ type: 'deposit', amount: 2000, date: 'Dec 10, 2025' }, { type: 'withdraw', amount: 420, date: 'Dec 14, 2025' }] },
]

const avatarColors = ['bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100']

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [currentDate, setCurrentDate] = useState("")
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalDeposited, setTotalDeposited] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthenticated")
    const role = localStorage.getItem("userRole")
    if (auth !== "true" || role !== "admin") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      
      let savedStudents = localStorage.getItem("students")
      let studentList: Student[]
      
      if (!savedStudents || JSON.parse(savedStudents).length === 0) {
        localStorage.setItem("students", JSON.stringify(defaultStudents))
        studentList = defaultStudents
      } else {
        studentList = JSON.parse(savedStudents)
      }
      
      setStudents(studentList)
      
      let balance = 0
      let deposited = 0
      let withdrawn = 0
      
      studentList.forEach((student) => {
        balance += student.balance || 0
        if (student.transactions) {
          student.transactions.forEach((t) => {
            if (t.type === 'deposit') {
              deposited += t.amount || 0
            } else if (t.type === 'withdraw') {
              withdrawn += t.amount || 0
            }
          })
        }
      })
      
      setTotalBalance(balance)
      setTotalDeposited(deposited)
      setTotalWithdrawn(withdrawn)
    }
    
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [router])

  if (!isAuthenticated) {
    return null
  }

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

        <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-white">₹{totalBalance.toFixed(2)}</p>
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
              <p className="text-lg font-bold text-white">₹{totalDeposited.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />
                </div>
                <p className="text-white/70 text-xs">Withdrawn</p>
              </div>
              <p className="text-lg font-bold text-white">₹{totalWithdrawn.toFixed(2)}</p>
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
              <ArrowDownRight className="w-6 h-6 text-[#10B981]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Deposit</span>
          </button>
          
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <ArrowUpRight className="w-6 h-6 text-[#EF4444]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Withdraw</span>
          </button>
          
          <button className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#e8f5f2] rounded-xl flex items-center justify-center mb-3">
              <Send className="w-6 h-6 text-[#4a6670]" />
            </div>
            <span className="text-sm font-medium text-[#171532]">Transfer</span>
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
          <h2 className="text-lg font-bold text-[#171532] mb-4">Accounts</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {students.slice(0, 5).map((student, index) => (
              <div key={index} className="flex flex-col items-center min-w-[80px]">
                <div className={`w-14 h-14 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center mb-2 text-lg font-bold text-[#4a6670]`}>
                  {student.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-[#171532] text-center truncate w-full">{student.name.split(' ')[0]}</p>
                <p className="text-[10px] text-[#10B981] text-center font-medium">₹{student.balance.toFixed(2)}</p>
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
