"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  ArrowLeft, 
  Search, 
  ChevronRight,
  Loader,
  Activity,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function AdminAccountsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")
  const [academicYears] = useState(["2023-24", "2024-25", "2025-26", "2026-27"])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          const total = data.reduce((acc: number, s: any) => acc + (s.balance || 0), 0)
          setTotalBalance(total)
        }
      } catch (err) {
        console.error("Fetch accounts error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const filteredStudents = students.filter(s => 
    (s.academicYear === selectedAcademicYear) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">All Accounts</h1>
        </div>

        {/* Total Balance Card */}
        <div className="bg-[#818cf8] rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden group mb-8">
          <div className="flex justify-between items-start mb-6">
            <p className="text-white/80 text-lg font-medium">Total Portfolio Balance</p>
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
              <span>Live System Status</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search by name or code..."
              className="pl-12 h-12 bg-gray-50 border-none rounded-2xl shadow-inner focus:ring-2 focus:ring-[#818cf8]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div 
              key={student._id}
              className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-default group"
            >
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-lg font-bold text-[#1a1a2e]">#{student.code}</h4>
                <span className="px-3 py-1 bg-[#e7f5ee] text-[#2d6a4f] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Student Name</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#818cf8]/10 rounded-full flex items-center justify-center text-[#818cf8] text-xs font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-[#1a1a2e]">{student.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400">Current Balance</span>
                  <span className="text-sm font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Academic Session</span>
                  <span className="text-sm font-medium text-gray-600">{student.academicYear || '2025-26'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No accounts found in this session</p>
          </div>
        )}
      </div>
    </div>
  )
}
