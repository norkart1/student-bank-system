"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Process Transaction</DialogTitle>
          <DialogDescription>
            {depositToAll ? `All Students (${allStudents.length} students)` : `Student: ${student.name} (ID: ${student.studentId})`}
          </DialogDescription>
        </DialogHeader>

        {!depositToAll && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">${student.balance.toFixed(2)}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "deposit" | "withdraw")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="deposit" className="space-y-4">
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <input
                  id="deposit-to-all"
                  type="checkbox"
                  checked={depositToAll}
                  onChange={(e) => setDepositToAll(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="deposit-to-all" className="text-sm font-medium cursor-pointer mb-0">
                  Deposit Cash to All Students
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-date">Date</Label>
                <Input
                  id="deposit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-description">Description</Label>
                <Input
                  id="deposit-description"
                  placeholder="e.g., Monthly allowance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit-reason">Reason (Optional)</Label>
                <Input
                  id="deposit-reason"
                  placeholder="e.g., Scholarship, Gift"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                {depositToAll ? `Deposit to All ($${amount || "0.00"})` : `Deposit $${amount || "0.00"}`}
              </Button>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-date">Date</Label>
                <Input
                  id="withdraw-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-description">Description</Label>
                <Input
                  id="withdraw-description"
                  placeholder="e.g., Book purchase"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-reason">Reason (Optional)</Label>
                <Input
                  id="withdraw-reason"
                  placeholder="e.g., School supplies, Emergency"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Withdraw ${amount || "0.00"}
              </Button>
            </TabsContent>
          </form>
        </Tabs>

        {student.transactions && student.transactions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Transactions
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {student.transactions
                .slice(-5)
                .reverse()
                .map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {transaction.type === "deposit" ? (
                        <ArrowDownRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-bold ${transaction.type === "deposit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
