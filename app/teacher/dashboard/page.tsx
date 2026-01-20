"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  ArrowLeft, 
  LogOut, 
  Search, 
  TrendingUp, 
  History,
  CreditCard,
  User as UserIcon,
  ChevronRight,
  Loader,
  Bell,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Activity
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

export default function TeacherDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [teacher, setTeacher] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")
  const [academicYears, setAcademicYears] = useState(["2023-24", "2024-25", "2025-26", "2026-27"])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authRes = await fetch("/api/auth/verify")
        if (!authRes.ok) {
          router.push("/teacher-login")
          return
        }
        const authData = await authRes.json()
        setTeacher(authData.user)

        const studentsRes = await fetch("/api/students")
        if (studentsRes.ok) {
          const data = await studentsRes.json()
          setStudents(data)
        }
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/teacher-login")
  }

  const filteredStudents = students.filter(s => 
    (s.academicYear === selectedAcademicYear) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const studentsInYear = students.filter(s => s.academicYear === selectedAcademicYear)
  const totalBalance = studentsInYear.reduce((acc, s) => acc + (s.balance || 0), 0)

  const allTransactions = studentsInYear.flatMap(s => 
    (s.transactions || []).map((t: any) => ({
      ...t,
      studentName: s.name,
      studentCode: s.code,
      studentId: s._id
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const recentTransactions = allTransactions.slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2d4b3d] rounded-full flex items-center justify-center text-white text-lg font-bold">
            {teacher?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              {format(currentDate, 'HH') < '12' ? 'Morning' : 'Afternoon'}, {teacher?.name?.split(' ')[0] || 'Teacher'}!
            </h1>
            <p className="text-[#94a3b8] text-xs">
              {format(currentDate, 'MMM dd, yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleLogout}
            className="p-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-[#818cf8] rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-white/80 text-lg font-medium">Total Balance</p>
              <div className="relative">
                <button 
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  {selectedAcademicYear} <ChevronDown className="w-4 h-4" />
                </button>
                
                {showYearDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    {academicYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedAcademicYear(year)
                          setShowYearDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedAcademicYear === year 
                            ? 'bg-[#818cf8] text-white' 
                            : 'text-[#1a1a2e] hover:bg-gray-50'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-5xl font-bold mb-4 leading-none">
                ₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Activity className="w-4 h-4" />
                <span>Live Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options / Action Cards */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6">Options</h3>
          <div className="grid grid-cols-1 gap-6">
            <Link 
              href="/teacher/accounts"
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#f1f5f9] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-[#2d6a4f]" />
                </div>
                <p className="font-bold text-[#1a1a2e]">Accounts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex flex-col mb-8">
            <h3 className="text-xl font-bold text-[#1a1a2e] mb-6">What's on the road?</h3>
            
            {/* Calendar Days */}
            <div className="flex justify-between items-center px-2 mb-4">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (date.getDay() - i));
                const isToday = new Date().getDay() === i;
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                      isToday 
                        ? 'bg-[#1890ff] text-white shadow-md' 
                        : 'text-[#1a1a2e] hover:bg-gray-50'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, idx) => (
                <div key={idx} className="relative pl-14 flex items-start justify-between group">
                  <div className={`absolute left-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm z-10 transition-transform group-hover:scale-110 flex items-center justify-center ${
                    transaction.type === 'deposit' ? 'bg-[#e7f5ee]' : 'bg-red-50'
                  }`}>
                    <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${
                      transaction.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                    }`}>
                      {transaction.studentName.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1a1a2e] text-[15px] leading-tight uppercase tracking-tight">
                        {transaction.studentName}
                      </span>
                      <span className="font-bold text-[#1a1a2e] text-[15px] leading-tight">
                        {transaction.type === 'deposit' ? 'deposited' : 'withdrew'} ₹{transaction.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'deposit' ? 'bg-[#52c41a]' : 'bg-[#ff4d4f]'
                    }`} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-sm">No activity recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}