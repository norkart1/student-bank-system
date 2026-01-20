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
  ChevronDown
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
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalBalance = students.reduce((acc, s) => acc + (s.balance || 0), 0)
  const totalDeposited = students.reduce((acc, s) => {
    const deposits = s.transactions?.filter((t: any) => t.type === 'deposit') || []
    return acc + deposits.reduce((sum: number, t: any) => sum + t.amount, 0)
  }, 0)
  const totalWithdrawn = students.reduce((acc, s) => {
    const withdrawals = s.transactions?.filter((t: any) => t.type === 'withdrawal') || []
    return acc + withdrawals.reduce((sum: number, t: any) => sum + t.amount, 0)
  }, 0)

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
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-5xl font-bold mb-4 leading-none">
                ₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <TrendingUp className="w-4 h-4" />
                <span>+11.02% Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options / Action Cards */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6">Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/teacher/dashboard/deposit" className="group">
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#e7f5ee] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-8 h-8 text-[#2d6a4f]" />
                </div>
                <p className="font-bold text-[#1a1a2e]">Deposit</p>
              </div>
            </Link>
            
            <Link href="/teacher/dashboard/withdraw" className="group">
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#fef2f2] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-8 h-8 text-red-500" />
                </div>
                <p className="font-bold text-[#1a1a2e]">Withdraw</p>
              </div>
            </Link>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4 cursor-not-allowed opacity-60">
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-3xl flex items-center justify-center">
                <History className="w-8 h-8 text-[#64748b]" />
              </div>
              <p className="font-bold text-[#1a1a2e]">History</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4 cursor-not-allowed opacity-60">
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-3xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#64748b]" />
              </div>
              <p className="font-bold text-[#1a1a2e]">Accounts</p>
            </div>
          </div>
        </div>

        {/* Student Accounts Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#1a1a2e]">Student Accounts</h3>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search students..."
                className="pl-10 h-10 bg-gray-50 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Link 
                key={student._id}
                href={`/teacher/dashboard/transactions/${student._id}`}
                className="block group"
              >
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-lg font-bold text-[#1a1a2e]">#{student.code}</h4>
                    <span className="px-3 py-1 bg-[#e7f5ee] text-[#2d6a4f] text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400">Student</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#2d4b3d] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-[#1a1a2e]">{student.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400">Balance</span>
                      <span className="text-sm font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-400">Year</span>
                      <span className="text-sm font-medium text-gray-600">{student.academicYear || '2025-26'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400">Last Active</span>
                      <span className="text-xs font-medium text-gray-500">Just now</span>
                    </div>
                  </div>
                  
                  <div className="absolute right-4 bottom-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#2d6a4f] group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
            
            {filteredStudents.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
                No students found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}