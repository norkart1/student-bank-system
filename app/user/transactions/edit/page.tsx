"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2, Trash2, Plus } from "lucide-react"
import { format, parse } from "date-fns"
import { toast } from "sonner"

export default function EditTransactions() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<any>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    date: format(new Date(), "dd/MM/yyyy"),
    type: "deposit",
    amount: ""
  })

  const loadUserData = async () => {
    try {
      const verifyRes = await fetch('/api/auth/verify')
      if (!verifyRes.ok) {
        router.push("/login")
        return
      }
      
      const session = await verifyRes.json()
      const studentId = session.userData.id

      const res = await fetch(`/api/students/${studentId}`, {
        cache: 'no-store',
      })
      
      if (!res.ok) return
      
      const student = await res.json()
      setUserData({
        id: student._id,
        transactions: student.transactions || [],
      })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const handleEdit = (idx: number, transaction: any) => {
    setEditingId(idx)
    setEditValues({
      ...transaction
    })
  }

  const handleSave = async (idx: number) => {
    if (!editValues.amount || isNaN(parseFloat(editValues.amount))) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const response = await fetch(`/api/students/${userData.id}/transaction/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: idx,
          ...editValues,
          amount: parseFloat(editValues.amount)
        })
      })

      if (response.ok) {
        toast.success("Transaction updated successfully")
        setEditingId(null)
        loadUserData()
      } else {
        toast.error("Failed to update transaction")
      }
    } catch (error) {
      toast.error("Error updating transaction")
    }
  }

  const handleDelete = async (idx: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      const response = await fetch(`/api/students/${userData.id}/transaction/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: idx })
      })

      if (response.ok) {
        toast.success("Transaction deleted successfully")
        loadUserData()
      } else {
        toast.error("Failed to delete transaction")
      }
    } catch (error) {
      toast.error("Error deleting transaction")
    }
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || isNaN(parseFloat(newTransaction.amount))) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const response = await fetch(`/api/students/${userData.id}/transaction/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newTransaction.date,
          type: newTransaction.type,
          amount: parseFloat(newTransaction.amount)
        })
      })

      if (response.ok) {
        toast.success("Transaction added successfully")
        setShowAddForm(false)
        setNewTransaction({
          date: format(new Date(), "dd/MM/yyyy"),
          type: "deposit",
          amount: ""
        })
        loadUserData()
      } else {
        toast.error("Failed to add transaction")
      }
    } catch (error) {
      toast.error("Error adding transaction")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
        <div className="max-w-md mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#4a6670] rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-[#4a6670]" />
            <h1 className="text-2xl font-bold text-[#171532]">Edit Transactions</h1>
          </div>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0fa06f] text-white px-4 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Transaction
        </button>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#171532] mb-4">New Transaction</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Date (dd/MM/yyyy)"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#4a6670]"
              />
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#4a6670]"
              >
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdrawal</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="w-full px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:border-[#4a6670]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 bg-[#4a6670] hover:bg-[#3d565e] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#171532] px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#171532] mb-4">All Transactions</h3>
          
          {userData?.transactions && userData.transactions.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {userData.transactions.map((transaction: any, idx: number) => (
                <div key={idx} className="border border-[#e5e7eb] rounded-lg p-4">
                  {editingId === idx ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editValues.date}
                        onChange={(e) => setEditValues({...editValues, date: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm"
                      />
                      <select
                        value={editValues.type}
                        onChange={(e) => setEditValues({...editValues, type: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm"
                      >
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdrawal</option>
                      </select>
                      <input
                        type="number"
                        value={editValues.amount}
                        onChange={(e) => setEditValues({...editValues, amount: e.target.value})}
                        className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(idx)}
                          className="flex-1 bg-[#10B981] hover:bg-[#0fa06f] text-white px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-[#e5e7eb] text-[#171532] px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#171532]">{transaction.date}</p>
                        <p className="text-sm text-[#747384] capitalize">{transaction.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#171532]">₹{transaction.amount?.toFixed(2)}</p>
                        <button
                          onClick={() => handleEdit(idx, transaction)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#747384] py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
