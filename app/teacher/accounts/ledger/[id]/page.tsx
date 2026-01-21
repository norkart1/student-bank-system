"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader,
  Download
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <p className="text-gray-500 mb-4">Student not found</p>
        <Link href="/teacher/accounts" className="text-[#2d6a4f] font-bold hover:underline">
          Go back to accounts
        </Link>
      </div>
    )
  }

  // Group transactions by chronological order for running balance calculation
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

  // Group by month for display (Newest month first)
  const displayTransactions = [...processedTransactions].reverse()
  const groupedByMonth = displayTransactions.reduce((acc: any, t: any) => {
    const monthYear = format(new Date(t.date), 'MMMM yyyy').toUpperCase()
    if (!acc[monthYear]) acc[monthYear] = []
    acc[monthYear].push(t)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#1a1a2e] leading-tight">Full</h1>
            <h1 className="text-2xl font-black text-[#1a1a2e] leading-tight">Ledger</h1>
          </div>
          <button className="flex items-center gap-2 bg-[#2d6a4f] text-white px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm hover:bg-[#1b4332] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Student Profile Card */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm mb-10 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 mb-6 ring-1 ring-gray-100">
            {student.profileImage ? (
              <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#2d6a4f]/10 text-[#2d6a4f] flex items-center justify-center font-bold text-3xl">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-[#1a1a2e] uppercase mb-3 tracking-tight">{student.name}</h2>
          <div className="inline-block px-4 py-1.5 bg-[#e7f5ee] text-[#2d6a4f] text-xs font-black rounded-full uppercase tracking-widest mb-8">
            #{student.code}
          </div>
          
          <div className="grid grid-cols-2 gap-y-8 w-full max-w-sm">
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">Current Balance</p>
              <p className="text-xl font-black text-[#2d6a4f]">₹{student.balance?.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">Session</p>
              <p className="text-lg font-black text-gray-700">{student.academicYear}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">Transactions</p>
              <p className="text-lg font-black text-gray-700">{student.transactions?.length || 0}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">Status</p>
              <p className="text-lg font-black text-[#2d6a4f]">ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Complete Ledger Table Design */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-white border-b border-gray-50">
              <tr>
                <th className="pl-8 pr-2 py-6 text-left text-[14px] font-black text-[#2d6a4f]">#</th>
                <th className="px-4 py-6 text-left text-[14px] font-black text-[#2d6a4f]">Date</th>
                <th className="px-4 py-6 text-right text-[14px] font-black text-[#2d6a4f]">Dep.</th>
                <th className="px-4 py-6 text-right text-[14px] font-black text-[#2d6a4f]">With.</th>
                <th className="pl-4 pr-8 py-6 text-right text-[14px] font-black text-[#2d6a4f]">Bal.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {Object.entries(groupedByMonth).map(([month, transactions]: [string, any]) => (
                <React.Fragment key={month}>
                  <tr>
                    <td colSpan={5} className="px-8 py-8 text-[14px] font-black text-[#2d6a4f] tracking-tight bg-white">
                      {month}
                    </td>
                  </tr>
                  {transactions.map((t: any) => {
                    // Global index (1-based from bottom)
                    const globalIdx = processedTransactions.findIndex(tr => tr._id === t._id) + 1;
                    
                    return (
                      <tr key={t._id} className="hover:bg-gray-50/30 transition-colors border-none">
                        <td className="pl-8 pr-2 py-6 text-[15px] font-black text-[#1a1a2e]">
                          {globalIdx}
                        </td>
                        <td className="px-4 py-6 text-[15px] font-medium text-gray-400 tabular-nums">
                          {format(new Date(t.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-6 text-right">
                          {t.type === 'deposit' ? (
                            <span className="text-[15px] font-black text-[#2d6a4f] tabular-nums">₹{t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          ) : (
                            <span className="text-[15px] font-black text-[#2d6a4f]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-6 text-right">
                          {t.type === 'withdrawal' ? (
                            <span className="text-[15px] font-black text-[#ef4444] tabular-nums">₹{t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          ) : (
                            <span className="text-[15px] font-black text-[#ef4444]">-</span>
                          )}
                        </td>
                        <td className="pl-4 pr-8 py-6 text-right">
                          <span className="text-[15px] font-black text-[#1a1a2e] tabular-nums">₹{t.runningBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {(!student.transactions || student.transactions.length === 0) && (
            <div className="py-20 text-center text-gray-400 font-medium">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
