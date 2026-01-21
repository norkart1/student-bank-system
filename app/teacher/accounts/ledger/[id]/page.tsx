"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Loader,
  Download,
  Calendar,
  History
} from "lucide-react"
import { format, parseISO, startOfMonth } from "date-fns"

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

  // Group transactions by month
  const groupedTransactions: { [key: string]: any[] } = {}
  let runningBalance = 0
  const sortedTransactions = [...(student.transactions || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const processedTransactions = sortedTransactions.map(t => {
    if (t.type === 'deposit') {
      runningBalance += t.amount
    } else {
      runningBalance -= t.amount
    }
    return { ...t, balanceAfter: runningBalance }
  })

  processedTransactions.forEach(t => {
    const monthKey = format(new Date(t.date), 'MMMM yyyy')
    if (!groupedTransactions[monthKey]) {
      groupedTransactions[monthKey] = []
    }
    groupedTransactions[monthKey].push(t)
  })

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Dark Green Header */}
      <div className="bg-[#2d4b3d] text-white px-6 py-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <History className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Full Ledger</h1>
              <p className="text-white/70 text-sm">{student.academicYear} Session</p>
            </div>
          </div>
          <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fcf9] border-b border-gray-100">
              <tr>
                <th className="px-3 py-4 text-left font-bold text-[#2d4b3d] w-10">#</th>
                <th className="px-3 py-4 text-left font-bold text-[#2d4b3d]">Date</th>
                <th className="px-3 py-4 text-center font-bold text-[#2d4b3d]">Dep.</th>
                <th className="px-3 py-4 text-center font-bold text-[#2d4b3d]">With.</th>
                <th className="px-3 py-4 text-right font-bold text-[#2d4b3d]">Bal.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.keys(groupedTransactions).map((monthKey) => (
                <React.Fragment key={monthKey}>
                  {/* Month Header Row */}
                  <tr className="bg-white">
                    <td colSpan={5} className="px-3 py-3 text-[11px] font-bold text-[#2d6a4f] uppercase tracking-wider bg-white">
                      {monthKey}
                    </td>
                  </tr>
                  {groupedTransactions[monthKey].map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <td className="px-3 py-4 text-xs font-bold text-[#1a1a2e]">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-4 text-xs font-medium text-gray-500">
                        {format(new Date(t.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {t.type === 'deposit' ? (
                          <span className="text-xs font-bold text-[#2d6a4f]">₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center">
                        {t.type === 'withdrawal' ? (
                          <span className="text-xs font-bold text-red-500">₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right text-xs font-bold text-[#1a1a2e]">
                        ₹{t.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {Object.keys(groupedTransactions).length === 0 && (
            <div className="py-20 text-center text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
