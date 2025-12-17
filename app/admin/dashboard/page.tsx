"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, TrendingUp, Activity, LogOut, Plus } from "lucide-react"
import { StudentList } from "@/components/student-list"
import { AddStudentDialog } from "@/components/add-student-dialog"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [showAddStudent, setShowAddStudent] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthenticated")
    const role = localStorage.getItem("userRole")
    if (auth !== "true" || role !== "admin") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      // Load students from localStorage
      const savedStudents = localStorage.getItem("students")
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents))
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const handleAddStudent = (student: any) => {
    const newStudent = {
      ...student,
      id: Date.now().toString(),
      balance: Number.parseFloat(student.balance) || 0,
      transactions: [],
    }
    const updatedStudents = [...students, newStudent]
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
    setShowAddStudent(false)
  }

  const handleUpdateStudent = (updatedStudent: any) => {
    const updatedStudents = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
  }

  const handleDeleteStudent = (studentId: string) => {
    const updatedStudents = students.filter((s) => s.id !== studentId)
    setStudents(updatedStudents)
    localStorage.setItem("students", JSON.stringify(updatedStudents))
  }

  if (!isAuthenticated) {
    return null
  }

  const totalStudents = students.length
  const totalBalance = students.reduce((sum, s) => sum + s.balance, 0)
  const totalTransactions = students.reduce((sum, s) => sum + (s.transactions?.length || 0), 0)
  const averageBalance = totalStudents > 0 ? totalBalance / totalStudents : 0

  return (
    <div className="min-h-screen bg-[#f8f7fc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e0ec] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7056B2] to-[#55389B] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#171532]">JDSA Students Bank</h1>
                <p className="text-sm text-[#747384]">Admin Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="w-5 h-5 text-[#7056B2]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStudents}</div>
              <p className="text-xs text-gray-500 mt-1">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
              <DollarSign className="w-5 h-5 text-[#D975BB]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
              <TrendingUp className="w-5 h-5 text-[#8462E1]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTransactions}</div>
              <p className="text-xs text-gray-500 mt-1">Total processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Balance</CardTitle>
              <Activity className="w-5 h-5 text-[#55389B]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${averageBalance.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Per student</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Accounts</CardTitle>
                <CardDescription>Manage student bank accounts and transactions</CardDescription>
              </div>
              <Button onClick={() => setShowAddStudent(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StudentList
              students={students}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          </CardContent>
        </Card>
      </main>

      <AddStudentDialog open={showAddStudent} onOpenChange={setShowAddStudent} onAddStudent={handleAddStudent} />
    </div>
  )
}
