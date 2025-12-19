"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Users, CreditCard, MoreHorizontal, Send, QrCode, Bell, Grid3X3, ArrowDownRight, ArrowUpRight, Wallet, Plus, X, Camera, Trophy, Edit, Trash2, BarChart3, Sparkles, HelpCircle, MessageSquare, Settings, LogOut, Share2, Star, Lock, Info, ChevronLeft, Calculator, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

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
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [newStudent, setNewStudent] = useState({
    name: "",
    mobile: "",
    email: "",
    username: "",
    password: "",
    profileImage: ""
  })
  const [adminName, setAdminName] = useState("Admin User")
  const [adminUsername, setAdminUsername] = useState("admin")
  const [adminRating, setAdminRating] = useState(5)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{role: string, text: string}>>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [calcDisplay, setCalcDisplay] = useState("0")
  const [calcExpression, setCalcExpression] = useState("")
  const [systemStatus, setSystemStatus] = useState<any>(null)

  const handleCalcInput = (value: string) => {
    if (value === "=") {
      try {
        const result = eval(calcExpression || calcDisplay)
        setCalcDisplay(String(result))
        setCalcExpression("")
      } catch {
        setCalcDisplay("Error")
      }
    } else if (value === "C") {
      setCalcDisplay("0")
      setCalcExpression("")
    } else if (value === "←") {
      setCalcDisplay(calcDisplay.slice(0, -1) || "0")
    } else if (["+", "-", "*", "/"].includes(value)) {
      setCalcExpression(calcDisplay + value)
      setCalcDisplay("0")
    } else {
      setCalcDisplay(calcDisplay === "0" ? value : calcDisplay + value)
    }
  }

  const renderMessageWithHighlight = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewStudent({...newStudent, profileImage: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditAccount = (index: number) => {
    setNewStudent(students[index])
    setEditingIndex(index)
    setShowEditForm(true)
  }

  const handleUpdateAccount = () => {
    if (!newStudent.name || !newStudent.username || !newStudent.password) {
      alert("Please fill all required fields")
      return
    }

    if (editingIndex !== null) {
      const updatedStudents = [...students]
      updatedStudents[editingIndex] = {
        name: newStudent.name,
        username: newStudent.username,
        password: newStudent.password,
        profileImage: newStudent.profileImage,
        balance: updatedStudents[editingIndex].balance,
        transactions: updatedStudents[editingIndex].transactions
      }
      setStudents(updatedStudents)
      localStorage.setItem("students", JSON.stringify(updatedStudents))
      calculateTotals(updatedStudents)
      
      setNewStudent({ name: "", mobile: "", email: "", username: "", password: "", profileImage: "" })
      setEditingIndex(null)
      setShowEditForm(false)
    }
  }

  const handleDeleteAccount = (index: number) => {
    setDeletingIndex(index)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAccount = () => {
    if (deletingIndex !== null) {
      const updatedStudents = students.filter((_, i) => i !== deletingIndex)
      setStudents(updatedStudents)
      localStorage.setItem("students", JSON.stringify(updatedStudents))
      calculateTotals(updatedStudents)
      setShowDeleteConfirm(false)
      setDeletingIndex(null)
      setViewingIndex(null)
    }
  }

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false)
    setDeletingIndex(null)
  }

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
      
      // Fetch system status
      const fetchSystemStatus = async () => {
        try {
          const res = await fetch('/api/system/status')
          const data = await res.json()
          setSystemStatus(data)
        } catch (error) {
          console.error('Failed to fetch system status:', error)
        }
      }
      fetchSystemStatus()
      const statusInterval = setInterval(fetchSystemStatus, 5000)
      return () => clearInterval(statusInterval)
    }
    
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [router])

  const handleCreateAccount = () => {
    if (!newStudent.name || !newStudent.username || !newStudent.password) {
      alert("Please fill all required fields")
      return
    }

    const student: Student = {
      name: newStudent.name,
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

  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm || deletingIndex === null) return null
    const studentName = students[deletingIndex]?.name
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-in scale-in duration-200">
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#171532] mb-2">Delete Account</h3>
              <p className="text-sm text-[#747384]">
                Are you sure you want to delete <span className="font-semibold text-[#171532]">{studentName}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelDeleteAccount}
                className="flex-1 py-3 rounded-xl font-semibold text-[#171532] bg-[#f0f0f0] hover:bg-[#e5e5e5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderHomeTab = () => (
    <>
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

      <h2 className="text-lg font-bold text-[#171532] mb-4">Options</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Deposit</span>
        </button>
        <button className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Withdraw</span>
        </button>
        <button className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Reports</span>
        </button>
        <button 
          onClick={() => setActiveTab("ai")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">AI</span>
        </button>
        <button className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Support</span>
        </button>
        <button className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Chats</span>
        </button>
        <button 
          onClick={() => setActiveTab("accounts")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Accounts</span>
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Top Rich</span>
        </button>
        <button 
          onClick={() => setActiveTab("calculator")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Calculator</span>
        </button>
        <button 
          onClick={() => setActiveTab("status")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-[#171532]">Status</span>
        </button>
      </div>
    </>
  )

  const renderLeaderboardTab = () => {
    const sortedStudents = [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))
    const getMedalIcon = (index: number) => {
      if (index === 0) return '🥇'
      if (index === 1) return '🥈'
      if (index === 2) return '🥉'
      return null
    }
    
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
          </button>
          <h2 className="text-lg font-bold text-[#171532] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#c17f59]" />
            Top Richest Students
          </h2>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#e5e7eb]" />
            <p className="text-[#747384]">No students yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStudents.map((student, index) => {
              const medal = getMedalIcon(index)
              const isTop3 = index < 3
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-2xl flex items-center gap-3 border-2 shadow-sm transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
                    'bg-white border-[#e5e7eb]'
                  }`}
                >
                  {isTop3 ? (
                    <div className="text-2xl flex-shrink-0">{medal}</div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4a6670] to-[#3d565e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#171532] truncate">{student.name}</p>
                    <p className="text-xs text-[#747384] truncate">@{student.username || 'no_username'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold ${
                      index === 0 ? 'text-yellow-600 text-lg' :
                      index === 1 ? 'text-gray-600 text-lg' :
                      index === 2 ? 'text-orange-600 text-lg' :
                      'text-[#10B981] text-base'
                    }`}>
                      ₹{(student.balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  const renderAccountDetailView = () => {
    if (viewingIndex === null) return null
    const student = students[viewingIndex]
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
            <h3 className="text-xl font-bold text-[#171532]">Account Details</h3>
            <button onClick={() => setViewingIndex(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-6 py-6 space-y-5">
            <div className="flex justify-center pb-4">
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.name} className="w-24 h-24 rounded-full object-cover shadow-lg" />
              ) : (
                <div className={`w-24 h-24 rounded-full ${avatarColors[viewingIndex % avatarColors.length]} flex items-center justify-center text-3xl font-bold text-[#4a6670]`}>
                  {student.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#747384] mb-1">Full Name</label>
                <p className="text-lg font-semibold text-[#171532]">{student.name}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747384] mb-1">Username</label>
                <p className="text-lg font-semibold text-[#171532]">@{student.username || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#747384] mb-1">Balance</label>
                  <p className="text-lg font-bold text-[#10B981]">₹{student.balance.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#747384] mb-1">Transactions</label>
                  <p className="text-lg font-semibold text-[#171532]">{student.transactions.length}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={() => {
                    setViewingIndex(null)
                    handleEditAccount(viewingIndex)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewingIndex(null)
                    handleDeleteAccount(viewingIndex)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAITab = () => {
    const topStudent = students.length > 0 ? [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))[0] : null
    
    const handleSendMessage = async (message?: string) => {
      const msg = message || aiInput
      if (!msg.trim()) return
      setAiInput("")
      setAiMessages(prev => [...prev, { role: "user", text: msg }])
      setAiLoading(true)
      
      // Prepare student context for AI
      const studentContext = students.map((s, i) => 
        `${i + 1}. ${s.name} (${s.email}): Balance ₹${s.balance.toFixed(2)}, Transactions: ${s.transactions.length}`
      ).join("; ")
      
      let prompt = msg
      if (msg.includes("Live Scoreboard")) {
        prompt = `Show me the live scoreboard with top 3 students: ${[...students].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ₹${s.balance.toFixed(2)}`).join(", ")}`
      } else if (msg.includes("Sponsor Request")) {
        prompt = `Generate a professional sponsorship request email for JDSA Students Bank. Include that we have ${students.length} active students with total balance of ₹${totalBalance.toFixed(2)}.`
      } else if (msg.includes("Total amount of all accounts")) {
        prompt = `The total amount of all accounts combined is ₹${totalBalance.toFixed(2)}. This includes ${students.length} active student accounts with various balances.`
      } else if (msg.includes("Top rich person")) {
        const topRich = [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))[0]
        prompt = `The richest person is ${topRich?.name || 'N/A'} who is leading in our bank rankings.`
      }
      
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: prompt,
            studentContext: studentContext,
            adminName: adminName
          })
        })
        const data = await response.json()
        setAiMessages(prev => [...prev, { role: "assistant", text: data.response || "No response" }])
      } catch (error) {
        setAiMessages(prev => [...prev, { role: "assistant", text: "Error: Failed to get response" }])
      }
      setAiLoading(false)
    }
    
    return (
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#171532]">Hi there, <span className="text-orange-600">{adminName.split(' ')[0]}</span></h1>
              <p className="text-xs text-[#747384]">What can I help with?</p>
            </div>
          </div>
          {aiMessages.length > 0 && (
            <button onClick={() => setAiMessages([])} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors flex-shrink-0" title="Clear conversation">
              <X className="w-5 h-5 text-[#4a6670]" />
            </button>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <p className="text-sm text-[#747384] mb-4">Start a conversation or pick a topic.</p>
          
          {aiMessages.length === 0 ? (
            <div className="space-y-3">
              <button 
                onClick={() => handleSendMessage("Total amount of all accounts")}
                className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl p-3 text-left hover:border-purple-300 hover:shadow-md hover:bg-[#f8f9fa] transition-all active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#171532] text-sm">💰 Total Amount</h3>
                    <p className="text-xs text-[#747384] mt-0.5">All accounts combined</p>
                  </div>
                  <Wallet className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                </div>
              </button>
              
              <button 
                onClick={() => handleSendMessage("Top rich person")}
                className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl p-3 text-left hover:border-purple-300 hover:shadow-md hover:bg-[#f8f9fa] transition-all active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#171532] text-sm">👑 Top Rich Person</h3>
                    <p className="text-xs text-[#747384] mt-0.5">Who is the richest?</p>
                  </div>
                  <Star className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
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
                    {msg.role === "assistant" ? renderMessageWithHighlight(msg.text) : msg.text}
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-28 left-4 right-4 bg-white border-2 border-[#e5e7eb] rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-[#4a6670]">✨ ASK JDSA AI</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your question..."
              disabled={aiLoading}
              className="flex-1 px-3 py-2 bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#171532] placeholder:text-[#b0b0b0] focus:outline-none focus:border-purple-400 focus:bg-white disabled:opacity-50 transition-all text-xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={aiLoading || !aiInput.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-lg font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center flex-shrink-0 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderAccountsTab = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <h2 className="text-lg font-bold text-[#171532]">All Accounts</h2>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#4a6670] to-[#3d565e] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#4a6670]/20 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-14 h-14 text-[#e5e7eb] mb-3" />
          <p className="text-[#747384] font-medium text-sm mb-1">No accounts yet</p>
          <p className="text-xs text-[#a0a0a0]">Create your first account</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {students.map((student, index) => (
            <div 
              key={index} 
              onClick={() => setViewingIndex(index)}
              className="bg-gradient-to-r from-white to-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-3 shadow-sm cursor-pointer hover:border-[#4a6670] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-base font-bold text-[#4a6670] flex-shrink-0`}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#171532] text-sm truncate">{student.name}</p>
                  {(student.mobile || student.email) && (
                    <p className="text-xs text-[#747384] truncate">
                      {student.mobile && `${student.mobile}`}{student.mobile && student.email ? ' • ' : ''}{student.email && `${student.email}`}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#10B981]">₹{student.balance.toFixed(2)}</p>
                  <p className="text-xs text-[#4a6670] font-semibold">@{(student.username || 'no_user').slice(0, 10)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingIndex !== null && renderAccountDetailView()}
      {showDeleteConfirm && renderDeleteConfirmModal()}

      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
              <h3 className="text-xl font-bold text-[#171532]">{showEditForm ? 'Edit Account' : 'Create Account'}</h3>
              <button onClick={() => {setShowCreateForm(false); setShowEditForm(false); setEditingIndex(null); setNewStudent({ name: "", mobile: "", email: "", username: "", password: "", profileImage: "" })}} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-5">
              <div className="flex justify-center pb-2">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#e8f5f2] to-[#d4eef5] rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                    {newStudent.profileImage ? (
                      <img src={newStudent.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-[#4a6670]" />
                    )}
                  </div>
                  <label htmlFor="profileImageInput" className="absolute bottom-1 right-1 w-7 h-7 bg-[#4a6670] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3d565e] transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
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
                onClick={showEditForm ? handleUpdateAccount : handleCreateAccount}
                className="w-full bg-[#4a6670] text-white py-4 rounded-xl font-semibold hover:bg-[#3d565e] transition-all shadow-lg shadow-[#4a6670]/20 mt-2"
              >
                {showEditForm ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  const renderCalculatorTab = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
        </button>
        <h2 className="text-lg font-bold text-[#171532]">Calculator</h2>
      </div>
      
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-white/30">
          <div className="space-y-4">
            <div className="text-right space-y-2">
              <p className="text-white/50 text-sm">{calcExpression}</p>
              <p className="text-5xl font-bold text-white tracking-tight">{calcDisplay}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mt-6">
            <button onClick={() => handleCalcInput("7")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">7</button>
            <button onClick={() => handleCalcInput("8")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">8</button>
            <button onClick={() => handleCalcInput("9")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">9</button>
            <button onClick={() => handleCalcInput("+")} className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">+</button>
            
            <button onClick={() => handleCalcInput("4")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">4</button>
            <button onClick={() => handleCalcInput("5")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">5</button>
            <button onClick={() => handleCalcInput("6")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">6</button>
            <button onClick={() => handleCalcInput("-")} className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">-</button>
            
            <button onClick={() => handleCalcInput("1")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">1</button>
            <button onClick={() => handleCalcInput("2")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">2</button>
            <button onClick={() => handleCalcInput("3")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">3</button>
            <button onClick={() => handleCalcInput("*")} className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">×</button>
            
            <button onClick={() => handleCalcInput("0")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">0</button>
            <button onClick={() => handleCalcInput(".")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">.</button>
            <button onClick={() => handleCalcInput("/")} className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors">÷</button>
            
            <button onClick={() => handleCalcInput("=")} className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">=</button>
            <button onClick={() => handleCalcInput("C")} className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg col-span-2 transition-colors">C</button>
          </div>
        </div>
      </div>
    </>
  )

  const renderStatusTab = () => {
    const transactionData = [
      { name: 'Mon', success: 12000, failure: 2400 },
      { name: 'Tue', success: 15000, failure: 2210 },
      { name: 'Wed', success: 18000, failure: 2290 },
      { name: 'Thu', success: 22000, failure: 2000 },
      { name: 'Fri', success: 25000, failure: 2181 },
      { name: 'Sat', success: 28000, failure: 2500 },
      { name: 'Sun', success: 32000, failure: 2100 }
    ]
    
    const successCount = 88354
    const failureCount = 6548
    const totalTransactions = successCount + failureCount
    const successRate = Math.round((successCount / totalTransactions) * 100)
    
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
          </button>
          <h2 className="text-xl font-bold text-white">System Status</h2>
        </div>
        
        <div className="space-y-4">
          {/* Service Statuses & System Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Service Statuses */}
            <div className="bg-slate-700 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4">Service statuses</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Start</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Scoring</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Receipt</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
              </div>
            </div>

            {/* System Status Traffic Light */}
            <div className="bg-green-500 rounded-2xl p-5 flex flex-col items-center justify-center">
              <div className="flex flex-col gap-2 mb-3">
                <div className="w-10 h-4 rounded-full bg-red-600 shadow-lg"></div>
                <div className="w-10 h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                <div className="w-10 h-4 rounded-full bg-green-400 shadow-lg animate-pulse"></div>
              </div>
              <p className="text-white font-bold text-sm">System is stable</p>
            </div>
          </div>

          {/* Current Conversion */}
          <div className="bg-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Current conversion</h3>
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Normal</span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="3" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="3"
                      strokeDasharray={`${successRate * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{successRate}%</span>
                  </div>
                </div>
              </div>

              {/* Success/Failure Stats */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Success</span>
                    <span className="text-white font-bold text-sm">{successCount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: `${successRate}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Failure</span>
                    <span className="text-white font-bold text-sm">{failureCount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{width: `${100 - successRate}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Resources */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">RAM Usage</p>
              <p className="text-white font-bold text-sm mb-2">{systemStatus?.ram?.used?.toFixed(1) || '2.5'} GB</p>
              <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{width: `${systemStatus?.ram?.percentage || 31}%`}}></div>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">MongoDB</p>
              <p className="text-white font-bold text-sm mb-2">{(systemStatus?.mongodb?.used * 1024).toFixed(0) || 150} MB</p>
              <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{width: `${systemStatus?.mongodb?.percentage || 29}%`}}></div>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">CPU Usage</p>
              <p className="text-white font-bold text-sm mb-2">{systemStatus?.cpu?.percentage || 25}%</p>
              <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{width: `${systemStatus?.cpu?.percentage || 25}%`}}></div>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Response Time</p>
              <p className="text-white font-bold text-sm">{systemStatus?.responseTime || 95}ms</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${activeTab === "status" ? "bg-slate-800" : "bg-white"}`}>
      <div className={`px-5 pt-6 ${activeTab === "status" ? "text-white" : ""}`}>
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "accounts" && renderAccountsTab()}
        {activeTab === "leaderboard" && renderLeaderboardTab()}
        {activeTab === "ai" && renderAITab()}
        {activeTab === "calculator" && renderCalculatorTab()}
        {activeTab === "status" && renderStatusTab()}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#171532]">Admin Profile</h2>
            
            <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-2xl p-8 text-white">
              <div className="flex flex-col items-center text-center space-y-3">
                <img src="/admin-profile.jpg" alt="Admin Profile" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white/20" />
                <div>
                  <p className="text-xl font-bold">{adminName}</p>
                  <p className="text-sm text-white/70">@{adminUsername}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-white border border-[#e5e7eb] rounded-2xl p-3">
              <div>
                <p className="text-xs font-semibold text-[#747384] mb-1">Admin Name</p>
                <p className="text-sm font-bold text-[#171532]">{adminName}</p>
              </div>

              <div className="pt-2 border-t border-[#e5e7eb]">
                <p className="text-xs font-semibold text-[#747384] mb-1">Username</p>
                <p className="text-sm font-bold text-[#171532]">@{adminUsername}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="w-full flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-xl p-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <Lock className="w-5 h-5 text-[#4a6670]" />
                <span className="font-medium text-[#171532]">Reset Password</span>
              </button>

              <button
                onClick={() => {
                  const text = `Check out JDSA Students Bank: ${window.location.origin}`
                  if (navigator.share) {
                    navigator.share({
                      title: "JDSA Students Bank",
                      text: text,
                    })
                  } else {
                    alert(text)
                  }
                }}
                className="w-full flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-xl p-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <Share2 className="w-5 h-5 text-[#4a6670]" />
                <span className="font-medium text-[#171532]">Share Website</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Logout</span>
              </button>
            </div>

            <div className="text-center pt-2 pb-4">
              <p className="text-xs font-semibold text-[#747384]">v1.0.0</p>
            </div>

            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
                <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-in scale-in duration-200">
                  <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#171532] mb-2">Logout</h3>
                      <p className="text-sm text-[#747384]">
                        Are you sure you want to logout? You'll need to sign in again to access the admin dashboard.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-[#171532] bg-[#f0f0f0] hover:bg-[#e5e5e5] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem("isAdminAuthenticated")
                          localStorage.removeItem("userRole")
                          router.push("/login")
                        }}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showPasswordReset && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
                <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
                    <h3 className="text-xl font-bold text-[#171532]">Reset Password</h3>
                    <button onClick={() => setShowPasswordReset(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#171532] mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:ring-2 focus:ring-[#4a6670]/10 text-[#171532]"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171532] mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#4a6670] focus:ring-2 focus:ring-[#4a6670]/10 text-[#171532]"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (newPassword === confirmPassword && newPassword.length > 0) {
                          alert("Password reset successfully!")
                          setShowPasswordReset(false)
                          setNewPassword("")
                          setConfirmPassword("")
                        } else {
                          alert("Passwords do not match or are empty")
                        }
                      }}
                      className="w-full bg-[#4a6670] text-white py-3 rounded-xl font-semibold hover:bg-[#3d565e] transition-colors"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1 ${
              activeTab === "accounts"
                ? "bg-[#c17f59] text-white shadow-md px-4"
                : "text-[#4a6670]"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Accounts</span>
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
            <span className="text-[10px] font-medium">Admin Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
