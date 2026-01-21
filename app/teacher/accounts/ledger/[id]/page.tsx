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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Full Ledger</h1>
          </div>
          <button className="flex items-center gap-2 bg-[#2d6a4f] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-[#1b4332] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Student Profile Summary */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#e7f5ee] shadow-md bg-gray-50 flex-shrink-0">
            {student.profileImage ? (
              <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#2d6a4f]/10 text-[#2d6a4f] flex items-center justify-center font-bold text-3xl">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-[#1a1a2e] uppercase">{student.name}</h2>
              <span className="inline-block px-3 py-1 bg-[#e7f5ee] text-[#2d6a4f] text-[10px] font-bold rounded-full uppercase tracking-wider mx-auto md:mx-0 w-fit">
                #{student.code}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Current Balance</p>
                <p className="text-lg font-bold text-[#2d6a4f]">₹{student.balance?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Session</p>
                <p className="text-sm font-bold text-gray-600">{student.academicYear}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Transactions</p>
                <p className="text-sm font-bold text-gray-600">{student.transactions?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Status</p>
                <p className="text-sm font-bold text-[#2d6a4f]">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Transaction History
          </h3>
          
          <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {student.transactions?.slice().reverse().map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#1a1a2e]">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{format(new Date(t.date), 'hh:mm a')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          t.type === 'deposit' ? 'bg-[#e7f5ee] text-[#2d6a4f]' : 'bg-red-50 text-red-500'
                        }`}>
                          {t.type === 'deposit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          t.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                        }`}>{t.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500 uppercase">{t.method || 'CASH'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-bold ${
                        t.type === 'deposit' ? 'text-[#2d6a4f]' : 'text-red-500'
                      }`}>
                        {t.type === 'deposit' ? '+' : '-'} ₹{t.amount?.toLocaleString('en-IN')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!student.transactions || student.transactions.length === 0) && (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-medium">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
