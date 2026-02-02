"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Users, CreditCard, MoreHorizontal, Send, QrCode, Bell, Grid3X3, ArrowDownRight, ArrowUpRight, Wallet, Plus, X, Camera, Trophy, Edit, Trash2, BarChart3, Sparkles, HelpCircle, MessageSquare, Settings, LogOut, Share2, Star, Lock, Info, ChevronLeft, ChevronDown, Activity, Moon, Sun, Download, Calendar, AlertCircle, Zap, Search, Upload, CalendarRange, Loader } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { defaultStudents } from "@/lib/students"
import { usePusherAdminUpdates } from "@/lib/hooks/usePusher"

interface Transaction {
  type: string
  amount: number
  date?: string
  reason?: string
  academicYear?: string
}

interface Student {
  _id?: string
  id?: string
  name: string
  code?: string
  mobile?: string
  email?: string
  username?: string
  password?: string
  profileImage?: string
  academicYear?: string
  balance: number
  transactions: Transaction[]
}

const avatarColors = ['bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100']

export default function AdminDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [currentDate, setCurrentDate] = useState("")
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalDeposited, setTotalDeposited] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [showAddYearForm, setShowAddYearForm] = useState(false)
  const [newYearInput, setNewYearYearInput] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [useOldCode, setUseOldCode] = useState(false)
  const [oldStudentCode, setOldStudentCode] = useState("")
  const [isSearchingOldStudent, setIsSearchingOldStudent] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<{ studentIndex: number, transactionIndex: number } | null>(null)
  const [editTxAmount, setEditTxAmount] = useState("")
  const [editTxDate, setEditTxDate] = useState("")
  const [editTxReason, setEditTxReason] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    mobile: "",
    email: "",
    profileImage: "",
    academicYear: "2025-26"
  })
  const [adminName, setAdminName] = useState("")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminRating, setAdminRating] = useState(0)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [mongoHealth, setMongoHealth] = useState(0)
  const [cpuHealth, setCpuHealth] = useState(0)
  const setRealTimeStatus = (status: any) => {
    setSystemStatus(status);
    if (typeof status === 'object' && status !== null) {
      if (status.cpu?.percentage !== undefined) setCpuHealth(100 - status.cpu.percentage);
      if (status.mongodb?.percentage !== undefined) setMongoHealth(100 - status.mongodb.percentage);
    }
  }
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [transactionAmount, setTransactionAmount] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [transactionReason, setTransactionReason] = useState("")
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [showDepositDropdown, setShowDepositDropdown] = useState(false)
  const [showWithdrawDropdown, setShowWithdrawDropdown] = useState(false)
  const [reportType, setReportType] = useState<'date' | 'monthly' | 'yearly' | 'personal'>('date')
  const [startDate, setStartDate] = useState(new Date(2025, 11, 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedPersonalStudent, setSelectedPersonalStudent] = useState<number | null>(null)
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [aiInput, setAiInput] = useState("")
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [depositAllStudents, setDepositAllStudents] = useState(false)
  const [withdrawAllStudents, setWithdrawAllStudents] = useState(false)
  const [adminSessions, setAdminSessions] = useState<any[]>([])
  const [showAdminStatus, setShowAdminStatus] = useState(false)

  useEffect(() => {
    if (showAdminStatus) {
      fetchAdminSessions()
    }
  }, [showAdminStatus])

  const fetchAdminSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions')
      if (res.ok) {
        const data = await res.json()
        setAdminSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin sessions')
    }
  }

  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrScannerStep, setQrScannerStep] = useState<'scan' | 'result'>('scan')
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [searchDialogQuery, setSearchDialogQuery] = useState("")
  const [searchDialogType, setSearchDialogType] = useState<"code" | "name">("code")
  const [isSearchDialogLoading, setIsSearchDialogLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<any>(null)
  const [isScannerReady, setIsScannerReady] = useState(false)

  useEffect(() => {
    if (showQRScanner && videoRef.current) {
      const initScanner = async () => {
        try {
          const QrScanner = (await import('qr-scanner')).default
          const qrScanner = new QrScanner(
            videoRef.current!,
            (result) => {
              if (result?.data) {
                const scannedValue = result.data.toString().trim()
                setSearchDialogQuery(scannedValue)
                setSearchDialogType("code")
                setShowQRScanner(false)
                handleSearchDialogSubmit(null, scannedValue)
              }
            },
            {
              preferredCamera: "environment",
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          )
          qrScannerRef.current = qrScanner
          qrScanner.start()
            .then(() => setIsScannerReady(true))
            .catch(err => {
              console.error(err)
              setShowQRScanner(false)
              toast.error("Camera access denied")
            })
        } catch (err) {
          console.error("QR Scanner dynamic import failed:", err)
          setShowQRScanner(false)
          toast.error("Failed to load scanner")
        }
      }
      initScanner()
      return () => {
        if (qrScannerRef.current) {
          qrScannerRef.current.destroy()
          qrScannerRef.current = null
        }
      }
    }
  }, [showQRScanner])

  const handleSearchDialogSubmit = async (e: any, overrideQuery?: string) => {
    if (e) e.preventDefault()
    const query = overrideQuery || searchDialogQuery
    if (!query) return

    setIsSearchDialogLoading(true)
    try {
      const endpoint = searchDialogType === "code" 
        ? `code=${encodeURIComponent(query.toUpperCase())}` 
        : `name=${encodeURIComponent(query)}`
      
      const res = await fetch(`/api/students/search?${endpoint}`)
      if (!res.ok) {
        toast.error("Student not found")
        setIsSearchDialogLoading(false)
        return
      }

      const student = await res.json()
      const index = students.findIndex(s => s._id === student._id)
      if (index !== -1) {
        setViewingIndex(index)
        setShowSearchDialog(false)
        setSearchDialogQuery("")
      } else {
        toast.error("Student not found in current list")
      }
    } catch (err) {
      toast.error("Search failed")
    } finally {
      setIsSearchDialogLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!transactionAmount || isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    if (!depositAllStudents && selectedStudentIndex === null) {
      setNotification({ type: 'error', message: 'Please select a student' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    try {
      const amount = parseFloat(transactionAmount)
      const updatedStudents = [...students]
      const targetStudents = depositAllStudents ? updatedStudents : [updatedStudents[selectedStudentIndex!]]
      
      for (const student of targetStudents) {
        if (!student._id) continue
        
        student.balance += amount
        student.transactions.push({
          type: 'deposit',
          amount: amount,
          date: new Date(transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reason: transactionReason || undefined,
          academicYear: selectedAcademicYear
        })
        
        if (student.transactions.length > 100) {
          student.transactions = student.transactions.slice(-100)
        }
        
        // Update in database
        await fetch(`/api/students/${student._id}`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student)
        })
        
        // Save to deposits collection
        try {
          await fetch('/api/transactions/deposits', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: student._id,
              studentName: student.name,
              studentCode: student.code,
              amount: amount,
              date: transactionDate,
              reason: transactionReason || undefined
            })
          })
        } catch (err) {
          console.error('Deposit record error:', err)
        }
        
        // Broadcast real-time update
        try {
          await fetch('/api/pusher/broadcast', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: 'balance-update',
              studentId: student._id,
              update: {
                balance: student.balance,
                amount: amount,
                studentName: student.name
              }
            })
          })
        } catch (err) {
          console.error('Broadcast error:', err)
        }
      }
      
      setStudents(updatedStudents)
      calculateTotals(updatedStudents)
      
      setShowDepositModal(false)
      setTransactionAmount("")
      setTransactionDate(new Date().toISOString().split('T')[0])
      setTransactionReason("")
      setSelectedStudentIndex(null)
      setDepositAllStudents(false)
      const message = depositAllStudents ? `Deposit of ₹${amount.toFixed(2)} to all ${students.length} students successful!` : `Deposit of ₹${amount.toFixed(2)} successful!`
      setNotification({ type: 'success', message })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to process deposit' })
      setTimeout(() => setNotification(null), 3000)
      console.error('Deposit error:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!transactionAmount || isNaN(parseFloat(transactionAmount)) || parseFloat(transactionAmount) <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    if (!withdrawAllStudents && selectedStudentIndex === null) {
      setNotification({ type: 'error', message: 'Please select a student' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    try {
      const amount = parseFloat(transactionAmount)
      const updatedStudents = [...students]
      const targetStudents = withdrawAllStudents ? updatedStudents : [updatedStudents[selectedStudentIndex!]]
      
      for (const student of targetStudents) {
        if (!student._id) continue
        
        if (student.balance < amount) {
          if (!withdrawAllStudents) {
            setNotification({ type: 'error', message: `Insufficient balance. Available: ₹${student.balance.toFixed(2)}` })
            setTimeout(() => setNotification(null), 3000)
            return
          }
          continue
        }
        
        student.balance -= amount
        student.transactions.push({
          type: 'withdraw',
          amount: amount,
          date: new Date(transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reason: transactionReason || undefined,
          academicYear: selectedAcademicYear
        })
        
        if (student.transactions.length > 100) {
          student.transactions = student.transactions.slice(-100)
        }
        
        // Update in database
        await fetch(`/api/students/${student._id}`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student)
        })
        
        // Save to withdrawals collection
        try {
          await fetch('/api/transactions/withdrawals', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: student._id,
              studentName: student.name,
              studentCode: student.code,
              amount: amount,
              date: transactionDate,
              reason: transactionReason || undefined
            })
          })
        } catch (err) {
          console.error('Withdrawal record error:', err)
        }
        
        // Broadcast real-time update
        try {
          await fetch('/api/pusher/broadcast', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: 'balance-update',
              studentId: student._id,
              update: {
                balance: student.balance,
                amount: amount,
                studentName: student.name
              }
            })
          })
        } catch (err) {
          console.error('Broadcast error:', err)
        }
      }
      
      setStudents(updatedStudents)
      calculateTotals(updatedStudents)
      
      setShowWithdrawModal(false)
      setTransactionAmount("")
      setTransactionDate(new Date().toISOString().split('T')[0])
      setTransactionReason("")
      setSelectedStudentIndex(null)
      setWithdrawAllStudents(false)
      const message = withdrawAllStudents ? `Withdrawal of ₹${amount.toFixed(2)} from all eligible students successful!` : `Withdrawal of ₹${amount.toFixed(2)} successful!`
      setNotification({ type: 'success', message })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to process withdrawal' })
      setTimeout(() => setNotification(null), 3000)
      console.error('Withdrawal error:', error)
    }
  }

  const filterTransactionsByDate = (student: Student, start: Date, end: Date) => {
    return student.transactions.filter(t => {
      if (!t.date) return false
      const tDate = new Date(t.date)
      return tDate >= start && tDate <= end
    })
  }

  const generateDateReport = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const reportData: any[] = []
    
    students.forEach(student => {
      const filtered = filterTransactionsByDate(student, start, end)
      const deposits = filtered.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
      const withdraws = filtered.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0)
      
      reportData.push({
        'Student': student.name,
        'Username': student.username,
        'Deposits': deposits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Withdrawals': withdraws.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Net Change': (deposits - withdraws).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Final Balance': student.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      })
    })
    return reportData
  }

  const generateMonthlyReport = () => {
    const [year, month] = selectedMonth.split('-')
    const start = new Date(parseInt(year), parseInt(month) - 1, 1)
    const end = new Date(parseInt(year), parseInt(month), 0)
    return generateDateReport()
  }

  const generateYearlyReport = () => {
    const year = parseInt(selectedYear)
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    return generateDateReport()
  }

  const generatePersonalReport = () => {
    if (selectedPersonalStudent === null) return []
    const student = students[selectedPersonalStudent]
    if (!student) return []
    
    return student.transactions.map((t, idx) => ({
      'S.No': (idx + 1).toString(),
      'Type': t.type.charAt(0).toUpperCase() + t.type.slice(1),
      'Amount': t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Date': t.date || 'N/A'
    }))
  }

  const getReportData = () => {
    if (reportType === 'date') return generateDateReport()
    if (reportType === 'monthly') return generateMonthlyReport()
    if (reportType === 'yearly') return generateYearlyReport()
    return generatePersonalReport()
  }

  const downloadPDF = () => {
    const data = getReportData()
    if (data.length === 0) {
      setNotification({ type: "error", message: "No data available for this report" })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Title & Header
    doc.setFontSize(20)
    doc.setTextColor(74, 102, 112) // #2d6a4f
    doc.text("JDSA STUDENTS BANK", pageWidth / 2, 20, { align: "center" })

    doc.setFontSize(14)
    doc.setTextColor(23, 21, 50) // #171532
    const reportTitle =
      reportType === "date"
        ? `Transaction Report: ${startDate} to ${endDate}`
        : reportType === "monthly"
          ? `Monthly Report: ${selectedMonth}`
          : reportType === "yearly"
            ? `Yearly Report: ${selectedYear}`
            : `Personal Report: ${students[selectedPersonalStudent!]?.name || "N/A"}`
    doc.text(reportTitle, pageWidth / 2, 30, { align: "center" })

    // Report Meta
    doc.setFontSize(10)
    doc.setTextColor(23, 21, 50) 
    doc.text(`Student Name: ${students[selectedPersonalStudent!]?.name || "N/A"}`, 14, 45)
    doc.text(`Student Code: ${students[selectedPersonalStudent!]?.code || "N/A"}`, 14, 51)
    doc.text(`Academic Session: ${selectedAcademicYear}`, 14, 57)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 45, { align: "right" })

    const columns = Object.keys(data[0])
    const rows = data.map((item) => Object.values(item)) as any[][]

    autoTable(doc, {
      startY: 70,
      head: [["Date", "Dep.", "With.", "Bal."]],
      body: data.map((item: any) => [
        item.Date || "-",
        item.Deposits !== "0.00" ? item.Deposits : "-",
        item.Withdrawals !== "0.00" ? item.Withdrawals : "-",
        item["Final Balance"] || "-",
      ]),
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [74, 102, 112], // #2d6a4f
        textColor: [255, 255, 255],
        fontStyle: "bold",
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40, textColor: [22, 163, 74] }, // Green for Deposits
        2: { cellWidth: 40, textColor: [220, 38, 38] }, // Red for Withdrawals
        3: { cellWidth: 40, fontStyle: "bold" },
      },
      margin: { left: (pageWidth - 160) / 2 },
    })

    doc.save(`JDSA_Report_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`)
    setNotification({ type: "success", message: "PDF downloaded successfully!" })
    setTimeout(() => setNotification(null), 3000)
  }

  const downloadExcel = () => {
    const data = getReportData()
    if (data.length === 0) {
      setNotification({ type: 'error', message: 'No data available for this report' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `JDSA_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    setNotification({ type: 'success', message: 'Excel file downloaded successfully!' })
    setTimeout(() => setNotification(null), 3000)
  }

  const renderReportsTab = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#2d6a4f] dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-[#171532] dark:text-white">Reports</h2>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[#f39c12] dark:text-[#f39c12]" />
          ) : (
            <Moon className="w-5 h-5 text-[#2d6a4f]" />
          )}
        </button>
      </div>

      <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-3">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                {academicYears.filter(y => !["2023-24", "2024-25", "2025-26", "2026-27"].includes(y)).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-3">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
          >
            <option value="date">Selected Date Range</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
            <option value="personal">Individual Student</option>
          </select>
        </div>

        {reportType === 'date' && (
          <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
              />
            </div>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-3">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
            />
          </div>
        )}

        {reportType === 'yearly' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-3">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'personal' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-3">Select Student</label>
            <select
              value={selectedPersonalStudent ?? ""}
              onChange={(e) => setSelectedPersonalStudent(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white"
            >
              <option value="">Choose a student...</option>
              {students.map((student, idx) => (
                <option key={idx} value={idx}>{student.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#dc2626] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0fa06f] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>
    </>
  )

  const renderNotification = () => {
    if (!notification) return null
    return (
      <div className="fixed top-6 right-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
        <div className={`rounded-xl px-6 py-4 shadow-xl backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-[#10B981]/95 border-[#10B981] text-white' 
            : 'bg-[#EF4444]/95 border-[#EF4444] text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-sm font-bold">✓</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-sm font-bold">!</span>
              </div>
            )}
            <p className="font-medium text-sm">{notification.message}</p>
          </div>
        </div>
      </div>
    )
  }


  const renderDepositModal = () => {
    if (!showDepositModal) return null
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-in scale-in duration-200">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#171532] dark:text-white">Deposit Amount</h3>
            <div className="flex items-center gap-2 bg-[#f8f9fa] dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-[#e8e8e8] dark:border-slate-600">
              <CalendarRange className="w-3.5 h-3.5 text-[#2d6a4f] dark:text-slate-400" />
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2d6a4f] dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                {academicYears.filter(y => !["2023-24", "2024-25", "2025-26", "2026-27"].includes(y)).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-slate-700 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
              <input
                type="checkbox"
                id="deposit-all"
                checked={depositAllStudents}
                onChange={(e) => {
                  setDepositAllStudents(e.target.checked)
                  if (e.target.checked) setSelectedStudentIndex(null)
                }}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="deposit-all" className="text-sm font-semibold text-[#171532] dark:text-white cursor-pointer">
                Deposit to All Students
              </label>
            </div>

            {!depositAllStudents && (
            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Select Student</label>
              <div className="relative">
                <button
                  onClick={() => setShowDepositDropdown(!showDepositDropdown)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white text-left flex items-center justify-between hover:border-[#2d6a4f] dark:hover:border-slate-500 transition-colors"
                >
                  <span>{selectedStudentIndex !== null ? students[selectedStudentIndex]?.name : 'Choose a student...'}</span>
                  <svg className={`w-5 h-5 transition-transform ${showDepositDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                
                {showDepositDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {students.map((student, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedStudentIndex(idx)
                          setShowDepositDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-600 border-b border-gray-100 dark:border-slate-600 last:border-b-0 transition-colors text-[#171532] dark:text-white"
                      >
                        <div className="font-medium">{student.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Amount (₹)</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white placeholder:text-[#a0a0a0]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Reason (Optional)</label>
              <input
                type="text"
                value={transactionReason}
                onChange={(e) => setTransactionReason(e.target.value)}
                placeholder="e.g., Scholarship, Gift"
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white placeholder:text-[#a0a0a0]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowDepositModal(false)
                  setTransactionAmount("")
                  setTransactionDate(new Date().toISOString().split('T')[0])
                  setTransactionReason("")
                  setSelectedStudentIndex(null)
                  setDepositAllStudents(false)
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-[#171532] dark:text-white bg-[#f0f0f0] dark:bg-slate-700 hover:bg-[#e5e5e5] dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#10B981] hover:bg-[#0fa06f] transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderWithdrawModal = () => {
    if (!showWithdrawModal) return null
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-in scale-in duration-200">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#171532] dark:text-white">Withdraw Amount</h3>
            <div className="flex items-center gap-2 bg-[#f8f9fa] dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-[#e8e8e8] dark:border-slate-600">
              <CalendarRange className="w-3.5 h-3.5 text-[#2d6a4f] dark:text-slate-400" />
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2d6a4f] dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                {academicYears.filter(y => !["2023-24", "2024-25", "2025-26", "2026-27"].includes(y)).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3 bg-red-50 dark:bg-slate-700 border border-red-200 dark:border-red-700 rounded-xl p-3">
              <input
                type="checkbox"
                id="withdraw-all"
                checked={withdrawAllStudents}
                onChange={(e) => {
                  setWithdrawAllStudents(e.target.checked)
                  if (e.target.checked) setSelectedStudentIndex(null)
                }}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="withdraw-all" className="text-sm font-semibold text-[#171532] dark:text-white cursor-pointer">
                Withdraw from All Students
              </label>
            </div>

            {!withdrawAllStudents && (
            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Select Student</label>
              <div className="relative">
                <button
                  onClick={() => setShowWithdrawDropdown(!showWithdrawDropdown)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl text-[#171532] dark:text-white text-left flex items-center justify-between hover:border-[#2d6a4f] dark:hover:border-slate-500 transition-colors"
                >
                  <span>{selectedStudentIndex !== null ? students[selectedStudentIndex]?.name : 'Choose a student...'}</span>
                  <svg className={`w-5 h-5 transition-transform ${showWithdrawDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                
                {showWithdrawDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {students.map((student, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedStudentIndex(idx)
                          setShowWithdrawDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#f0f0f0] dark:hover:bg-slate-600 border-b border-gray-100 dark:border-slate-600 last:border-b-0 transition-colors text-[#171532] dark:text-white"
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-[#747384] dark:text-gray-400">Balance: ₹{student.balance.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Amount (₹)</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white placeholder:text-[#a0a0a0]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#171532] dark:text-white mb-2">Reason (Optional)</label>
              <input
                type="text"
                value={transactionReason}
                onChange={(e) => setTransactionReason(e.target.value)}
                placeholder="e.g., School supplies, Emergency"
                className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-slate-700 border border-[#e8e8e8] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532] dark:text-white placeholder:text-[#a0a0a0]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowWithdrawModal(false)
                  setTransactionAmount("")
                  setTransactionDate(new Date().toISOString().split('T')[0])
                  setTransactionReason("")
                  setSelectedStudentIndex(null)
                  setWithdrawAllStudents(false)
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-[#171532] dark:text-white bg-[#f0f0f0] dark:bg-slate-700 hover:bg-[#e5e5e5] dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#EF4444] hover:bg-[#dc2626] transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }


  const renderMessageWithHighlight = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit image size to 10MB
      if (file.size > 10000000) {
        alert("Image size must be less than 10MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Compress if image is too large as base64 (over 5MB)
        if (result.length > 5000000) {
          const canvas = document.createElement('canvas')
          const img = new Image()
          img.onload = () => {
            canvas.width = img.width * 0.8
            canvas.height = img.height * 0.8
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              setNewStudent({...newStudent, profileImage: canvas.toDataURL('image/jpeg', 0.8)})
            }
          }
          img.src = result
        } else {
          setNewStudent({...newStudent, profileImage: result})
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditAccount = (index: number) => {
    const student = students[index]
    setNewStudent({
      name: student.name || '',
      mobile: student.mobile || '',
      email: student.email || '',
      profileImage: student.profileImage || '',
      academicYear: student.academicYear || '2024-25'
    })
    setEditingIndex(index)
    setShowEditForm(true)
  }

  const handleUpdateAccount = async () => {
    if (!newStudent.name) {
      alert("Please fill in the full name")
      return
    }

    if (editingIndex !== null) {
      const updatedStudents = [...students]
      const originalStudent = updatedStudents[editingIndex]
      
      // Preserve all fields and update with new values
      updatedStudents[editingIndex] = {
        ...originalStudent,
        name: newStudent.name,
        email: newStudent.email || originalStudent.email,
        mobile: newStudent.mobile || originalStudent.mobile,
        profileImage: newStudent.profileImage || originalStudent.profileImage || ''
      }
      
      setStudents(updatedStudents)
      calculateTotals(updatedStudents)
      
      try {
        // Update in database
        const updateData = {
          name: newStudent.name,
          email: newStudent.email || originalStudent.email || '',
          mobile: newStudent.mobile || originalStudent.mobile || '',
          profileImage: newStudent.profileImage || originalStudent.profileImage || ''
        }
        
        const res = await fetch(`/api/students/${originalStudent._id}`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newStudent,
            academicYear: newStudent.academicYear || originalStudent.academicYear || '2024-25'
          })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          console.error('Update error:', errorData)
          setNotification({ type: 'error', message: 'Failed to update account: ' + (errorData.error || 'Unknown error') })
          setTimeout(() => setNotification(null), 3000)
          return
        }
        
        setNewStudent({ name: "", mobile: "", email: "", profileImage: "", academicYear: "2024-25" })
        setEditingIndex(null)
        setShowEditForm(false)
        setNotification({ type: 'success', message: 'Account updated successfully!' })
        setTimeout(() => setNotification(null), 3000)
      } catch (error) {
        console.error('Update error:', error)
        setNotification({ type: 'error', message: 'Failed to update account' })
        setTimeout(() => setNotification(null), 3000)
      }
    }
  }

  const handleDeleteAccount = (index: number) => {
    setDeletingIndex(index)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAccount = async () => {
    if (deletingIndex !== null) {
      try {
        const deletedStudent = students[deletingIndex]
        
        // Delete from MongoDB if student has an ID
        if (deletedStudent._id) {
          const res = await fetch(`/api/students/${deletedStudent._id}`, {
            method: 'DELETE'
          })
          if (!res.ok) {
            throw new Error('Failed to delete from database')
          }
        }
        
        const updatedStudents = students.filter((_, i) => i !== deletingIndex)
        setStudents(updatedStudents)
        calculateTotals(updatedStudents)
        
        setShowDeleteConfirm(false)
        setDeletingIndex(null)
        setViewingIndex(null)
        setNotification({ type: 'success', message: 'Account deleted successfully!' })
        setTimeout(() => setNotification(null), 3000)
      } catch (error) {
        setNotification({ type: 'error', message: 'Failed to delete account' })
        setTimeout(() => setNotification(null), 3000)
      }
    }
  }

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false)
    setDeletingIndex(null)
  }

  const calculateTotals = (studentList: Student[]) => {
    let balance = 0
    let deposited = 0
    let withdrawn = 0
    
    studentList.forEach((student) => {
      // Calculate session-specific balance for each student
      const sessionTransactions = student.transactions?.filter(t => selectedAcademicYear === 'all' || (t.academicYear || '2025-26') === selectedAcademicYear) || []
      
      let studentSessionBalance = 0
      sessionTransactions.forEach((t) => {
        if (t.type === 'deposit') {
          deposited += t.amount || 0
          studentSessionBalance += t.amount || 0
        } else if (t.type === 'withdraw') {
          withdrawn += t.amount || 0
          studentSessionBalance -= t.amount || 0
        }
      })
      balance += studentSessionBalance
    })
    
    setTotalBalance(balance)
    setTotalDeposited(deposited)
    setTotalWithdrawn(withdrawn)
  }

  useEffect(() => {
    // Verify admin session from MongoDB
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/verify')
        if (!res.ok || (await res.json()).userType !== 'admin') {
          router.push("/login")
          return
        }
        setIsAuthenticated(true)
        setIsAuthLoading(false)
      } catch (error) {
        router.push("/login")
      }
    }
    
    verifySession()
    
    // Fetch students from MongoDB API
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/students?academicYear=${selectedAcademicYear}`)
        if (res.ok) {
          const studentList = await res.json()
          setStudents(studentList)
          calculateTotals(studentList)
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
      }
    }
    
    fetchStudents()
    
    // Fetch system status
    const fetchSystemStatus = async () => {
      try {
        const res = await fetch('/api/system/status')
        if (!res.ok) throw new Error('Status fetch failed');
        const data = await res.json()
        setSystemStatus(data)
        
        if (data.discord?.status === 'ONLINE') {
          setMongoHealth(prev => Math.max(prev, 90)); // Simulate boost if bot is on
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error)
      }
    }
    fetchSystemStatus()
    const statusInterval = setInterval(fetchSystemStatus, 5000)
    
    // Refresh students list every 3 seconds to get updates (slower to prevent lag)
    const studentRefreshInterval = setInterval(fetchStudents, 3000)
    
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    setCurrentDate(now.toLocaleDateString('en-US', options))
    
    return () => {
      clearInterval(statusInterval)
      clearInterval(studentRefreshInterval)
    }
  }, [selectedAcademicYear])

  // Use Pusher for real-time admin updates
  usePusherAdminUpdates((data) => {
    if (data.type === 'list-updated') {
      setRealTimeStatus(true)
      setTimeout(() => setRealTimeStatus(false), 2000)
    }
  })

  const handleSearchOldStudent = async (codeValue?: string) => {
    const codeToSearch = codeValue || oldStudentCode
    if (!codeToSearch) return
    setIsSearchingOldStudent(true)
    try {
      const res = await fetch(`/api/students/search?code=${codeToSearch}`)
      if (res.ok) {
        const student = await res.json()
        setNewStudent({
          ...newStudent,
          name: student.name,
          mobile: student.mobile || "",
          email: student.email || "",
          profileImage: student.profileImage || "",
        })
        toast.success("Student details loaded!")
      } else {
        if (!codeValue) toast.error("Student not found")
      }
    } catch (error) {
      if (!codeValue) toast.error("Search failed")
    } finally {
      setIsSearchingOldStudent(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!newStudent.name) {
      alert("Please fill in the full name")
      return
    }

    try {
      const generatedCode = useOldCode && oldStudentCode ? oldStudentCode : `${newStudent.name
        .split(' ')
        .slice(0, 2)
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('')}-${Math.floor(1000 + Math.random() * 8000)}`

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudent.name,
          code: generatedCode,
          profileImage: newStudent.profileImage,
          academicYear: newStudent.academicYear,
          balance: 0,
          transactions: [],
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create account")
      }

      const createdStudent = await res.json()
      setNewStudent({ name: "", mobile: "", email: "", profileImage: "", academicYear: "2024-25" })
      setShowCreateForm(false)
      setNotification({ type: 'success', message: `Account created! Code: ${generatedCode}` })
      setTimeout(() => setNotification(null), 5000)
      
      // Refresh students list
      try {
        const studentsRes = await fetch(`/api/students?academicYear=${selectedAcademicYear}`)
        if (studentsRes.ok) {
          const updatedList = await studentsRes.json()
          setStudents(updatedList)
          calculateTotals(updatedList)
        }
      } catch (err) {
        console.error('Failed to refresh students list:', err)
      }
    } catch (error) {
      setNotification({ type: 'error', message: `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}` })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm || deletingIndex === null) return null
    const studentName = students[deletingIndex]?.name
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-in scale-in duration-200">
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#171532] mb-2">Delete Account</h3>
              <p className="text-sm text-[#747384]">
                Are you sure you want to delete <span className="font-semibold text-[#171532]">{studentName}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelDeleteAccount}
                className="flex-1 py-3 rounded-xl font-semibold text-[#171532] bg-[#f0f0f0] hover:bg-[#e5e5e5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/academic-sessions');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setAcademicYears(data.map((s: any) => s.year));
          } else {
            // Default sessions if none exist
            const defaults = ["2023-24", "2024-25", "2025-26", "2026-27"];
            setAcademicYears(defaults);
            // Optionally seed them to DB
            for (const year of defaults) {
              await fetch('/api/academic-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  if (!isAuthenticated || isAuthLoading) {
    return null
  }

  const handleAddAcademicYear = async () => {
    if (!newYearInput || !/^\d{4}-\d{2}$/.test(newYearInput)) {
      toast.error("Invalid format. Use YYYY-YY (e.g., 2026-27)")
      return
    }
    if (academicYears.includes(newYearInput)) {
      toast.error("Year already exists")
      return
    }
    
    try {
      const res = await fetch('/api/academic-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newYearInput })
      });

      if (res.ok) {
        setAcademicYears(prev => [...prev, newYearInput].sort())
        setNewYearYearInput("")
        setShowAddYearForm(false)
        toast.success(`Academic year ${newYearInput} added!`)
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save session");
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    }
  }

  const renderYearTab = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
          <ChevronLeft className="w-6 h-6 text-[#2d6a4f]" />
        </button>
        <h2 className="text-lg font-bold text-[#171532]">Academic Year</h2>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#e5e7eb] space-y-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-[#171532]">Select Active Academic Year</label>
          <button 
            onClick={() => setShowAddYearForm(true)}
            className="flex items-center gap-1.5 bg-[#2d6a4f] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1b4332] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        </div>

        {showAddYearForm && (
          <div className="bg-[#f8f9fa] border-2 border-dashed border-[#e8e8e8] rounded-xl p-4 space-y-3 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2d6a4f]">New Academic Session</span>
            <button onClick={() => setShowAddYearForm(false)} className="text-[#747384] hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newYearInput}
              onChange={(e) => setNewYearYearInput(e.target.value)}
              placeholder="e.g., 2026-27"
              className="flex-1 px-3 py-2 bg-white border border-[#e8e8e8] rounded-lg text-sm focus:outline-none focus:border-[#2d6a4f]"
            />
            <button
              onClick={handleAddAcademicYear}
              className="h-[38px] bg-[#10B981] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0fa06f] whitespace-nowrap"
            >
              Save
            </button>
          </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {academicYears.map((year) => (
            <button
              key={year}
              onClick={() => {
                setSelectedAcademicYear(year)
                setActiveTab("home")
                toast.success(`Active year set to ${year}`)
              }}
              className={`w-full p-4 rounded-xl text-left font-bold transition-all border-2 ${
                selectedAcademicYear === year
                  ? "bg-[#2d6a4f] border-[#2d6a4f] text-white shadow-md scale-[1.02]"
                  : "bg-[#f8f9fa] border-[#e8e8e8] text-[#171532] hover:border-[#2d6a4f]/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{year} Academic Session</span>
                {selectedAcademicYear === year && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
              </div>
            </button>
          ))}
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Note: Changing the academic year will filter all student accounts, transactions, and reports to show data only for the selected session.
          </p>
        </div>
      </div>
    </>
  )

  const handleBulkDelete = async (type: 'students' | 'transactions') => {
    const confirmMsg = type === 'students' 
      ? "Are you sure you want to delete ALL students? This cannot be undone."
      : "Are you sure you want to delete ALL transactions? Balances will be reset to 0.";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (res.ok) {
        toast.success(`All ${type} deleted successfully`);
        window.location.reload(); // Refresh data
      } else {
        throw new Error("Deletion failed");
      }
    } catch (error) {
      toast.error("Failed to perform bulk deletion");
    }
  };

  const renderHomeTab = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#171532]">Morning, Admin!</h1>
            <p className="text-xs text-[#747384]">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearchDialog(true)}
            className="w-10 h-10 bg-[#f0f0f0] dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Search Student"
          >
            <Search className="w-5 h-5 text-[#2d6a4f] dark:text-gray-300" />
          </button>
          <button className="w-10 h-10 bg-[#f0f0f0] rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#2d6a4f]" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-2xl p-5 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-white/70 text-sm">Total Balance</p>
              <select
                value={selectedAcademicYear}
                onChange={(e) => {
                  setSelectedAcademicYear(e.target.value)
                  toast.success(`Active year set to ${e.target.value}`)
                }}
                className="bg-white/10 hover:bg-white/20 border-none text-white text-xs font-bold py-1 px-2 rounded-lg focus:ring-0 cursor-pointer transition-colors"
              >
                {academicYears.map(year => (
                  <option key={year} value={year} className="bg-[#1b4332] text-white">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-2xl font-bold text-white">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-2 text-[10px] text-white/60 mt-1">
              <Activity className="w-3 h-3" />
              <span>Live Status</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-[#10B981]" />
              </div>
              <p className="text-white/70 text-xs">Deposited</p>
            </div>
            <p className="text-lg font-bold text-white">₹{totalDeposited.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[#EF4444]" />
              </div>
              <p className="text-white/70 text-xs">Withdrawn</p>
            </div>
            <p className="text-lg font-bold text-white">₹{totalWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-[#171532] mb-4">Options</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link 
          href="/admin/accounts"
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Accounts</span>
        </Link>
        <Link 
          href="/admin/bulk-edit"
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Bulk Add</span>
        </Link>
        <button 
          onClick={() => router.push("/admin/qr-download")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">QR Download</span>
        </button>
        <button 
          onClick={() => setShowQRScanner(true)}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">QR Scanner</span>
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Leaderboard</span>
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Reports</span>
        </button>
        <button 
          onClick={() => setShowDepositModal(true)}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Deposit</span>
        </button>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Withdraw</span>
        </button>
        <button 
          onClick={() => setActiveTab("year")}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center">
            <CalendarRange className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Session Management</span>
        </button>

        <button 
          onClick={() => setShowAdminStatus(true)}
          className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-[#f8f9fa] transition-all shadow-sm"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-xl flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#171532]">Admin Status</span>
        </button>
      </div>

      {/* Admin Status Modal */}
      {showAdminStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2d6a4f]/10 rounded-xl">
                  <Activity className="w-6 h-6 text-[#2d6a4f]" />
                </div>
                <h3 className="text-xl font-bold text-[#171532] dark:text-white">Admin Status</h3>
              </div>
              <button 
                onClick={() => setShowAdminStatus(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {adminSessions.length > 0 ? (
                  adminSessions.map((session, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-[#171532] dark:text-white">{session.userData?.name || 'Admin'}</p>
                          <p className="text-xs text-gray-500">{session.userData?.username}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${new Date(session.expiresAt) > new Date() && !session.logoutAt ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {new Date(session.expiresAt) > new Date() && !session.logoutAt ? 'Active' : session.logoutAt ? 'Logged Out' : 'Expired'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Login Time</p>
                          <p className="font-medium dark:text-gray-300">{session.loginAt ? new Date(session.loginAt).toLocaleString() : new Date(session.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Logout Time</p>
                          <p className="font-medium dark:text-gray-300">{session.logoutAt ? new Date(session.logoutAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Last Active</p>
                          <p className="font-medium dark:text-gray-300">{new Date(session.lastActiveAt || session.updatedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Online Time</p>
                          <p className="font-medium dark:text-gray-300">
                            {session.logoutAt 
                              ? Math.floor((new Date(session.logoutAt).getTime() - new Date(session.loginAt || session.createdAt).getTime()) / 60000) + ' mins'
                              : Math.floor((new Date().getTime() - new Date(session.loginAt || session.createdAt).getTime()) / 60000) + ' mins'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No active sessions found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#171532]">Recent Transactions</h2>
      </div>
      <div className="space-y-3 mb-8">
        {students.flatMap(s => (s.transactions || []).map(t => ({...t, studentName: s.name, studentId: s._id})))
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
          .slice(0, 5)
          .map((tx, idx) => (
            <div key={idx} className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {tx.type === 'deposit' ? '+' : '-'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#171532] truncate">{tx.studentName}</p>
                <p className="text-[10px] text-[#747384]">{tx.date} • {tx.reason || 'No reason'}</p>
              </div>
              <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                ₹{tx.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
      </div>
    </>
  )

  const renderLeaderboardTab = () => {
    const sortedStudents = [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))
    const getMedalIcon = (index: number) => {
      if (index === 0) return '🥇'
      if (index === 1) return '🥈'
      if (index === 2) return '🥉'
      return null
    }
    
    return (
      <>
        <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] text-white rounded-2xl p-4 border-2 border-[#5a7680]/50 shadow-md">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Top Richest Students
          </h2>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#e5e7eb]" />
            <p className="text-[#747384]">No students yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStudents.map((student, index) => {
              const medal = getMedalIcon(index)
              const isTop3 = index < 3
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-2xl flex items-center gap-3 border-2 shadow-sm transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
                    'bg-white border-[#e5e7eb]'
                  }`}
                >
                  {isTop3 ? (
                    <div className="text-2xl flex-shrink-0">{medal}</div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#171532] truncate">{student.name}</p>
                    <p className="text-xs text-[#747384] truncate">@{student.username || 'no_username'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold ${
                      index === 0 ? 'text-yellow-600 text-lg' :
                      index === 1 ? 'text-gray-600 text-lg' :
                      index === 2 ? 'text-orange-600 text-lg' :
                      'text-[#10B981] text-base'
                    }`}>
                      ₹{(student.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  const renderAccountDetailView = () => {
    if (viewingIndex === null || !students[viewingIndex]) {
      setViewingIndex(null)
      return null
    }
    const student = students[viewingIndex]
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
            <h3 className="text-xl font-bold text-[#171532]">Account Details</h3>
            <button onClick={() => setViewingIndex(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-6 py-6 space-y-5">
            <div className="flex justify-center pb-4">
              {student?.profileImage ? (
                <img src={student.profileImage} alt={student?.name || 'Student'} className="w-24 h-24 rounded-full object-cover shadow-lg" />
              ) : (
                <div className={`w-24 h-24 rounded-full ${avatarColors[viewingIndex % avatarColors.length]} flex items-center justify-center text-3xl font-bold text-[#2d6a4f]`}>
                  {student?.name?.charAt(0) || 'S'}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#747384] mb-1">Full Name</label>
                <p className="text-lg font-semibold text-[#171532]">{student?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747384] mb-1">Code</label>
                <p className="text-lg font-semibold text-[#171532]">{student?.code || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#747384] mb-1">Balance</label>
                  <p className="text-lg font-bold text-[#10B981]">₹{(student?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#747384] mb-1">Transactions</label>
                  <p className="text-lg font-semibold text-[#171532]">{student?.transactions?.length || 0}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0f0f0]">
                <h4 className="text-sm font-bold text-[#171532] mb-3">Transaction History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {student.transactions && student.transactions.length > 0 ? (
                    [...student.transactions].reverse().map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-xl group border border-transparent hover:border-[#e5e7eb] transition-all gap-3 overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${tx.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <p className="text-sm font-bold text-[#171532] truncate">
                              {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                              {tx.academicYear || '2024-25'}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#747384] truncate">
                            {tx.date} {tx.reason ? `• ${tx.reason}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 bg-[#f8f9fa] pl-2">
                          <button
                            onClick={() => {
                              const actualIdx = student.transactions.length - 1 - idx;
                              setEditingTransaction({ studentIndex: viewingIndex, transactionIndex: actualIdx });
                              setEditTxAmount(tx.amount.toString());
                              setEditTxDate(new Date(tx.date || Date.now()).toISOString().split('T')[0]);
                              setEditTxReason(tx.reason || "");
                            }}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Edit Transaction"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this transaction?')) return;
                              const actualIdx = student.transactions.length - 1 - idx;
                              try {
                                const updatedStudents = [...students];
                                const targetStudent = updatedStudents[viewingIndex!];
                                const removedTx = targetStudent.transactions.splice(actualIdx, 1)[0];
                                
                                // Recalculate balance
                                let newBalance = 0;
                                targetStudent.transactions.forEach(t => {
                                  if (t.type === 'deposit') newBalance += t.amount;
                                  else newBalance -= t.amount;
                                });
                                targetStudent.balance = newBalance;

                                await fetch(`/api/students/${targetStudent._id}`, {
                                  method: 'PATCH',
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(targetStudent)
                                });
                                
                                setStudents(updatedStudents);
                                calculateTotals(updatedStudents);
                                toast.success('Transaction deleted');
                              } catch (err) {
                                toast.error('Failed to delete transaction');
                              }
                            }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-[#747384] text-xs">No transactions yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={() => {
                    setViewingIndex(null)
                    handleEditAccount(viewingIndex)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Account
                </button>
                <button
                  onClick={() => {
                    setViewingIndex(null)
                    handleDeleteAccount(viewingIndex)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEditTransactionModal = () => {
    if (!editingTransaction) return null;
    const student = students[editingTransaction.studentIndex];
    const tx = student.transactions[editingTransaction.transactionIndex];

  const handleUpdateTransaction = async () => {
    try {
      const amount = parseFloat(editTxAmount);
      if (isNaN(amount) || amount <= 0) {
        setNotification({ type: 'error', message: 'Please enter a valid amount' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      const updatedStudents = [...students];
      const targetStudent = updatedStudents[editingTransaction.studentIndex];
      const targetTx = targetStudent.transactions[editingTransaction.transactionIndex];

      // Update transaction
      targetTx.amount = amount;
      targetTx.date = new Date(editTxDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      targetTx.reason = editTxReason || undefined;
      targetTx.academicYear = selectedAcademicYear; // Add this line to update year during edit

      // Recalculate balance and re-sort transactions
      let newBalance = 0;
      targetStudent.transactions.forEach(t => {
        if (t.type === 'deposit') newBalance += t.amount;
        else newBalance -= t.amount;
      });
      
      // Update in database
      const res = await fetch(`/api/students/${targetStudent._id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetStudent,
          balance: newBalance,
          transactions: targetStudent.transactions
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      setStudents(updatedStudents);
      calculateTotals(updatedStudents);
      setEditingTransaction(null);
      setNotification({ type: 'success', message: 'Transaction updated successfully' });
      setTimeout(() => setNotification(null), 3000);

      // Broadcast update
      fetch('/api/pusher/broadcast', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'balance-update',
          studentId: targetStudent._id,
          update: { balance: targetStudent.balance }
        })
      }).catch(console.error);

    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update transaction' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6 space-y-4 animate-in scale-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#171532]">Edit Transaction</h3>
            <button onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-[#f0f0f0] rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#747384] mb-1">Type</label>
              <div className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'} capitalize`}>
                {tx.type}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#747384] mb-1">Amount (₹)</label>
              <input
                type="number"
                value={editTxAmount}
                onChange={(e) => setEditTxAmount(e.target.value)}
                className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#747384] mb-1">Date</label>
              <input
                type="date"
                value={editTxDate}
                onChange={(e) => setEditTxDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#747384] mb-1">Reason</label>
              <input
                type="text"
                value={editTxReason}
                onChange={(e) => setEditTxReason(e.target.value)}
                className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#747384] mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f]"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                {academicYears.filter(y => !["2023-24", "2024-25", "2025-26", "2026-27"].includes(y)).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setEditingTransaction(null)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTransaction}
              className="flex-1 py-2.5 bg-[#2d6a4f] text-white rounded-xl font-bold text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderAITab = () => {
    const topStudent = students.length > 0 ? [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))[0] : null
    
    const handleSendMessage = async (message?: string) => {
      const msg = message || aiInput
      if (!msg.trim()) return
      setAiInput("")
      setAiMessages(prev => [...prev, { role: "user", text: msg }])
      setAiLoading(true)
      
      // Prepare student context for AI
      const studentContext = students.map((s, i) => 
        `${i + 1}. ${s.name} (${s.email}): Balance ₹${s.balance.toFixed(2)}, Transactions: ${s.transactions.length}`
      ).join("; ")
      
      let prompt = msg
      if (msg.includes("Live Scoreboard")) {
        prompt = `Show me the live scoreboard with top 3 students: ${[...students].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 3).map((s, i) => `${i + 1}. ${s.name}: ₹${s.balance.toFixed(2)}`).join(", ")}`
      } else if (msg.includes("Sponsor Request")) {
        prompt = `Generate a professional sponsorship request email for JDSA Students Bank. Include that we have ${students.length} active students with total balance of ₹${totalBalance.toFixed(2)}.`
      } else if (msg.includes("Total amount of all accounts")) {
        prompt = `The total amount of all accounts combined is ₹${totalBalance.toFixed(2)}. This includes ${students.length} active student accounts with various balances.`
      } else if (msg.includes("Top rich person")) {
        const topRich = [...students].sort((a, b) => (b.balance || 0) - (a.balance || 0))[0]
        prompt = `The richest person is ${topRich?.name || 'N/A'} who is leading in our bank rankings.`
      }
      
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: prompt,
            studentContext: studentContext,
            adminName: adminName
          })
        })
        const data = await response.json()
        setAiMessages(prev => [...prev, { role: "assistant", text: data.response || "No response" }])
      } catch (error) {
        setAiMessages(prev => [...prev, { role: "assistant", text: "Error: Failed to get response" }])
      }
      setAiLoading(false)
    }
    
    return (
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] text-white rounded-2xl p-4 mb-4 border-2 border-[#5a7680]/50 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Hi there, <span className="text-yellow-400">{adminName.split(' ')[0]}</span></h1>
              <p className="text-xs text-white/70">What can I help with?</p>
            </div>
          </div>
          {aiMessages.length > 0 && (
            <button onClick={() => setAiMessages([])} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0" title="Clear conversation">
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <p className="text-sm text-[#747384] mb-4">Start a conversation or pick a topic.</p>
          
          {aiMessages.length === 0 ? (
            <div className="space-y-3">
              <button 
                onClick={() => handleSendMessage("Total amount of all accounts")}
                className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl p-3 text-left hover:border-purple-300 hover:shadow-md hover:bg-[#f8f9fa] transition-all active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#171532] text-sm">💰 Total Amount</h3>
                    <p className="text-xs text-[#747384] mt-0.5">All accounts combined</p>
                  </div>
                  <Wallet className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                </div>
              </button>
              
              <button 
                onClick={() => handleSendMessage("Top rich person")}
                className="w-full bg-white border-2 border-[#e5e7eb] rounded-xl p-3 text-left hover:border-purple-300 hover:shadow-md hover:bg-[#f8f9fa] transition-all active:scale-95"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#171532] text-sm">👑 Top Rich Person</h3>
                    <p className="text-xs text-[#747384] mt-0.5">Who is the richest?</p>
                  </div>
                  <Star className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                    </div>
                  )}
                  <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm break-words ${msg.role === "user" ? "bg-amber-700 text-white rounded-br-3xl" : "bg-white text-[#171532] border border-gray-200 rounded-bl-3xl shadow-sm"}`}>
                    {msg.role === "assistant" ? renderMessageWithHighlight(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start gap-2 items-center pt-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-3xl flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-28 left-4 right-4 bg-white border-2 border-[#e5e7eb] rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-[#2d6a4f]">✨ ASK JDSA AI</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your question..."
              disabled={aiLoading}
              className="flex-1 px-3 py-2 bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#171532] placeholder:text-[#b0b0b0] focus:outline-none focus:border-purple-400 focus:bg-white disabled:opacity-50 transition-all text-xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={aiLoading || !aiInput.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-2 rounded-lg font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center justify-center flex-shrink-0 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderAccountsTab = () => {
    const filteredStudents = students.filter(s => 
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
      s.code?.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    const totalDep = filteredStudents.reduce((acc, s) => acc + (s.transactions?.filter(t => selectedAcademicYear === 'all' || (t.academicYear || '2024-25') === selectedAcademicYear).reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum, 0) || 0), 0);
    const totalWith = filteredStudents.reduce((acc, s) => acc + (s.transactions?.filter(t => selectedAcademicYear === 'all' || (t.academicYear || '2024-25') === selectedAcademicYear).reduce((sum, t) => t.type === 'withdraw' ? sum + t.amount : sum, 0) || 0), 0);
    const currentBalance = totalDep - totalWith;

    return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#2d6a4f]" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#171532]">All Accounts</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl text-xs font-semibold text-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/10 transition-all"
          >
            <option value="all">All Sessions</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#2d6a4f]/20 hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747384]" />
        <input
          type="text"
          placeholder="Search students by name or code..."
          value={studentSearchQuery}
          onChange={(e) => setStudentSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/10 transition-all"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-14 h-14 text-[#e5e7eb] mb-3" />
          <p className="text-[#747384] font-medium text-sm mb-1">No accounts found</p>
          <p className="text-xs text-[#a0a0a0]">Try a different search term</p>
        </div>
      ) : (
        <div className="mb-6 overflow-x-auto">
          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 bg-[#f8f9fa] p-4 border-b border-[#e5e7eb] font-semibold text-xs text-[#747384] sticky top-0">
              <div className="col-span-8">Name</div>
              <div className="col-span-4">Balance</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#e5e7eb]">
              {filteredStudents.map((student, index) => {
                const originalIndex = students.findIndex(s => s._id === student._id);
                const studentBalance = student.transactions?.filter(t => selectedAcademicYear === 'all' || (t.academicYear || '2024-25') === selectedAcademicYear).reduce((acc, t) => t.type === 'deposit' ? acc + t.amount : acc - t.amount, 0) || 0;
                return (
                <div 
                  key={student._id || index} 
                  onClick={() => setViewingIndex(originalIndex)}
                  className="grid grid-cols-12 gap-3 p-4 hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                >
                  <div className="col-span-8 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${avatarColors[originalIndex % avatarColors.length]} flex items-center justify-center text-xs font-bold text-[#2d6a4f] flex-shrink-0`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-semibold text-[#171532] truncate">{student.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{student.code} • {student.academicYear || 'No Session'}</span>
                    </div>
                  </div>
                  <div className="col-span-4 text-sm font-bold text-[#10B981]">
                    ₹{studentBalance.toFixed(2)}
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {viewingIndex !== null && renderAccountDetailView()}
      {editingTransaction !== null && renderEditTransactionModal()}
      {showDeleteConfirm && renderDeleteConfirmModal()}

      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
              <h3 className="text-xl font-bold text-[#171532]">{showEditForm ? 'Edit Account' : 'Create Account'}</h3>
              <button onClick={() => {setShowCreateForm(false); setShowEditForm(false); setEditingIndex(null); setUseOldCode(false); setOldStudentCode(""); setNewStudent({ name: "", mobile: "", email: "", profileImage: "", academicYear: "2025-26" })}} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-5">
              {!showEditForm && (
                <div className="flex items-center gap-2 mb-2 p-3 bg-blue-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="useOldCode"
                    checked={useOldCode}
                    onChange={(e) => setUseOldCode(e.target.checked)}
                    className="w-4 h-4 text-[#2d6a4f]"
                  />
                  <label htmlFor="useOldCode" className="text-sm font-medium text-blue-800">Use existing student code</label>
                </div>
              )}

              {useOldCode && !showEditForm && (
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-semibold text-[#171532]">Old Student Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={oldStudentCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setOldStudentCode(val);
                        if (val.length >= 4) {
                          handleSearchOldStudent(val);
                        }
                      }}
                      placeholder="e.g., JD-1234"
                      className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl text-[#171532] focus:outline-none focus:border-[#2d6a4f]"
                    />
                    {isSearchingOldStudent && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader className="w-4 h-4 animate-spin text-[#2d6a4f]" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center pb-2">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#e8f5f2] to-[#d4eef5] rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                    {newStudent.profileImage ? (
                      <img src={newStudent.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-[#2d6a4f]" />
                    )}
                  </div>
                  <label htmlFor="profileImageInput" className="absolute bottom-1 right-1 w-7 h-7 bg-[#2d6a4f] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1b4332] transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#171532] mb-2">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:bg-white focus:ring-2 focus:ring-[#2d6a4f]/10 transition-all text-[#171532] placeholder:text-[#a0a0a0]"
                  placeholder="Enter full name"
                />
              </div>

              {!showEditForm && (
                <div>
                  <label className="block text-sm font-semibold text-[#171532] mb-2">Academic Session</label>
                  <select
                    value={newStudent.academicYear}
                    onChange={(e) => setNewStudent({...newStudent, academicYear: e.target.value})}
                    className="w-full px-4 py-3.5 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:bg-white focus:ring-2 focus:ring-[#2d6a4f]/10 transition-all text-[#171532]"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}


              <button
                onClick={showEditForm ? handleUpdateAccount : handleCreateAccount}
                className="w-full bg-[#2d6a4f] text-white py-4 rounded-xl font-semibold hover:bg-[#1b4332] transition-all shadow-lg shadow-[#2d6a4f]/20 mt-2"
              >
                {showEditForm ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    )
  }

  const renderCalendarTab = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    
    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#2d6a4f]" />
          </button>
          <h2 className="text-lg font-bold text-[#171532]">Calendar</h2>
        </div>
        <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-2xl p-6 shadow-lg border border-[#5a7680]/50">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-white">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-white/70 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div key={idx} className={`aspect-square flex items-center justify-center rounded-lg font-semibold transition-colors ${
                day === today.getDate() 
                  ? 'bg-[#c17f59] text-white shadow-md' 
                  : day 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'text-transparent'
              }`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  const renderStatusTab = () => {
    // Calculate site strength from system metrics
    const cpuHealth = 100 - (systemStatus?.cpu?.percentage || 25);
    const mongoHealth = Math.max(0, 100 - (systemStatus?.mongodb?.percentage || 29));
    const responseHealth = Math.max(0, 100 - Math.min((systemStatus?.responseTime || 95) / 2, 50));
    const siteStrength = Math.round((cpuHealth + mongoHealth + responseHealth) / 3)
    
    const uptime = systemStatus?.uptime || 86400;
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimePercentage = Math.min(Math.round((uptimeHours / 168) * 100), 100); // Based on weekly uptime
    
    return (
      <>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-[#2d6a4f] dark:text-gray-300" />
            </button>
            <h2 className="text-xl font-bold text-[#171532] dark:text-white">System Status</h2>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Service Statuses & System Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Service Statuses */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-5 border border-gray-200 dark:border-slate-600">
              <h3 className="text-[#171532] dark:text-white font-bold text-sm mb-4">Service statuses</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-[#747384] dark:text-gray-300 text-sm">Start</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-[#747384] dark:text-gray-300 text-sm">Scoring</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-[#747384] dark:text-gray-300 text-sm">Receipt</span>
                  <div className="flex-1 h-0.5 border-b border-dotted border-gray-500"></div>
                </div>
              </div>
            </div>

            {/* System Status Traffic Light */}
            <div className="bg-green-500 rounded-2xl p-5 flex flex-col items-center justify-center">
              <div className="flex flex-col gap-2 mb-3">
                <div className="w-10 h-4 rounded-full bg-red-600 shadow-lg"></div>
                <div className="w-10 h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                <div className="w-10 h-4 rounded-full bg-green-400 shadow-lg animate-pulse"></div>
              </div>
              <p className="text-white font-bold text-sm">System is stable</p>
            </div>
          </div>

          {/* Site Strength */}
          <div className="bg-white dark:bg-slate-700 rounded-2xl p-5 border border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#171532] dark:text-white font-bold text-sm">Site strength</h3>
              <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${siteStrength >= 80 ? 'bg-green-500' : siteStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                {siteStrength >= 80 ? 'Excellent' : siteStrength >= 60 ? 'Good' : 'Fair'}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="3" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="3"
                      strokeDasharray={`${siteStrength * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#171532] dark:text-white font-bold text-2xl">{siteStrength}%</span>
                  </div>
                </div>
              </div>

              {/* Health Stats */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#747384] dark:text-gray-300 text-sm">CPU Health</span>
                    <span className="text-[#171532] dark:text-white font-bold text-sm">{cpuHealth}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: `${cpuHealth}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#747384] dark:text-gray-300 text-sm">Storage Health</span>
                    <span className="text-[#171532] dark:text-white font-bold text-sm">{mongoHealth}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{width: `${mongoHealth}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Resources */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#747384] dark:text-gray-400 text-xs">MongoDB</p>
                {systemStatus?.mongodb?.unit && (
                  <span className="text-[10px] font-medium text-gray-400">{systemStatus.mongodb.unit}</span>
                )}
              </div>
              <p className="text-[#171532] dark:text-white font-bold text-sm mb-2">
                {systemStatus?.mongodb?.used || 0}
              </p>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{width: `${systemStatus?.mongodb?.percentage || 0}%`}}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#747384] dark:text-gray-400 text-xs">Discord Bot</p>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
              <p className="font-bold text-sm mb-2 text-green-600 dark:text-green-400">
                ONLINE
              </p>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500 bg-green-500 w-full"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <p className="text-[#747384] dark:text-gray-400 text-xs mb-1">CPU Usage</p>
              <p className="text-[#171532] dark:text-white font-bold text-sm mb-2">{systemStatus?.cpu?.percentage || 25}%</p>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{width: `${systemStatus?.cpu?.percentage || 25}%`}}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600">
              <p className="text-[#747384] dark:text-gray-400 text-xs mb-1">Response Time</p>
              <p className="text-[#171532] dark:text-white font-bold text-sm">{systemStatus?.responseTime || 95}ms</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`min-h-screen pb-24 ${activeTab === "status" ? "bg-white dark:bg-slate-800" : "bg-white dark:bg-slate-900"}`}>
      <div className={`px-5 pt-6 ${activeTab === "status" ? "text-[#171532] dark:text-white" : ""}`}>
        {renderNotification()}
        {showDepositModal && renderDepositModal()}
        {showWithdrawModal && renderWithdrawModal()}
        
        {showQRScanner && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <button 
              onClick={() => setShowQRScanner(false)} 
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full max-w-sm aspect-square bg-black rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl">
              <video ref={videoRef} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 border-[4rem] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                </div>
              </div>

              {!isScannerReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-4">
                  <Loader className="w-10 h-10 animate-spin text-[#2d6a4f]" />
                  <span className="font-bold text-lg tracking-tight">Accessing Camera...</span>
                </div>
              )}
            </div>

            <div className="mt-8 text-center space-y-2">
              <h3 className="text-white font-bold text-xl tracking-tight">Scan Student QR Code</h3>
              <p className="text-white/60 text-sm max-w-xs mx-auto">
                Align the QR code within the frame to automatically scan and search for the student
              </p>
            </div>

            <style jsx>{`
              @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
              .animate-scan {
                animation: scan 2s linear infinite;
              }
            `}</style>
          </div>
        )}

        {activeTab === "home" && renderHomeTab()}
        {activeTab === "reports" && renderReportsTab()}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("home")} className="p-2 hover:bg-[#f0f0f0] rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-[#2d6a4f]" />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#747384] uppercase tracking-wider">All</span>
                  <h2 className="text-2xl font-bold text-[#171532]">Accounts</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => {
                      setSelectedAcademicYear(e.target.value)
                      toast.success(`Active year set to ${e.target.value}`)
                    }}
                    className="appearance-none bg-white border border-[#e5e7eb] text-[#171532] text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] cursor-pointer shadow-sm transition-all"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747384] pointer-events-none" />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#2d6a4f] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1b4332] transition-all shadow-lg shadow-[#2d6a4f]/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search students by name or code..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-[#e5e7eb] rounded-2xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all shadow-sm"
              />
            </div>

            <div className="bg-white rounded-3xl border border-[#e5e7eb] overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-4 bg-[#f8f9fa] border-b border-[#e5e7eb]">
                <span className="text-sm font-bold text-[#747384] uppercase tracking-wider">Name</span>
                <span className="text-sm font-bold text-[#747384] uppercase tracking-wider">Balance</span>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                {students
                  .filter(s => 
                    (s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
                     s.code?.toLowerCase().includes(studentSearchQuery.toLowerCase())) &&
                    (s.academicYear === selectedAcademicYear)
                  )
                  .map((student, idx) => (
                    <div 
                      key={student._id || idx}
                      onClick={() => setViewingIndex(students.indexOf(student))}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-5 hover:bg-[#fcfcfc] transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold ${avatarColors[idx % avatarColors.length]} text-[#171532] border-2 border-white shadow-sm group-hover:scale-110 transition-transform`}>
                        {student.profileImage ? (
                          <img src={student.profileImage} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-[#171532] text-base md:text-lg truncate group-hover:text-[#2d6a4f] transition-colors leading-tight">
                          {student.name}
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-[#9ca3af] uppercase tracking-widest mt-0.5">
                          {student.code} • {student.academicYear}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm md:text-lg font-bold text-[#2d6a4f] bg-[#2d6a4f]/5 px-2.5 py-1.5 rounded-lg border border-[#2d6a4f]/10 shadow-inner inline-block whitespace-nowrap">
                          ₹{student.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "leaderboard" && renderLeaderboardTab()}
        {activeTab === "ai" && renderAITab()}
        {activeTab === "year" && renderYearTab()}
        {activeTab === "calendar" && renderCalendarTab()}
        {activeTab === "status" && renderStatusTab()}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#171532]">Admin Profile</h2>
            
            <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-2xl p-8 text-white">
              <div className="flex flex-col items-center text-center space-y-3">
                <img src="/admin-profile.jpg" alt="Admin Profile" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white/20" />
                <div>
                  <p className="text-xl font-bold">{adminName}</p>
                  <p className="text-sm text-white/70">@{adminUsername}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-red-100 dark:border-red-900/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Danger Zone</h3>
              </div>
              <p className="text-xs text-gray-500">Actions in this section are permanent and cannot be undone.</p>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => handleBulkDelete('transactions')}
                  className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30 transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Clear All Transactions</p>
                    <p className="text-[10px] text-red-600/70">Resets all student balances to ₹0.00</p>
                  </div>
                  <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                </button>

                <button
                  onClick={() => handleBulkDelete('students')}
                  className="flex items-center justify-between p-4 bg-red-600 hover:bg-red-700 rounded-xl border border-red-700 transition-colors group shadow-md shadow-red-200 dark:shadow-none"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Delete All Students</p>
                    <p className="text-[10px] text-white/70">Permanently wipes the entire student database</p>
                  </div>
                  <Trash2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-white dark:bg-slate-800 border border-[#e5e7eb] dark:border-slate-700 rounded-2xl p-3">
              <div>
                <p className="text-xs font-semibold text-[#747384] dark:text-gray-400 mb-1">Admin Name</p>
                <p className="text-sm font-bold text-[#171532] dark:text-white">{adminName}</p>
              </div>

              <div className="pt-2 border-t border-[#e5e7eb] dark:border-slate-700">
                <p className="text-xs font-semibold text-[#747384] dark:text-gray-400 mb-1">Username</p>
                <p className="text-sm font-bold text-[#171532] dark:text-white">@{adminUsername}</p>
              </div>

              <div className="pt-2 border-t border-[#e5e7eb] dark:border-slate-700">
                <p className="text-xs font-semibold text-[#747384] dark:text-gray-400 mb-1">Password</p>
                <p className="text-sm font-bold text-[#171532] dark:text-white">{adminPassword}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="w-full flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-xl p-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <Lock className="w-5 h-5 text-[#2d6a4f]" />
                <span className="font-medium text-[#171532]">Reset Password</span>
              </button>

              <button
                onClick={() => {
                  const text = "Check out JDSA Students Bank: https://jdsa-students-bank.vercel.app"
                  if (navigator.share) {
                    navigator.share({
                      title: "JDSA Students Bank",
                      text: text,
                    })
                  } else {
                    alert(text)
                  }
                }}
                className="w-full flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-xl p-4 hover:bg-[#f8f9fa] transition-colors"
              >
                <Share2 className="w-5 h-5 text-[#2d6a4f]" />
                <span className="font-medium text-[#171532]">Share Website</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Logout</span>
              </button>
            </div>

            <div className="text-center pt-2 pb-4">
              <p className="text-xs font-semibold text-[#747384]">v1.0.0</p>
            </div>

            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
                <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl animate-in scale-in duration-200">
                  <div className="px-6 py-6 space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-[#171532] mb-2">Logout</h3>
                      <p className="text-sm text-[#747384]">
                        Are you sure you want to logout? You'll need to sign in again to access the admin dashboard.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-[#171532] bg-[#f0f0f0] hover:bg-[#e5e5e5] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/auth/logout', { method: 'POST' })
                          } catch (error) {
                            console.error('Logout error:', error)
                          } finally {
                            router.push("/login")
                          }
                        }}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showPasswordReset && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
                <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
                    <h3 className="text-xl font-bold text-[#171532]">Reset Password</h3>
                    <button onClick={() => setShowPasswordReset(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#171532] mb-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532]"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171532] mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532]"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171532] mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 text-[#171532]"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!currentPassword) {
                          toast.error("Current password is required")
                          return
                        }
                        if (newPassword.length < 6) {
                          toast.error("New password must be at least 6 characters")
                          return
                        }
                        if (newPassword !== confirmPassword) {
                          toast.error("Passwords do not match")
                          return
                        }
                        
                        try {
                          const response = await fetch('/api/admin/change-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ currentPassword, newPassword })
                          })
                          
                          if (response.ok) {
                            toast.success("✓ Password changed successfully")
                            setShowPasswordReset(false)
                            setCurrentPassword("")
                            setNewPassword("")
                            setConfirmPassword("")
                          } else {
                            const error = await response.json()
                            toast.error(error.error || "Failed to change password")
                          }
                        } catch (error) {
                          toast.error("Error changing password")
                        }
                      }}
                      className="w-full bg-[#2d6a4f] text-white py-3 rounded-xl font-semibold hover:bg-[#1b4332] transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "cards" && (
          <div className="text-center py-12 text-[#747384]">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Cards feature coming soon</p>
          </div>
        )}
        {activeTab === "more" && (
          <div className="text-center py-12 text-[#747384]">
            <MoreHorizontal className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>More options coming soon</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-20 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <div className="max-w-md mx-auto bg-gradient-to-r from-[#e8f4f8] to-[#d4eef5] rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "home"
                ? "bg-[#c17f59] text-white shadow-md"
                : "text-[#2d6a4f]"
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "accounts"
                ? "bg-[#c17f59] text-white shadow-md"
                : "text-[#2d6a4f]"
            }`}
            title="Accounts"
          >
            <Users className="w-5 h-5" />
          </button>

          <Link href="/admin/manage-transactions">
            <button className="flex items-center justify-center p-2 rounded-xl transition-all text-[#2d6a4f] hover:bg-[#f0f0f0]" title="Edit Transactions">
              <Edit className="w-5 h-5" />
            </button>
          </Link>

          <Link href="/admin/upload-transactions">
            <button className="flex items-center justify-center p-2 rounded-xl transition-all text-[#2d6a4f] hover:bg-[#f0f0f0]" title="Upload Transactions">
              <Upload className="w-5 h-5" />
            </button>
          </Link>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-[#c17f59] text-white shadow-md"
                : "text-[#2d6a4f]"
            }`}
            title="Admin Profile"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
