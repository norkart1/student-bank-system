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
  const totalDeposited = studentsInYear.reduce((acc, s) => {
    const deposits = s.transactions?.filter((t: any) => t.type === 'deposit' && t.academicYear === selectedAcademicYear) || []
    return acc + deposits.reduce((sum: number, t: any) => sum + t.amount, 0)
  }, 0)
  const totalWithdrawn = studentsInYear.reduce((acc, s) => {
    const withdrawals = s.transactions?.filter((t: any) => t.type === 'withdrawal' && t.academicYear === selectedAcademicYear) || []
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
      </main>
    </div>
  )
}