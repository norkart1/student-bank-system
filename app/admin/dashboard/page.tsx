"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, CreditCard, MoreHorizontal, Send, QrCode, Bell, Grid3X3, ArrowDownRight, ArrowUpRight, Wallet, Plus, X, Camera } from "lucide-react"

interface Transaction {
  type: string
  amount: number
  date?: string
}

interface Student {
  name: string
  mobile?: string
  email?: string
  username?: string
  password?: string
  profileImage?: string
  balance: number
  transactions: Transaction[]
}

const defaultStudents: Student[] = [
  { name: "Dara Sok", mobile: "9876543210", email: "dara@example.com", username: "dara_sok", balance: 1250.00, transactions: [{ type: 'deposit', amount: 1500, date: 'Dec 15, 2025' }, { type: 'withdraw', amount: 250, date: 'Dec 16, 2025' }] },
  { name: "Sophea Chan", mobile: "9876543211", email: "sophea@example.com", username: "sophea_chan", balance: 890.50, transactions: [{ type: 'deposit', amount: 1000, date: 'Dec 14, 2025' }, { type: 'withdraw', amount: 109.50, date: 'Dec 16, 2025' }] },
  { name: "Visal Meng", mobile: "9876543212", email: "visal@example.com", username: "visal_meng", balance: 2100.00, transactions: [{ type: 'deposit', amount: 2500, date: 'Dec 12, 2025' }, { type: 'withdraw', amount: 400, date: 'Dec 15, 2025' }] },
  { name: "Sreynich Phan", mobile: "9876543213", email: "sreynich@example.com", username: "sreynich_phan", balance: 675.25, transactions: [{ type: 'deposit', amount: 800, date: 'Dec 13, 2025' }, { type: 'withdraw', amount: 124.75, date: 'Dec 17, 2025' }] },
  { name: "Ratanak Ly", mobile: "9876543214", email: "ratanak@example.com", username: "ratanak_ly", balance: 1580.00, transactions: [{ type: 'deposit', amount: 2000, date: 'Dec 10, 2025' }, { type: 'withdraw', amount: 420, date: 'Dec 14, 2025' }] },
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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
    profileImage: ""
  })

  const calculateTotals = (studentList: Student[]) => {
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
      calculateTotals(studentList)
    }
    
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [router])

  const handleCreateAccount = () => {
    if (!newStudent.name || !newStudent.mobile || !newStudent.email || !newStudent.username || !newStudent.password) {
      alert("Please fill all required fields")
      return
    }

    const student: Student = {
      name: newStudent.name,
      mobile: newStudent.mobile,
      email: newStudent.email,
      username: newStudent.username,
      password: newStudent.password,
      profileImage: newStudent.profileImage,
      balance: 0,
      transactions: []
    }

    const updatedStudents = [...students, student]
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
    calculateTotals(updatedStudents)
    
    setNewStudent({ name: "", mobile: "", email: "", username: "", password: "", profileImage: "" })
    setShowCreateForm(false)
  }

  if (!isAuthenticated) {
    return null
  }

  const renderHomeTab = () => (
    <>
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
    </>
  )

  const renderAccountsTab = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#171532]">All Accounts</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-[#4a6670] text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {students.map((student, index) => (
          <div key={index} className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-bold text-[#4a6670]`}>
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#171532]">{student.name}</p>
                <p className="text-xs text-[#747384]">{student.mobile || 'No mobile'}</p>
                <p className="text-xs text-[#747384]">{student.email || 'No email'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#10B981]">₹{student.balance.toFixed(2)}</p>
                <p className="text-xs text-[#747384]">@{student.username || 'no_username'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
              <h3 className="text-xl font-bold text-[#171532]">Create Account</h3>
              <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-5">
              <div className="flex justify-center pb-2">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#e8f5f2] to-[#d4eef5] rounded-full flex items-center justify-center shadow-inner">
                    <Camera className="w-10 h-10 text-[#4a6670]" />
                  </div>
                  <button className="absolute bottom-1 right-1 w-7 h-7 bg-[#4a6670] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3d565e] transition-colors">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:bg-white focus:ring-2 focus:ring-[#4a6670]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Mobile Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  value={newStudent.mobile}
                  onChange={(e) => setNewStudent({...newStudent, mobile: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:bg-white focus:ring-2 focus:ring-[#4a6670]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Email ID <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:bg-white focus:ring-2 focus:ring-[#4a6670]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Username <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newStudent.username}
                  onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:bg-white focus:ring-2 focus:ring-[#4a6670]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:bg-white focus:ring-2 focus:ring-[#4a6670]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter password"
                />
              </div>

              <button
                onClick={handleCreateAccount}
                className="w-full bg-[#4a6670] text-white py-4 rounded-xl font-semibold hover:bg-[#3d565e] transition-all shadow-lg shadow-[#4a6670]/20 mt-2"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

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

        {activeTab === "home" && renderHomeTab()}
        {activeTab === "accounts" && renderAccountsTab()}
        {activeTab === "cards" && (
          <div className="text-center py-12 text-[#747384]">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Cards feature coming soon</p>
          </div>
        )}
        {activeTab === "more" && (
          <div className="text-center py-12 text-[#747384]">
            <MoreHorizontal className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>More options coming soon</p>
          </div>
        )}
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
