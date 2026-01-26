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
  ChevronDown,
  X
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
  const [academicYears, setAcademicYears] = useState(["2023-24", "2024-25", "2025-26", "2026-27"])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  const [selectedPersonalStudent, setSelectedPersonalStudent] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/academic-sessions')
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setAcademicYears(data.map((s: any) => s.year))
          }
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      }
    }
    fetchSessions()
  }, [])

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div 
              key={student._id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center relative group hover:shadow-md transition-all"
            >
              <div className="w-full aspect-square mb-3 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                {student.profileImage ? (
                  <img 
                    src={student.profileImage} 
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8] text-2xl font-bold">
                    {student.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h4 className="text-sm font-bold text-[#1a1a2e] mb-1 line-clamp-1">{student.name}</h4>
              <p className="text-xs font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN')}</p>
              
              <button 
                onClick={() => {
                  setSelectedPersonalStudent(student)
                  setShowDetailModal(true)
                }}
                className="absolute bottom-2 right-2 w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {showDetailModal && selectedPersonalStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative h-48 bg-gradient-to-br from-[#818cf8] to-[#4f46e5] p-8">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-6 mt-4">
                  <div className="w-24 h-24 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-xl">
                    {selectedPersonalStudent.profileImage ? (
                      <img src={selectedPersonalStudent.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8] text-3xl font-bold">
                        {selectedPersonalStudent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-1">{selectedPersonalStudent.name}</h2>
                    <p className="text-white/80 font-medium tracking-wider">#{selectedPersonalStudent.code}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-3xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Current Balance</p>
                    <p className="text-xl font-bold text-[#2d6a4f]">₹ {selectedPersonalStudent.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Session</p>
                    <p className="text-lg font-bold text-[#1a1a2e]">{selectedPersonalStudent.academicYear}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#1a1a2e] uppercase tracking-widest">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-xs text-gray-400">Mobile</span>
                      <span className="text-sm font-bold text-[#1a1a2e]">{selectedPersonalStudent.mobile || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="text-xs text-gray-400">Email</span>
                      <span className="text-sm font-bold text-[#1a1a2e]">{selectedPersonalStudent.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/admin/accounts/${selectedPersonalStudent._id}`)}
                  className="w-full h-14 bg-[#1a1a2e] text-white rounded-2xl font-bold hover:bg-[#2d2d44] transition-all active:scale-95"
                >
                  Manage Transactions
                </button>
              </div>
            </div>
          </div>
        )}

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
