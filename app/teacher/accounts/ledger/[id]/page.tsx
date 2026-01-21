"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader,
  Download,
  Calendar,
  History,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react"
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
        <button onClick={() => router.back()} className="text-[#2d6a4f] font-bold hover:underline">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Transaction History Header */}
      <div className="px-6 py-6 border-b border-gray-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Calendar className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Transaction History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#fcfcfc] border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Type</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {student.transactions?.slice().reverse().map((t: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-[#1a1a2e] leading-tight">
                        {format(new Date(t.date), 'MMM')}
                      </span>
                      <span className="text-[15px] font-bold text-[#1a1a2e] leading-tight">
                        {format(new Date(t.date), 'dd,')}
                      </span>
                      <span className="text-[15px] font-bold text-[#1a1a2e] leading-tight">
                        {format(new Date(t.date), 'yyyy')}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium mt-1 uppercase">
                        {format(new Date(t.date), 'hh:mm')}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium uppercase">
                        {format(new Date(t.date), 'aa')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        t.type === 'deposit' ? 'bg-[#e7f5ee] text-[#2d6a4f]' : 'bg-red-50 text-red-500'
                      }`}>
                        {t.type === 'deposit' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        t.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                      {t.method || 'CASH'}
                    </span>
                  </td>
                </tr>
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
