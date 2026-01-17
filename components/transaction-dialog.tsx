"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: any | null
  allStudents?: any[]
  onTransaction: (type: "deposit" | "withdraw", amount: number, description: string, date: string, reason: string, depositToAll?: boolean) => void
}

export function TransactionDialog({ open, onOpenChange, student, allStudents = [], onTransaction }: TransactionDialogProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState("")
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit")
  const [depositToAll, setDepositToAll] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number.parseFloat(amount)
    if (parsedAmount > 0) {
      onTransaction(activeTab, parsedAmount, description, date, reason, depositToAll)
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split('T')[0])
      setReason("")
      setDepositToAll(false)
    }
  }

  if (!student) return null

  const isDeposit = activeTab === "deposit"
  const title = isDeposit ? "Deposit Amount" : "Withdrawal Amount"
  const buttonColor = isDeposit ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-[#ef4444] hover:bg-[#dc2626]"
  const checkboxLabel = isDeposit ? "Deposit to All Students" : "Withdraw from All Students"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white p-0 border-0">
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-[#171532] mb-6">{title}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Deposit/Withdraw to All Option */}
            <div className="flex items-center gap-3 bg-[#fffacd] border border-[#f0e68c] rounded-lg p-3 mb-2">
              <input
                id="deposit-to-all"
                type="checkbox"
                checked={depositToAll}
                onChange={(e) => setDepositToAll(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <label htmlFor="deposit-to-all" className="text-[#171532] font-medium cursor-pointer flex-1">
                {checkboxLabel}
              </label>
            </div>

            {/* Select Student (if not depositing to all) */}
            {!depositToAll && (
              <div>
                <label className="block text-[#171532] font-semibold mb-2">Select Student</label>
                <div className="bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#747384]">
                  {student?.name || "Select a student..."}
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-[#171532] font-semibold mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#171532] placeholder-[#d1d5db] focus:outline-none focus:border-[#2d6a4f]"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[#171532] font-semibold mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#171532] focus:outline-none focus:border-[#2d6a4f]"
                required
              />
            </div>

            {/* Reason (Optional) */}
            <div>
              <label className="block text-[#171532] font-semibold mb-2">Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Scholarship, Gift"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#171532] placeholder-[#d1d5db] focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#171532] font-semibold px-4 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 ${buttonColor} text-white font-semibold px-4 py-3 rounded-lg transition-colors`}
              >
                {isDeposit ? "Deposit" : "Withdraw"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
