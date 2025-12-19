"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, DollarSign, Search } from "lucide-react"
import { TransactionDialog } from "@/components/transaction-dialog"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: string
  name: string
  email: string
  studentId: string
  balance: number
  transactions?: Array<{
    id: string
    type: "deposit" | "withdraw"
    amount: number
    description: string
    date: string
    reason?: string
  }>
}

interface StudentListProps {
  students: Student[]
  onUpdateStudent: (student: Student) => void
  onDeleteStudent: (id: string) => void
}

export function StudentList({ students, onUpdateStudent, onDeleteStudent }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleTransaction = (type: "deposit" | "withdraw", amount: number, description: string, date: string, reason: string) => {
    if (!selectedStudent) return

    const transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      date,
      reason: reason || undefined,
    }

    const newBalance = type === "deposit" ? selectedStudent.balance + amount : selectedStudent.balance - amount

    const updatedStudent = {
      ...selectedStudent,
      balance: newBalance,
      transactions: [...(selectedStudent.transactions || []), transaction],
    }

    onUpdateStudent(updatedStudent)
    setShowTransactionDialog(false)
    setSelectedStudent(null)
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No students added yet</p>
        <p className="text-gray-400 text-sm mt-2">Click "Add Student" to create a new account</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    ID: {student.studentId}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{student.email}</p>
                {student.transactions && student.transactions.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">
                      {student.transactions.length} transaction{student.transactions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-500 mb-1">Balance</p>
                  <p className={`text-xl font-bold ${student.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${student.balance.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(student)
                    setShowTransactionDialog(true)
                  }}
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Transaction
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteStudent(student.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        student={selectedStudent}
        onTransaction={handleTransaction}
      />
    </>
  )
}
