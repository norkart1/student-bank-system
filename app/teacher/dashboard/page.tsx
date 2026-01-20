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
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[#1a1a2e]">Recent Activity</h3>
            <div className="flex items-center gap-2 text-[#94a3b8] text-sm">
              <History className="w-4 h-4" />
              <span>Latest transactions</span>
            </div>
          </div>

          <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, idx) => (
                <div key={idx} className="relative pl-14 flex items-center justify-between group">
                  <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 ${
                    transaction.type === 'deposit' 
                      ? 'bg-[#e7f5ee] text-[#2d6a4f]' 
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {transaction.type === 'deposit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#1a1a2e]">{transaction.studentName}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium uppercase tracking-wider">#{transaction.studentCode}</span>
                    </div>
                    <p className="text-sm text-[#94a3b8]">
                      {transaction.type === 'deposit' ? 'Deposited' : 'Withdrawn'} on {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'} ₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{format(new Date(transaction.date), 'hh:mm a')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No recent transactions recorded</p>
              </div>
            )}
          </div>
          
          {recentTransactions.length > 0 && (
            <Link 
              href="/teacher/accounts" 
              className="mt-10 flex items-center justify-center gap-2 text-sm font-bold text-[#2d6a4f] hover:underline"
            >
              View all transactions <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}