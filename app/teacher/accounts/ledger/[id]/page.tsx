"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  User as UserIcon,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function StudentLedgerPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<string>("all")
  const [availableSessions, setAvailableSessions] = useState<string[]>([])

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students?id=${params.id}`)
        if (res.ok) {
          const data = await res.json()
          const studentData = Array.isArray(data) ? data.find((s: any) => s._id === params.id) : data
          setStudent(studentData)
          if (studentData) {
            // Extract unique sessions from transactions and the student's current year
            const sessions = new Set<string>()
            sessions.add(studentData.academicYear)
            studentData.transactions?.forEach((t: any) => {
              if (t.academicYear) sessions.add(t.academicYear)
            })
            setAvailableSessions(Array.from(sessions).sort().reverse())
          }
        }
      } catch (err) {
        console.error("Fetch student ledger error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudent()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader className="w-8 h-8 animate-spin text-[#0f172a]" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6">
        <p className="text-slate-500 mb-4 text-sm font-bold">Student not found</p>
        <Link href="/teacher/accounts" className="text-indigo-600 font-bold hover:underline">
          Go back to accounts
        </Link>
      </div>
    )
  }

  // Filter transactions by selected session (or show all)
  const filteredTransactions = student.transactions?.filter((t: any) => 
    selectedSession === "all" || t.academicYear === selectedSession || (!t.academicYear && selectedSession === student.academicYear)
  ) || []

  // Always calculate running balance based on ALL transactions to keep it accurate,
  // but we will only display the ones filtered by session.
  const sortedAllTransactions = [...(student.transactions || [])].sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let runningBalance = 0
  const processedAllTransactions = sortedAllTransactions.map((t: any) => {
    if (t.type === 'deposit') {
      runningBalance += t.amount
    } else {
      runningBalance -= t.amount
    }
    return { ...t, runningBalance }
  })

  // Get only the ones we want to display
  const displayTransactions = processedAllTransactions
    .filter(t => selectedSession === "all" || t.academicYear === selectedSession || (!t.academicYear && selectedSession === student.academicYear))
    .reverse()

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-50">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-1 hover:bg-slate-50 rounded-full transition-all active:scale-90"
            >
              <ArrowLeft className="w-7 h-7 text-[#1a1a2e]" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#1a1a2e] tracking-tight leading-tight">Ledger Statement</h1>
            </div>
          </div>
          <button className="flex items-center gap-1.5 bg-[#1a1a2e] text-white px-5 py-2.5 rounded-2xl text-[11px] font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Compact Student Profile Card */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full -mr-12 -mt-12" />
          
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50">
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-50 text-slate-200 flex items-center justify-center">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-[#1a1a2e] uppercase mb-1 tracking-tight">{student.name}</h2>
          
          {/* Student Code under Name */}
          <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-4">#{student.code}</p>
          
          {/* Academic Session Selector with "All" option */}
          <div className="relative mb-6">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="appearance-none bg-transparent text-xs font-bold text-slate-400 pr-8 pl-2 py-1 cursor-pointer focus:outline-none hover:text-[#1a1a2e] transition-colors text-center"
            >
              <option value="all">All Academic Sessions</option>
              {availableSessions.map(session => (
                <option key={session} value={session}>Academic Year: {session}</option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          
          <div className="w-full max-w-xs bg-[#1a1a2e] rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1.5">Total Balance</p>
              <h3 className="text-4xl font-black tracking-tight mb-6 text-white leading-none">₹{student.balance?.toLocaleString('en-IN')}</h3>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-[2rem] p-5 border border-slate-50 shadow-sm flex flex-col items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Trans.</p>
            <p className="text-2xl font-black text-[#1a1a2e]">{displayTransactions.length}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-50 shadow-sm flex flex-col items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Status</p>
            <p className="text-2xl font-black text-[#1a1a2e]">100%</p>
          </div>
        </div>

        {/* Recent Activity Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-lg font-black text-[#1a1a2e] tracking-tight">
            {selectedSession === "all" ? "Full History" : "Session Activity"}
          </h3>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
            <Clock className="w-3 h-3" />
            <span>Real-time</span>
          </div>
        </div>

        {/* Full Ledger Feed - Mobile Optimized */}
        <div className="space-y-3">
          {displayTransactions.map((t: any, idx: number) => (
            <div 
              key={t._id || idx} 
              className="bg-white border border-slate-50 rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[1.4rem] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                    t.type === 'deposit' 
                      ? 'bg-[#f0fdf4] text-[#22c55e]' 
                      : 'bg-[#fef2f2] text-[#ef4444]'
                  }`}>
                    {t.type === 'deposit' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${
                        t.type === 'deposit' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'
                      }`}>
                        {t.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate">{format(new Date(t.date), 'dd MMM, yy')}</span>
                    </div>
                    <p className="text-[13px] font-black text-[#1a1a2e] truncate">{t.method || 'Cash'}</p>
                    {selectedSession === "all" && (
                      <p className="text-[9px] font-bold text-slate-300 uppercase leading-none mt-1">{t.academicYear}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-base font-black tracking-tight ${
                    t.type === 'deposit' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}>
                    {t.type === 'deposit' ? '+' : '-'} ₹{t.amount?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.05em] leading-none">
                    BAL: ₹{t.runningBalance?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {(!displayTransactions.length) && (
            <div className="py-16 bg-white border border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-200">
              <Calendar className="w-10 h-10 mb-3 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Empty Ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
