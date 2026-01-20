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
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#2d4b3d] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {teacher?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">
              {format(currentDate, 'HH') < '12' ? 'Morning' : 'Afternoon'},<br />
              Teacher!
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1">
              {format(currentDate, 'MMM dd, yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center text-[#64748b] hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-[#f8fafc] rounded-2xl flex items-center justify-center text-[#64748b] hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#818cf8] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/80 text-sm font-medium">Total Balance</p>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold mb-2 leading-none">
                {totalBalance > 1000 ? (totalBalance/1000).toFixed(1) + 'k' : totalBalance}
              </p>
              <div className="flex items-center gap-1 text-xs text-white/90">
                <TrendingUp className="w-3 h-3" />
                <span>+11.02%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/80 text-sm font-medium">Total Tasks</p>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold mb-2 leading-none">715</p>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <TrendingUp className="w-3 h-3 rotate-180" />
                <span>-0.03%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/80 text-sm font-medium">Members</p>
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold mb-2 leading-none">{students.length}</p>
              <div className="flex items-center gap-1 text-xs text-white/90">
                <TrendingUp className="w-3 h-3" />
                <span>+15.03%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#818cf8] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/80 text-sm font-medium">Productivity</p>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold mb-2 leading-none">93.8%</p>
              <div className="flex items-center gap-1 text-xs text-white/90">
                <TrendingUp className="w-3 h-3" />
                <span>+6.08%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Balance Card (Hidden or Minimized in favor of new theme if preferred, but keeping functional parts) */}
        <div className="bg-[#1e4636] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-10 hidden md:block">

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

        {/* Student Accounts List */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#1a1a2e]">Student Accounts</h3>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search students..."
                className="pl-10 h-12 bg-gray-50 border-none rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50/50">
                  <th className="px-8 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-8 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-8 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Balance</th>
                  <th className="px-8 py-5 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#e7f5ee] text-[#2d6a4f] rounded-2xl flex items-center justify-center font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-[#1a1a2e]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-lg">{student.code}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-[#1a1a2e]">
                      RM {student.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/teacher/dashboard/transactions/${student._id}`}
                        className="bg-[#f8fafc] text-[#64748b] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2d6a4f] hover:text-white transition-all inline-flex items-center gap-2"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
