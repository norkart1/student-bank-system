"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader,
  Download,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
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

  const displayTransactions = [...processedTransactions].reverse()

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ledger Statement</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">#{student.code}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Modern Profile & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
              
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl mb-6 mx-auto lg:mx-0">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <UserIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1 text-center lg:text-left">{student.name}</h2>
                <p className="text-slate-500 font-medium text-center lg:text-left mb-6">Academic Year: {student.academicYear}</p>
                
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Total Balance</p>
                  <h3 className="text-3xl font-black tracking-tight">₹{student.balance?.toLocaleString('en-IN')}</h3>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-emerald-400">Verified Account</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200/60 shadow-sm grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trans.</p>
                <p className="text-xl font-black text-slate-900">{student.transactions?.length || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-3xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-xl font-black text-slate-900">100%</p>
              </div>
            </div>
          </div>

          {/* Right: Modern Activity Stream */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                <span>Real-time updates</span>
              </div>
            </div>

            <div className="space-y-3">
              {displayTransactions.map((t: any, idx: number) => (
                <div 
                  key={t._id || idx} 
                  className="bg-white border border-slate-200/60 rounded-[2rem] p-5 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        t.type === 'deposit' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {t.type === 'deposit' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            t.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {t.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{format(new Date(t.date), 'dd MMM, yyyy')}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{t.method || 'Cash Transaction'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-black tracking-tight ${
                        t.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'deposit' ? '+' : '-'} ₹{t.amount?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Bal: ₹{t.runningBalance?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {(!displayTransactions.length) && (
                <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                  <Calendar className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">No transactions recorded yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
