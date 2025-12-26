"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"

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
      }
    } catch (error) {
      toast.error("Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTransaction = (index: number, transaction: any) => {
    setEditingIndex(index)
    setEditValues({ ...transaction })
  }

  const handleSaveTransaction = async (index: number) => {
    if (!selectedStudent) return

    if (!editValues.date || !editValues.amount) {
      toast.error("Please fill in all fields")
      return
    }

    if (isNaN(parseFloat(editValues.amount))) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const response = await fetch(`/api/students/${selectedStudent._id}/transaction/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: index,
          date: editValues.date,
          type: editValues.type,
          amount: parseFloat(editValues.amount)
        })
      })

      if (response.ok) {
        toast.success("Transaction updated successfully")
        setEditingIndex(null)
        loadStudents()
        
        // Re-select the student to refresh their data
        const updated = await response.json()
        setSelectedStudent(updated.student)
      } else {
        toast.error("Failed to update transaction")
      }
    } catch (error) {
      toast.error("Error updating transaction")
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredStudents.map((student) => (
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
              ))}
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
                            {/* Date Input */}
                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Date
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

                            {/* Amount Input */}
                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Amount
                              </label>
                              <input
                                type="number"
                                value={editValues.amount}
                                onChange={(e) =>
                                  setEditValues({ ...editValues, amount: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:border-[#4a6670]"
                              />
                            </div>

                            {/* Type (Read-only) */}
                            <div>
                              <label className="block text-sm font-medium text-[#171532] mb-1">
                                Type
                              </label>
                              <div className="px-3 py-2 bg-[#f8f9fa] rounded-lg text-sm capitalize text-[#747384]">
                                {editValues.type}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSaveTransaction(idx)}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0fa06f] text-white px-3 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#171532] px-3 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[#171532]">{transaction.date}</p>
                              <p className="text-sm text-[#747384] capitalize">
                                {transaction.type}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-lg text-[#171532]">
                                ₹{transaction.amount?.toFixed(2)}
                              </p>
                              <button
                                onClick={() => handleEditTransaction(idx, transaction)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Edit transaction"
                              >
                                <Edit2 className="w-5 h-5" />
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
    </div>
  )
}
