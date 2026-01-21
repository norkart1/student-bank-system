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
  User as UserIcon
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function StudentLedgerPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students?id=${params.id}`)
        if (res.ok) {
          const data = await res.json()
          const studentData = Array.isArray(data) ? data.find((s: any) => s._id === params.id) : data
          setStudent(studentData)
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
        <p className="text-slate-500 mb-4">Student not found</p>
        <Link href="/teacher/accounts" className="text-indigo-600 font-bold hover:underline">
          Go back to accounts
        </Link>
      </div>
    )
  }

  // Calculate Running Balances based on chronological order (Oldest to Newest)
  const sortedTransactions = [...(student.transactions || [])].sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let runningBalance = 0
  const processedTransactions = sortedTransactions.map((t: any) => {
    if (t.type === 'deposit') {
      runningBalance += t.amount
    } else {
      runningBalance -= t.amount
    }
    return { ...t, runningBalance }
  })

  // Full ledger display (All transactions, newest first)
  const displayTransactions = [...processedTransactions].reverse()

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header matching screenshot */}
      <div className="bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()} 
              className="p-1 hover:bg-slate-100 rounded-full transition-all"
            >
              <ArrowLeft className="w-8 h-8 text-[#1a1a2e]" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight leading-none mb-1">Ledger</h1>
              <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight leading-none mb-2">Statement</h1>
              <p className="text-sm font-bold text-slate-400 tracking-wider">#{student.code}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a2e] text-white px-8 py-4 rounded-[1.5rem] text-sm font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        {/* Student Profile Card - Restored Old Design style as per request */}
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm mb-12 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle accent in corner from screenshot */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16" />
          
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-50 ring-1 ring-gray-100">
              {student.profileImage ? (
                <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 text-slate-300 flex items-center justify-center">
                  <UserIcon className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-[#1a1a2e] uppercase mb-2 tracking-tight">{student.name}</h2>
          <p className="text-lg font-bold text-slate-400 mb-10">Academic Year: {student.academicYear}</p>
          
          <div className="w-full max-w-md bg-[#1a1a2e] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[11px] uppercase font-black tracking-[0.3em] text-slate-400 mb-2">Total Balance</p>
              <h3 className="text-5xl font-black tracking-tight mb-8 text-white">₹{student.balance?.toLocaleString('en-IN')}</h3>
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#4ade80]">Verified Account</span>
                <span className="px-5 py-1.5 bg-white/10 rounded-full text-[11px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Trans.</p>
            <p className="text-3xl font-black text-[#1a1a2e]">{student.transactions?.length || 0}</p>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status</p>
            <p className="text-3xl font-black text-[#1a1a2e]">100%</p>
          </div>
        </div>

        {/* Recent Activity Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tight">Recent Activity</h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Clock className="w-4 h-4" />
            <span>Real-time updates</span>
          </div>
        </div>

        {/* Full Ledger Feed */}
        <div className="space-y-4">
          {displayTransactions.map((t: any, idx: number) => (
            <div 
              key={t._id || idx} 
              className="bg-white border border-slate-50 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Icon Container matching screenshot exactly */}
                  <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-transform group-hover:scale-105 ${
                    t.type === 'deposit' 
                      ? 'bg-[#f0fdf4] text-[#22c55e]' 
                      : 'bg-[#fef2f2] text-[#ef4444]'
                  }`}>
                    {t.type === 'deposit' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                        t.type === 'deposit' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'
                      }`}>
                        {t.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{format(new Date(t.date), 'dd MMM, yyyy')}</span>
                    </div>
                    <p className="text-base font-black text-[#1a1a2e]">{t.method || 'Cash Transaction'}</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className={`text-xl font-black tracking-tight ${
                    t.type === 'deposit' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}>
                    {t.type === 'deposit' ? '+' : '-'} ₹{t.amount?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    BAL: ₹{t.runningBalance?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {(!displayTransactions.length) && (
            <div className="py-24 bg-white border border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
              <Calendar className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-sm font-black uppercase tracking-widest">Empty Ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
