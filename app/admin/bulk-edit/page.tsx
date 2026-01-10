"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, X, Loader2, Search, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  code: string
  balance: number
  academicYear: string
}

interface EditRow {
  studentId: string
  name: string
  code: string
  currentBalance: number
  deposit: string
  withdraw: string
  reason: string
  status: 'idle' | 'saving' | 'saved' | 'error'
}

export default function BulkEditPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [editRows, setEditRows] = useState<EditRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const autoSaveTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          setEditRows(data.map((s: Student) => ({
            studentId: s._id,
            name: s.name,
            code: s.code,
            currentBalance: s.balance,
            deposit: "",
            withdraw: "",
            reason: "",
            status: 'idle'
          })))
        }
      } catch (error) {
        console.error("Error fetching students:", error)
        toast.error("Failed to load students")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const handleInputChange = (index: number, field: keyof EditRow, value: string) => {
    const newRows = [...editRows]
    newRows[index] = { ...newRows[index], [field]: value, status: 'idle' }
    setEditRows(newRows)

    // Auto-save logic (debounced)
    const studentId = newRows[index].studentId
    if (autoSaveTimerRef.current[studentId]) {
      clearTimeout(autoSaveTimerRef.current[studentId])
    }

    autoSaveTimerRef.current[studentId] = setTimeout(() => {
      // Only auto-save if there's a valid deposit or withdraw
      if (value && (field === 'deposit' || field === 'withdraw')) {
        saveRow(index)
      }
    }, 2000)
  }

  const saveRow = async (index: number) => {
    const row = editRows[index]
    const depositAmount = parseFloat(row.deposit) || 0
    const withdrawAmount = parseFloat(row.withdraw) || 0

    if (depositAmount === 0 && withdrawAmount === 0) return

    setEditRows(prev => {
      const next = [...prev]
      next[index].status = 'saving'
      return next
    })

    try {
      // Process Deposit
      if (depositAmount > 0) {
        await fetch(`/api/students/${row.studentId}/transaction/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'deposit',
            amount: depositAmount,
            reason: row.reason || "Bulk Edit Deposit",
            date: new Date().toISOString().split('T')[0]
          })
        })
      }

      // Process Withdraw
      if (withdrawAmount > 0) {
        await fetch(`/api/students/${row.studentId}/transaction/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'withdraw',
            amount: withdrawAmount,
            reason: row.reason || "Bulk Edit Withdrawal",
            date: new Date().toISOString().split('T')[0]
          })
        })
      }

      setEditRows(prev => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          status: 'saved',
          deposit: "",
          withdraw: "",
          reason: "",
          currentBalance: next[index].currentBalance + depositAmount - withdrawAmount
        }
        return next
      })
    } catch (error) {
      setEditRows(prev => {
        const next = [...prev]
        next[index].status = 'error'
        return next
      })
      toast.error(`Failed to save for ${row.name}`)
    }
  }

  const handleSaveAll = async () => {
    setIsSavingAll(true)
    const pendingRows = editRows.filter(r => (parseFloat(r.deposit) || 0) > 0 || (parseFloat(r.withdraw) || 0) > 0)
    
    for (let i = 0; i < editRows.length; i++) {
      const row = editRows[i]
      if ((parseFloat(row.deposit) || 0) > 0 || (parseFloat(row.withdraw) || 0) > 0) {
        await saveRow(i)
      }
    }
    
    setIsSavingAll(false)
    toast.success("All transactions processed")
  }

  const filteredRows = editRows.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6670]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-colors shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
            </button>
            <h1 className="text-xl font-bold text-[#171532]">Bulk Transaction Edit</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll}
              className="flex items-center gap-2 px-6 py-2 bg-[#4a6670] text-white rounded-xl font-bold hover:bg-[#3d565e] transition-all disabled:opacity-50"
            >
              {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6670]/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-4 border-b border-gray-100">Student</th>
                  <th className="px-4 py-4 border-b border-gray-100">Code</th>
                  <th className="px-4 py-4 border-b border-gray-100 text-right">Balance</th>
                  <th className="px-4 py-4 border-b border-gray-100 w-32">Deposit (₹)</th>
                  <th className="px-4 py-4 border-b border-gray-100 w-32">Withdraw (₹)</th>
                  <th className="px-4 py-4 border-b border-gray-100">Reason</th>
                  <th className="px-4 py-4 border-b border-gray-100 w-20">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((row, index) => (
                  <tr key={row.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-[#171532]">{row.name}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-500">
                      {row.code}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-bold text-[#4a6670]">₹{row.currentBalance.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={row.deposit}
                        onChange={(e) => handleInputChange(index, 'deposit', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-green-700 font-bold"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={row.withdraw}
                        onChange={(e) => handleInputChange(index, 'withdraw', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-red-700 font-bold"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={row.reason}
                        onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6670]/20"
                        placeholder="Note..."
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.status === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />}
                      {row.status === 'saved' && <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />}
                      {row.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
