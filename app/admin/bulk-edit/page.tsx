"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, X, Loader2, Search, CheckCircle2, AlertCircle, Plus, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  code: string
  balance: number
  academicYear: string
}

interface TransactionRow {
  id: string
  date: string
  academicYear: string
  type: 'deposit' | 'withdraw'
  amount: string
  reason: string
  status: 'idle' | 'saving' | 'saved' | 'error'
}

export default function BulkEditPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const autoSaveTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(filtered)
  }, [searchQuery, students])

  const selectStudent = (student: Student) => {
    setSelectedStudent(student)
    setTransactions([{
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      academicYear: student.academicYear || "2025-26",
      type: 'deposit',
      amount: "",
      reason: "",
      status: 'idle'
    }])
    setSearchQuery("")
    setShowSearch(false)
  }

  const addTransactionRow = () => {
    if (!selectedStudent) return
    setTransactions([...transactions, {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      academicYear: selectedStudent.academicYear || "2025-26",
      type: 'deposit',
      amount: "",
      reason: "",
      status: 'idle'
    }])
  }

  const removeRow = (index: number) => {
    const newTxs = [...transactions]
    newTxs.splice(index, 1)
    setTransactions(newTxs)
  }

  const handleInputChange = (index: number, field: keyof TransactionRow, value: string) => {
    const newTxs = [...transactions]
    newTxs[index] = { ...newTxs[index], [field]: value, status: 'idle' }
    setTransactions(newTxs)
  }

  const calculateTotals = () => {
    return transactions.reduce((acc, tx) => {
      const amt = parseFloat(tx.amount) || 0
      if (tx.type === 'deposit') acc.deposit += amt
      else acc.withdraw += amt
      return acc
    }, { deposit: 0, withdraw: 0 })
  }

  const saveTransaction = async (index: number) => {
    if (!selectedStudent) return
    const tx = transactions[index]
    const amount = parseFloat(tx.amount) || 0

    if (amount <= 0) return

    setTransactions(prev => {
      const next = [...prev]
      next[index].status = 'saving'
      return next
    })

    try {
      const res = await fetch(`/api/students/${selectedStudent._id}/transaction/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tx.type,
          amount: amount,
          reason: tx.reason || `Bulk Edit ${tx.type}`,
          date: tx.date,
          academicYear: tx.academicYear
        })
      })

      if (!res.ok) throw new Error("Failed to save")

      setTransactions(prev => {
        const next = [...prev]
        next[index].status = 'saved'
        return next
      })
      
      // Update selected student balance locally
      setSelectedStudent(prev => prev ? {
        ...prev,
        balance: tx.type === 'deposit' ? prev.balance + amount : prev.balance - amount
      } : null)

    } catch (error) {
      setTransactions(prev => {
        const next = [...prev]
        next[index].status = 'error'
        return next
      })
      toast.error(`Failed to save transaction`)
    }
  }

  const handleSaveAll = async () => {
    if (!selectedStudent) return
    setIsSavingAll(true)
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i]
      if ((parseFloat(tx.amount) || 0) > 0 && tx.status !== 'saved') {
        await saveTransaction(i)
      }
    }
    setIsSavingAll(false)
    toast.success("All transactions processed")
  }

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
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedStudent(null)
                setTransactions([])
              }}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm transition-all active:scale-95"
              title="Reset"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll || !selectedStudent || transactions.length === 0}
              className="p-2.5 bg-[#4a6670] text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Save All"
            >
              {isSavingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!selectedStudent ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-[#4a6670]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#4a6670]" />
            </div>
            <h2 className="text-lg font-bold text-[#171532] mb-2">Find a Student</h2>
            <p className="text-sm text-gray-500 mb-6">Search for a student to add multiple transactions at once.</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearch(true)
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6670]/20"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map(s => (
                    <button
                      key={s._id}
                      onClick={() => selectStudent(s)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#171532]">{s.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{s.code}</p>
                      </div>
                      <Plus className="w-4 h-4 text-[#4a6670]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-[#4a6670]/5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4a6670] rounded-full flex items-center justify-center text-white font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-[#171532]">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <p className="text-xs text-gray-500 font-mono">{selectedStudent.code}</p>
                    <p className="text-xs font-bold text-[#4a6670]">Balance: ₹{selectedStudent.balance.toFixed(2)}</p>
                    <div className="flex gap-3 border-l border-gray-300 pl-4">
                      <p className="text-[10px] font-bold text-green-600">Total Dep: ₹{calculateTotals().deposit.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-red-600">Total With: ₹{calculateTotals().withdraw.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-xs font-bold text-[#4a6670] hover:underline"
              >
                Change Student
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-2 py-4 border-b border-gray-100 w-32">Date</th>
                    <th className="px-2 py-4 border-b border-gray-100 w-20">Session</th>
                    <th className="px-2 py-4 border-b border-gray-100 w-20">Type</th>
                    <th className="px-2 py-4 border-b border-gray-100 w-24">Amount</th>
                    <th className="px-2 py-4 border-b border-gray-100">Reason</th>
                    <th className="px-2 py-4 border-b border-gray-100 w-16 text-center">St.</th>
                    <th className="px-2 py-4 border-b border-gray-100 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-2 py-4">
                        <div className="relative">
                          <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="date"
                            value={tx.date}
                            onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                            className="w-full pl-7 pr-1 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <select
                          value={tx.academicYear}
                          onChange={(e) => handleInputChange(index, 'academicYear', e.target.value)}
                          className="w-full px-1 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none"
                        >
                          <option value="2024-25">24-25</option>
                          <option value="2025-26">25-26</option>
                          <option value="2026-27">26-27</option>
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <select
                          value={tx.type}
                          onChange={(e) => handleInputChange(index, 'type', e.target.value as any)}
                          className={`w-full px-1 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold focus:outline-none ${
                            tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          <option value="deposit">Dep</option>
                          <option value="withdraw">With</option>
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tx.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              handleInputChange(index, 'amount', val);
                            }
                          }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none font-bold"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-4">
                        <input
                          type="text"
                          value={tx.reason}
                          onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none"
                          placeholder="Note..."
                        />
                      </td>
                      <td className="px-2 py-4 text-center">
                        {tx.status === 'idle' && (
                          <button
                            onClick={() => saveTransaction(index)}
                            className="p-1.5 bg-[#4a6670]/10 text-[#4a6670] rounded-lg hover:bg-[#4a6670]/20 transition-all"
                            title="Save Row"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {tx.status === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 mx-auto" />}
                        {tx.status === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mx-auto" />}
                        {tx.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 mx-auto" />}
                      </td>
                      <td className="px-2 py-4">
                        <button 
                          onClick={() => removeRow(index)}
                          className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <button
                onClick={addTransactionRow}
                className="flex items-center gap-2 px-6 py-2 bg-[#4a6670]/10 text-[#4a6670] rounded-xl font-bold text-sm hover:bg-[#4a6670]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Another Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
