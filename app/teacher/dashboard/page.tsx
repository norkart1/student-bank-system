"use client"

import { useState, useEffect, useMemo } from "react"
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
  X,
  Activity,
  Calendar as CalendarIcon
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

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
  const [selectedPersonalStudent, setSelectedPersonalStudent] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [selectedDate, setSelectedDate] = useState(new Date())

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

  // Generate calendar days for the selected month in the popover
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  useEffect(() => {
    const el = document.getElementById(`date-${format(selectedDate, 'yyyy-MM-dd')}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDate, calendarDays]);

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
        setTeacher(authData.userData)

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
      studentId: s._id,
      studentProfileImage: s.profileImage
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const transactionsOnSelectedDate = allTransactions.filter(t => 
    format(new Date(t.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  const recentTransactions = transactionsOnSelectedDate.length > 0 ? transactionsOnSelectedDate : allTransactions.slice(0, 5)

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
          <div className="bg-[#2d6a4f] rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden group">
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
                            ? 'bg-[#2d6a4f] text-white' 
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#1a1a2e]">Student Accounts</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search students..."
                className="pl-10 h-10 w-48 sm:w-64 bg-gray-50 border-none rounded-xl shadow-inner focus:ring-2 focus:ring-[#2d6a4f]"
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
                    <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center text-[#2d6a4f] text-2xl font-bold">
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

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No students found in this session</p>
            </div>
          )}
        </div>

        {showDetailModal && selectedPersonalStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative h-48 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] p-8">
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
                      <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center text-[#2d6a4f] text-3xl font-bold">
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
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Timeline */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex flex-col mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1a1a2e]">{format(selectedDate, 'MMMM yyyy')}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Horizontal Scrollable Calendar */}
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-2 px-2 snap-x scroll-smooth">
              {calendarDays.map((date, i) => {
                const dayName = format(date, 'eee').substring(0, 2);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button 
                    key={i} 
                    id={`date-${format(date, 'yyyy-MM-dd')}`}
                    onClick={() => setSelectedDate(new Date(date))}
                    className="flex flex-col items-center gap-2 flex-shrink-0 snap-center"
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{dayName}</span>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                      isSelected 
                        ? 'bg-[#2d6a4f] text-white shadow-lg scale-105' 
                        : 'text-[#1a1a2e] bg-gray-50 hover:bg-gray-100'
                    }`}>
                      {date.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
            {transactionsOnSelectedDate.length > 0 ? (
              transactionsOnSelectedDate.map((transaction, idx) => (
                <div key={idx} className="relative pl-14 flex items-start justify-between group">
                  <div className={`absolute left-0 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm z-10 transition-transform group-hover:scale-110 flex items-center justify-center ${
                    transaction.type === 'deposit' ? 'bg-[#e7f5ee]' : 'bg-red-50'
                  }`}>
                    {transaction.studentProfileImage ? (
                      <img 
                        src={transaction.studentProfileImage} 
                        alt={transaction.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${
                        transaction.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                      }`}>
                        {transaction.studentName.charAt(0)}
                      </div>
                    )}
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