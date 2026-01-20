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
  Loader
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeacherDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/login" className="p-2 hover:bg-[#f5f5f7] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#6b7280]" />
            </Link>
            <h1 className="text-xl font-bold text-[#171532]">Teacher Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#171532]">{teacher?.name}</p>
              <p className="text-xs text-[#6b7280]">Staff Member</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2d6a4f]/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-sm text-[#6b7280]">Total Accounts</p>
                  <p className="text-2xl font-bold text-[#171532]">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6b7280]">Total Balance</p>
                  <p className="text-2xl font-bold text-[#171532]">
                    RM {students.reduce((acc, s) => acc + (s.balance || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6b7280]">Active Session</p>
                  <p className="text-2xl font-bold text-[#171532]">Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="p-6 border-b border-[#f0f0f0]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#171532]">Student Accounts</h2>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <Input 
                  placeholder="Search by name or code..."
                  className="pl-10 h-10 bg-[#f9fafb] border-none rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9fafb] text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-[#6b7280] uppercase">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6b7280] uppercase">Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6b7280] uppercase">Current Balance</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6b7280] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-[#171532]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-[#6b7280]">{student.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#2d6a4f]">RM {student.balance?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/teacher/dashboard/transactions/${student._id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#2d6a4f] hover:underline"
                      >
                        View Transactions
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#6b7280]">
                      No accounts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
