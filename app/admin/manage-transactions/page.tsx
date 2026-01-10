"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2, Save, X, Trash2, Loader } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/app/components/ConfirmDialog"
import { useDebounce } from "@/app/hooks/useDebounce"

interface Student {
  _id: string
  name: string
  code: string
  balance: number
  transactions: Array<{
    date: string
    type: string
    amount: number
  }>
}

export default function ManageTransactions() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; index: number | null }>({
    open: false,
    index: null,
  })

  // Debounce search query for better performance
  const debouncedSearch = useDebounce(searchQuery, 200)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        if (selectedStudent) {
          const updated = data.find((s: Student) => s._id === selectedStudent._id)
          if (updated) setSelectedStudent(updated)
        }
      }
    } catch (error) {
      console.error("Failed to load students:", error)
      toast.error("Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

    const handleEditTransaction = (index: number, transaction: any) => {
    setEditingIndex(index)
    setEditValues({ 
      ...transaction,
      academicYear: transaction.academicYear || "2025-26" 
    })
  }

  const handleSaveTransaction = async (index: number) => {
    if (!selectedStudent) return

    if (!editValues.date || !editValues.amount) {
      toast.error("Please fill in all fields")
      return
    }

    if (isNaN(parseFloat(editValues.amount)) || parseFloat(editValues.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/students/${selectedStudent._id}/transaction/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: index,
          date: editValues.date,
          type: editValues.type,
          amount: parseFloat(editValues.amount),
          academicYear: editValues.academicYear
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedStudent(data.student)
        setEditingIndex(null)
        setEditValues({})
        toast.success("✓ Transaction updated successfully")
        await loadStudents()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update transaction")
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast.error("Error updating transaction")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStudent || deleteConfirm.index === null) return

    try {
      const response = await fetch(`/api/students/${selectedStudent._id}/transaction/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: deleteConfirm.index })
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedStudent(data.student)
        toast.success("✓ Transaction deleted successfully")
        await loadStudents()
        setDeleteConfirm({ open: false, index: null })
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Error deleting transaction")
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#4a6670] rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[#747384]">Loading students...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <h1 className="text-3xl font-bold text-[#171532]">Manage Transactions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#171532] mb-4">Select Student</h2>
            
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg mb-4 focus:outline-none focus:border-[#4a6670]"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStudent?._id === student._id
                        ? "bg-[#4a6670] text-white"
                        : "bg-[#f8f9fa] hover:bg-[#e8eef5] text-[#171532]"
                    }`}
                  >
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-[#747384]">{student.code}</p>
                    <p className="text-xs mt-1">Balance: ₹{student.balance?.toFixed(2)}</p>
                  </button>
                ))
              ) : (
                <p className="text-center text-[#747384] py-4">No students found</p>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            {selectedStudent ? (
              <>
                <h2 className="text-xl font-semibold text-[#171532] mb-4">
                  {selectedStudent.name}'s Transactions
                </h2>
                
                {selectedStudent.transactions && selectedStudent.transactions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedStudent.transactions.map((transaction, idx) => (
                      <div
                        key={idx}
                        className="border border-[#e5e7eb] rounded-lg p-4 hover:border-[#4a6670] transition-colors"
                      >
                        {editingIndex === idx ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Date (dd/MM/yyyy)
                              </label>
                              <input
                                type="text"
                                placeholder="dd/MM/yyyy"
                                value={editValues.date}
                                onChange={(e) =>
                                  setEditValues({ ...editValues, date: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#4a6670]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Amount
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editValues.amount}
                                onChange={(e) =>
                                  setEditValues({ ...editValues, amount: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#4a6670]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Academic Year
                              </label>
                              <select
                                value={editValues.academicYear || "2025-26"}
                                onChange={(e) =>
                                  setEditValues({ ...editValues, academicYear: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#4a6670]"
                              >
                                <option value="2023-24">2023-24</option>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                                <option value="2026-27">2026-27</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Type
                              </label>
                              <div className="px-3 py-2 bg-[#f8f9fa] rounded-lg text-sm capitalize text-[#747384]">
                                {editValues.type}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSaveTransaction(idx)}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#4a6670] hover:bg-[#3d565e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    Save
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIndex(null)
                                  setEditValues({})
                                }}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#e5e7eb] hover:bg-[#d1d5db] disabled:opacity-50 text-[#171532] px-3 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-[#171532]">{transaction.date}</p>
                              <div className="mt-1 inline-flex">
                                {transaction.type === 'deposit' ? (
                                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                                    ↓ Deposit
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                                    ↑ Withdraw
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-lg text-[#171532] min-w-[100px] text-right">
                                ₹{transaction.amount?.toFixed(2)}
                              </p>
                              <button
                                onClick={() => handleEditTransaction(idx, transaction)}
                                disabled={deleteConfirm.open || isSaving}
                                className="flex items-center justify-center p-2 hover:bg-blue-100 disabled:opacity-50 text-blue-600 rounded-lg transition-colors"
                                title="Edit transaction"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({ open: true, index: idx })
                                }
                                disabled={deleteConfirm.open || isSaving}
                                className="flex items-center justify-center p-2 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-lg transition-colors"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#747384] py-8">
                    No transactions for this student
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-96 text-center">
                <p className="text-[#747384]">Select a student to view their transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, index: null })}
        isLoading={false}
        isDangerous={true}
      />
    </div>
  )
}
