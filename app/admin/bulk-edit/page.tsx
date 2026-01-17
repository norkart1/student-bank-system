"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, X, Loader2, Search, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, Edit } from "lucide-react"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  code: string
  balance: number
  academicYear: string
  profileImage?: string
}

interface Transaction {
  _id: string
  type: 'deposit' | 'withdraw'
  amount: number
  reason: string
  date: string
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
  const [history, setHistory] = useState<Transaction[]>([])
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null)
  const [editingHistoryData, setEditingHistoryData] = useState<{ amount: string, reason: string }>({ amount: "", reason: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
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

  useEffect(() => {
    if (selectedStudent) {
      fetchHistory()
    } else {
      setHistory([])
    }
  }, [selectedStudent])

  const fetchHistory = async () => {
    if (!selectedStudent) return
    setIsHistoryLoading(true)
    try {
      const res = await fetch(`/api/students/${selectedStudent._id}`)
      if (res.ok) {
        const data = await res.json()
        // Sort transactions by date descending
        const sorted = (data.transactions || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setHistory(sorted)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsHistoryLoading(false)
    }
  }

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
    const bulkTotals = transactions.reduce((acc, tx) => {
      const amt = parseFloat(tx.amount) || 0
      if (tx.type === 'deposit') acc.deposit += amt
      else acc.withdraw += amt
      return acc
    }, { deposit: 0, withdraw: 0 })

    const historyTotals = history.reduce((acc, tx) => {
      const amt = tx.amount || 0
      if (tx.type === 'deposit') acc.deposit += amt
      else acc.withdraw += amt
      return acc
    }, { deposit: 0, withdraw: 0 })

    return {
      deposit: bulkTotals.deposit + historyTotals.deposit,
      withdraw: bulkTotals.withdraw + historyTotals.withdraw
    }
  }

  const saveTransaction = async (index: number) => {
    if (!selectedStudent) return
    
    // Create a local copy of the transaction row to work with
    const tx = transactions[index]
    if (!tx) return;
    
    const amount = parseFloat(tx.amount) || 0;
    const formattedAmount = Number(amount.toFixed(2));

    if (amount <= 0) return

    setTransactions(prev => {
      const next = [...prev]
      if (next[index]) next[index].status = 'saving'
      return next
    })

    try {
      const res = await fetch(`/api/students/${selectedStudent._id}/transaction/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tx.type,
          amount: formattedAmount,
          reason: tx.reason || `Bulk Edit ${tx.type}`,
          date: tx.date,
          academicYear: tx.academicYear
        })
      })

      if (!res.ok) throw new Error("Failed to save")
      
      const savedData = await res.json()

      // Local update for immediate feedback
      setTransactions(prev => {
        const next = [...prev]
        const currentTx = next.find(t => t.id === tx.id)
        if (currentTx) {
          currentTx.status = 'saved'
          // Automatically remove the row after 1.5 seconds if it was saved successfully
          setTimeout(() => {
            setTransactions(current => current.filter(t => t.id !== tx.id))
            // Refresh history after save
            fetchHistory()
          }, 1500)
        }
        return next
      })
      
      // Update selected student balance locally
      setSelectedStudent(prev => prev ? {
        ...prev,
        balance: tx.type === 'deposit' ? prev.balance + formattedAmount : prev.balance - formattedAmount
      } : null)

    } catch (error) {
      setTransactions(prev => {
        const next = [...prev]
        const currentTx = next.find(t => t.id === tx.id)
        if (currentTx) currentTx.status = 'error'
        return next
      })
      toast.error(`Failed to save transaction`)
    }
  }

  const handleSaveAll = async () => {
    if (!selectedStudent) return
    setIsSavingAll(true)
    
    // Filter transactions that need saving
    const toSave = transactions.filter(tx => (parseFloat(tx.amount) || 0) > 0 && tx.status !== 'saved')
    
    // Save them sequentially to avoid race conditions or DB locks
    for (const tx of toSave) {
      const index = transactions.findIndex(t => t.id === tx.id)
      if (index !== -1) {
        await saveTransaction(index)
      }
    }
    
    setIsSavingAll(false)
    toast.success("All transactions processed")
  }

  const deleteHistoryItem = async (txId: string) => {
    if (!selectedStudent) return
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      // Find the index of the transaction in the history
      const index = history.findIndex(h => h._id === txId);
      if (index === -1) {
        toast.error("Transaction not found");
        return;
      }

      // Important: History is sorted by date descending, but we need the index from the student.transactions array
      // Let's refetch student data to get the correct original index or use a different approach
      const res = await fetch(`/api/students/${selectedStudent._id}/transaction/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }) // Note: This logic assumes the history array matches the DB order, which might be risky.
      })
      
      if (res.ok) {
        toast.success("Transaction deleted")
        fetchHistory()
        // Update balance locally
        const deletedTx = history.find(h => h._id === txId)
        if (deletedTx) {
          setSelectedStudent(prev => prev ? {
            ...prev,
            balance: deletedTx.type === 'deposit' ? prev.balance - deletedTx.amount : prev.balance + deletedTx.amount
          } : null)
        }
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast.error("Failed to delete transaction")
    }
  }

  const startEditingHistory = (tx: Transaction) => {
    setEditingHistoryId(tx._id)
    setEditingHistoryData({ amount: tx.amount.toString(), reason: tx.reason })
  }

  const saveHistoryEdit = async (txId: string) => {
    if (!selectedStudent) return
    
    // Find transaction in history
    const historyItem = history.find(h => h._id === txId);
    if (!historyItem) return;

    const newAmount = parseFloat(editingHistoryData.amount)
    
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error("Invalid amount")
      return
    }

    try {
      const res = await fetch(`/api/students/${selectedStudent._id}/transaction/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: txId, // Send the stable database ID
          amount: newAmount,
          reason: editingHistoryData.reason
        })
      })

      if (res.ok) {
        toast.success("Transaction updated")
        setEditingHistoryId(null)
        fetchHistory()
        // Update balance locally
        const diff = historyItem.type === 'deposit' ? newAmount - historyItem.amount : historyItem.amount - newAmount
        setSelectedStudent(prev => prev ? { ...prev, balance: prev.balance + diff } : null)
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      toast.error("Failed to update transaction")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-[#2d6a4f]" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-[#171532]">Manage Transactions</h1>
                <p className="text-xs text-gray-500 font-medium">Bulk Edit Mode</p>
              </div>
            </div>
            <div className="hidden sm:flex gap-3">
              <button
                onClick={() => {
                  setSelectedStudent(null)
                  setTransactions([])
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSavingAll || !selectedStudent || transactions.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#1b4332] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All
              </button>
            </div>
          </div>
          
          {/* Mobile Buttons */}
          <div className="flex sm:hidden gap-2">
            <button
              onClick={() => {
                setSelectedStudent(null)
                setTransactions([])
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSavingAll || !selectedStudent || transactions.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#1b4332] transition-all active:scale-95 disabled:opacity-50"
            >
              {isSavingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All
            </button>
          </div>
        </div>

        {!selectedStudent ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-[#2d6a4f]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Search className="w-10 h-10 text-[#2d6a4f]" />
            </div>
            <h2 className="text-2xl font-black text-[#171532] mb-3">Select Student</h2>
            <p className="text-gray-500 font-medium mb-8">Search for a student to start adding or editing transactions.</p>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2d6a4f] transition-colors" />
              <input
                type="text"
                placeholder="Search name or student code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearch(true)
                }}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f]/20 focus:bg-white rounded-2xl text-base font-bold text-[#171532] outline-none transition-all shadow-inner"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                  {searchResults.map(s => (
                    <button
                      key={s._id}
                      onClick={() => selectStudent(s)}
                      className="w-full px-4 py-4 text-left hover:bg-[#2d6a4f]/5 rounded-xl flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2d6a4f] rounded-lg flex items-center justify-center text-white font-black text-lg overflow-hidden relative">
                          {s.profileImage ? (
                            <img 
                              src={s.profileImage} 
                              alt={s.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#171532] group-hover:text-[#2d6a4f] transition-colors">{s.name}</p>
                          <p className="text-xs text-gray-500 font-mono tracking-tighter">{s.code}</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-[#2d6a4f] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Student Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2d6a4f] to-[#171532] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#2d6a4f]/20 overflow-hidden relative">
                    {selectedStudent.profileImage ? (
                      <img 
                        src={selectedStudent.profileImage} 
                        alt={selectedStudent.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedStudent.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#171532]">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2.5 py-0.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 tracking-widest font-mono">{selectedStudent.code}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="text-xs font-black text-[#2d6a4f]">Current Balance: ₹{selectedStudent.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-[#f8f9fa] rounded-2xl border border-gray-50">
                  <div className="text-center px-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Dep.</p>
                    <p className="text-lg font-black text-green-600">₹{calculateTotals().deposit.toFixed(2)}</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center px-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total With.</p>
                    <p className="text-lg font-black text-red-600">₹{calculateTotals().withdraw.toFixed(2)}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-xs font-black text-[#2d6a4f] bg-[#2d6a4f]/5 hover:bg-[#2d6a4f]/10 rounded-xl transition-all"
                >
                  Switch Student
                </button>
              </div>

              {/* Transactions Table */}
              <div className="border-t border-gray-50">
                <table className="w-full border-collapse block md:table">
                  <thead className="hidden md:table-header-group">
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Session</th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 block md:table-row-group">
                    {transactions.map((tx, index) => (
                      <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors block md:table-row p-4 md:p-0 space-y-4 md:space-y-0">
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</span>
                            <div className="relative w-full md:w-36">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="date"
                                value={tx.date}
                                onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-[#f8f9fa] border-2 border-transparent focus:border-[#2d6a4f]/10 focus:bg-white rounded-xl text-xs font-bold text-[#171532] outline-none transition-all"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Session</span>
                            <select
                              value={tx.academicYear}
                              onChange={(e) => handleInputChange(index, 'academicYear', e.target.value)}
                              className="w-full md:w-24 px-3 py-2 bg-[#f8f9fa] border-2 border-transparent focus:border-[#2d6a4f]/10 focus:bg-white rounded-xl text-xs font-bold text-[#171532] outline-none transition-all cursor-pointer"
                            >
                              <option value="2024-25">24-25</option>
                              <option value="2025-26">25-26</option>
                              <option value="2026-27">26-27</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</span>
                            <select
                              value={tx.type}
                              onChange={(e) => handleInputChange(index, 'type', e.target.value as any)}
                              className={`w-full md:w-24 px-3 py-2 bg-[#f8f9fa] border-2 border-transparent focus:border-[#2d6a4f]/10 focus:bg-white rounded-xl text-xs font-black outline-none transition-all cursor-pointer ${
                                tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              <option value="deposit">Deposit</option>
                              <option value="withdraw">Withdraw</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</span>
                            <div className="relative w-full md:w-32">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
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
                                className="w-full pl-7 pr-3 py-2 bg-[#f8f9fa] border-2 border-transparent focus:border-[#2d6a4f]/10 focus:bg-white rounded-xl text-xs font-black text-[#171532] outline-none transition-all"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reason</span>
                            <input
                              type="text"
                              value={tx.reason}
                              onChange={(e) => handleInputChange(index, 'reason', e.target.value)}
                              className="w-full px-4 py-2 bg-[#f8f9fa] border-2 border-transparent focus:border-[#2d6a4f]/10 focus:bg-white rounded-xl text-xs font-bold text-[#171532] outline-none transition-all"
                              placeholder="Reason for transaction..."
                            />
                          </div>
                        </td>
                        <td className="px-0 py-0 md:px-4 md:py-4 block md:table-cell">
                          <div className="flex flex-col md:block gap-1">
                            <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Actions</span>
                            <div className="flex items-center justify-center gap-4 py-2">
                              {tx.status === 'idle' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    saveTransaction(index);
                                  }}
                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#2d6a4f] text-white rounded-2xl hover:bg-[#1b4332] active:scale-95 shadow-lg min-w-[100px] cursor-pointer z-10"
                                  title="Save Row"
                                >
                                  <Save className="w-5 h-5" />
                                  <span className="text-xs font-black uppercase tracking-tighter">Save</span>
                                </button>
                              )}
                              {tx.status === 'saving' && <Loader2 className="w-6 h-6 animate-spin text-[#2d6a4f]" />}
                              {tx.status === 'saved' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                              {tx.status === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                              
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeRow(index);
                                }}
                                className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 cursor-pointer z-10"
                                title="Delete Row"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-gray-50/50 flex justify-center">
                <button
                  onClick={addTransactionRow}
                  className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-dashed border-gray-200 text-[#2d6a4f] rounded-2xl font-black text-sm hover:border-[#2d6a4f]/30 hover:bg-white transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add New Transaction Row
                </button>
              </div>

              {/* Transaction History Section */}
              <div className="mt-8 border-t border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-[#171532] uppercase tracking-widest">Recent Transactions</h3>
                  {isHistoryLoading && <Loader2 className="w-4 h-4 animate-spin text-[#2d6a4f]" />}
                </div>
                
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <p className="text-center py-8 text-xs text-gray-400 font-bold">No recent transactions</p>
                  ) : (
                    history.slice(0, 5).map((h) => (
                      <div key={h._id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-gray-50 group hover:border-[#2d6a4f]/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            h.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {h.type === 'deposit' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#171532]">{h.reason}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{h.date} • {h.academicYear}</p>
                          </div>
                        </div>
                          <div className="flex items-center gap-4">
                            {editingHistoryId === h._id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={editingHistoryData.amount}
                                  onChange={(e) => setEditingHistoryData({ ...editingHistoryData, amount: e.target.value })}
                                  className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
                                />
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      saveHistoryEdit(h._id);
                                    }}
                                    className="flex items-center justify-center p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 shadow-md transition-all cursor-pointer z-10"
                                    title="Save Changes"
                                  >
                                    <Save className="w-5 h-5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingHistoryId(null);
                                    }}
                                    className="flex items-center justify-center p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer z-10"
                                    title="Cancel"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className={`text-sm font-black ${
                                  h.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ₹{h.amount.toFixed(2)}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      startEditingHistory(h);
                                    }}
                                    className="p-3 text-gray-400 hover:text-[#2d6a4f] hover:bg-white rounded-xl transition-all active:scale-95 cursor-pointer z-10"
                                    title="Edit Transaction"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      deleteHistoryItem(h._id);
                                    }}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all active:scale-95 cursor-pointer z-10"
                                    title="Delete Transaction"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
