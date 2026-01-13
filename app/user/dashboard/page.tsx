"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, User, ArrowUpRight, ArrowDownRight, History, QrCode, Download, Printer, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"
import { usePusherUpdates } from "@/lib/hooks/usePusher"

export default function UserDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [realTimeStatus, setRealTimeStatus] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")

  const [isLedgerFullscreen, setIsLedgerFullscreen] = useState(false)

  const loadUserData = async () => {
    try {
      // Check if we have a student ID in the URL for direct access (QR scan)
      const urlParams = new URLSearchParams(window.location.search);
      const directStudentId = urlParams.get('id');

      // Verify session from MongoDB
      const verifyRes = await fetch('/api/auth/verify')
      
      let studentId = null;
      if (verifyRes.ok) {
        const session = await verifyRes.json()
        studentId = session.userData.id
      } else if (directStudentId) {
        // Allow direct view if ID is provided via QR, but we still prefer session if available
        studentId = directStudentId;
      } else {
        router.push("/login")
        return
      }

      const res = await fetch(`/api/students/${studentId}?academicYear=${selectedAcademicYear}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      })
      
      if (!res.ok) {
        console.error("Failed to fetch student:", res.status)
        return
      }
      
      const student = await res.json()
      if (!student) {
        console.error("Student data is null")
        return
      }
      setUserData({
        id: student._id,
        name: student.name || "User",
        code: student.code || "NA-0000",
        balance: student.balance || 0,
        profileImage: student.profileImage || null,
        transactions: student.transactions || [],
        academicYear: student.academicYear || "2025-26"
      })
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [selectedAcademicYear])

  // Auto-logout when user refreshes or navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      fetch('/api/auth/logout', { method: 'POST', keepalive: true })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Refresh data every 5 seconds (slower polling to prevent lag)
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserData()
    }, 5000)

    return () => clearInterval(interval)
  }, [isLoading, selectedAcademicYear])

  // Use Pusher for real-time updates
  usePusherUpdates(userData?.id, (data) => {
    if (data.type === 'balance-changed' || data.type === 'transaction-added') {
      setRealTimeStatus(true)
      loadUserData()
      setTimeout(() => setRealTimeStatus(false), 2000)
    }
  })


  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 10
    let yPosition = 20

    // Title
    doc.setFontSize(18)
    doc.text('Student Account Details', margin, yPosition)
    yPosition += 12

    // User Info
    doc.setFontSize(11)
    doc.text(`Name: ${userData?.name || 'N/A'}`, margin, yPosition)
    yPosition += 8
    doc.text(`Code: ${userData?.code || 'N/A'}`, margin, yPosition)
    yPosition += 8
    doc.text(`Balance: ₹${(userData?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, yPosition)
    yPosition += 12

    // Transactions Table
    doc.setFontSize(12)
    doc.text('Transaction History', margin, yPosition)
    yPosition += 8

    const columns = ['S.No', 'Date', 'Deposit', 'Withdraw', 'Balance']
    const rows: any[] = []
    let runningBalance = 0

    userData?.transactions?.forEach((t: any, idx: number) => {
      if (t.type === 'deposit') {
        runningBalance += t.amount || 0
      } else {
        runningBalance -= t.amount || 0
      }
      rows.push([
        (idx + 1).toString(),
        t.date || '-',
        t.type === 'deposit' ? `₹${t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
        t.type === 'withdraw' ? `₹${t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
        `₹${runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])
    })

    doc.setFontSize(9)
    let colWidth = (pageWidth - 2 * margin) / columns.length
    
    columns.forEach((col, idx) => {
      doc.text(col, margin + idx * colWidth, yPosition)
    })
    yPosition += 6

    rows.forEach(row => {
      if (yPosition + 6 > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      row.forEach((cell: string, idx: number) => {
        doc.text(cell.substring(0, 10), margin + idx * colWidth, yPosition)
      })
      yPosition += 6
    })

    doc.save(`${userData?.name}_account_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const downloadExcel = () => {
    const data: any[] = [
      ['Account Details'],
      ['Name', userData?.name || 'N/A'],
      ['Code', userData?.code || 'N/A'],
      ['Balance', `₹${(userData?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      [],
      ['Transaction History'],
    ]

    let runningBalance = 0
    data.push(['S.No', 'Date', 'Deposit', 'Withdraw', 'Balance'])

    userData?.transactions?.forEach((t: any, idx: number) => {
      if (t.type === 'deposit') {
        runningBalance += t.amount || 0
      } else {
        runningBalance -= t.amount || 0
      }
      data.push([
        idx + 1,
        t.date || '-',
        t.type === 'deposit' ? `₹${t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
        t.type === 'withdraw' ? `₹${t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
        `₹${runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Account')
    XLSX.writeFile(wb, `${userData?.name}_account_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handlePrint = () => {
    window.print()
  }

  const calculateYearlyBalance = () => {
    if (!userData || !userData.transactions) return 0
    
    // Default session if not set is 2024-25
    const sessionToFilter = selectedAcademicYear;
    
    const filtered = userData.transactions.filter((t: any) => {
      const txYear = t.academicYear || '2025-26';
      return txYear === sessionToFilter;
    });

    return filtered.reduce((sum: number, t: any) => {
      return t.type === 'deposit' ? sum + (t.amount || 0) : sum - (t.amount || 0)
    }, 0)
  }

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#4a6670] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#747384]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
      <div className="max-w-md mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
            {userData?.profileImage ? (
              <img src={userData.profileImage} alt={userData?.name} className="w-20 h-20 rounded-full object-cover mb-4 shadow-md" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#171532] text-center">{userData?.name || 'User'}</h2>
            <p className="text-sm text-[#747384]">Code: {userData?.code || 'NA-0000'}</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#4a6670] to-[#3d565e] rounded-xl p-5 mb-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/70 text-sm font-medium">Total Balance ({selectedAcademicYear})</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <label className="block text-white/70 text-xs font-medium mb-1">Academic Session</label>
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-white/60" />
              <select 
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="flex-1 bg-transparent border-none text-white text-sm rounded-md focus:ring-0 cursor-pointer p-0 font-bold"
              >
                <option value="2023-24" className="text-gray-900">2023-24 Session</option>
                <option value="2024-25" className="text-gray-900">2024-25 Session</option>
                <option value="2025-26" className="text-gray-900">2025-26 Session</option>
                <option value="2026-27" className="text-gray-900">2026-27 Session</option>
                {userData?.transactions?.map((t: any) => t.academicYear).filter((v: any, i: number, a: any[]) => v && a.indexOf(v) === i && !["2023-24", "2024-25", "2025-26", "2026-27"].includes(v)).map((year: string) => (
                  <option key={year} value={year} className="text-gray-900">{year} Session</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">₹{calculateYearlyBalance().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

          {/* Profile Info and QR Code Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
              <User className="w-5 h-5 text-[#4a6670]" />
              <div>
                <p className="text-xs text-[#747384]">Full Name</p>
                <p className="font-semibold text-[#171532]">{userData?.name || 'User'}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3 w-full">
                <QrCode className="w-4 h-4 text-[#4a6670]" />
                <p className="text-xs text-[#747384] font-medium">Scan to View Results</p>
              </div>
              <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                <QRCodeSVG 
                  value={`https://jdsa-bank.vercel.app/user/dashboard?id=${userData.id}`} 
                  size={120} 
                  level="H" 
                  includeMargin={true} 
                />
              </div>
              <p className="text-xs text-[#747384] mt-2 text-center font-mono">{userData?.code}</p>
            </div>
          </div>

          {/* Print and Export Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-[#4a6670] hover:bg-[#3d565e] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-colors"
              title="Print Dashboard"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0fa06f] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-colors"
              title="Download Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>

          {/* Real-Time Status Indicator */}
          {realTimeStatus && (
            <div className="mt-4 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <Zap className="w-4 h-4 text-green-600 animate-pulse" />
              <p className="text-xs text-green-700 font-medium">Real-time update received</p>
            </div>
          )}

          {/* Transactions Table Section */}
          {userData?.transactions && userData.transactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                onClick={() => setIsLedgerFullscreen(true)}
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#4a6670]" />
                  <h3 className="font-semibold text-[#171532]">Transaction Ledger</h3>
                </div>
                <Zap className="w-4 h-4 text-[#4a6670] animate-pulse" />
              </div>
              <div 
                className="overflow-x-auto rounded-xl border border-[#e5e7eb] cursor-pointer"
                onClick={() => setIsLedgerFullscreen(true)}
              >
                <table className="w-full text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-[#4a6670] text-white">
                      <th className="px-3 py-3 text-left font-semibold border-b border-[#3d565e]">S.No</th>
                      <th className="px-3 py-3 text-left font-semibold border-b border-[#3d565e]">Date</th>
                      <th className="px-3 py-3 text-right font-semibold border-b border-[#3d565e]">Deposit</th>
                      <th className="px-3 py-3 text-right font-semibold border-b border-[#3d565e]">Withdraw</th>
                      <th className="px-3 py-3 text-right font-semibold border-b border-[#3d565e]">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {userData.transactions
                      .filter((t: any) => (t.academicYear || '2025-26') === selectedAcademicYear)
                      .map((transaction: any, idx: number) => {
                      // Calculate running balance for filtered transactions
                      let runningBalance = 0
                      const filteredTxs = userData.transactions.filter((t: any) => (t.academicYear || '2025-26') === selectedAcademicYear)
                      for (let i = 0; i <= idx; i++) {
                        if (filteredTxs[i].type === 'deposit') {
                          runningBalance += filteredTxs[i].amount || 0
                        } else {
                          runningBalance -= filteredTxs[i].amount || 0
                        }
                      }
                      
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-[#f8f9fa]' : 'bg-white hover:bg-[#f1f5f9] transition-colors'}>
                          <td className="px-3 py-3 font-semibold text-[#171532]">
                            <div className="flex flex-col gap-1">
                              <span>{idx + 1}</span>
                              <span className="text-[9px] bg-[#4a6670]/10 text-[#4a6670] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider w-fit">
                                {transaction.academicYear || '2025-26'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[#747384] text-xs leading-relaxed">
                            {transaction.date || '-'}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {transaction.type === 'deposit' ? (
                              <span className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md font-bold text-green-700 text-xs">
                                <span className="text-[10px]">↓</span>₹{transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-[#cbd5e1]">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {transaction.type === 'withdraw' ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md font-bold text-red-700 text-xs">
                                <span className="text-[10px]">↑</span>₹{transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-[#cbd5e1]">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-[#4a6670] tabular-nums">
                            ₹{runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Ledger Modal */}
      {isLedgerFullscreen && (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="bg-[#4a6670] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold leading-tight">Full Ledger</h2>
                <p className="text-xs text-white/70">{selectedAcademicYear} Session</p>
              </div>
            </div>
            <button 
              onClick={() => setIsLedgerFullscreen(false)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all"
            >
              <ArrowDownRight className="w-6 h-6 rotate-45" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-2 bg-[#f8f9fa]">
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-[11px] sm:text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-100 text-[#4a6670]">
                    <th className="w-[10%] px-2 py-3 text-left font-bold border-b border-gray-200">#</th>
                    <th className="w-[25%] px-2 py-3 text-left font-bold border-b border-gray-200">Date</th>
                    <th className="w-[20%] px-2 py-3 text-right font-bold border-b border-gray-200">Dep.</th>
                    <th className="w-[20%] px-2 py-3 text-right font-bold border-b border-gray-200">With.</th>
                    <th className="w-[25%] px-2 py-3 text-right font-bold border-b border-gray-200">Bal.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userData.transactions
                    .filter((t: any) => (t.academicYear || '2025-26') === selectedAcademicYear)
                    .map((transaction: any, idx: number) => {
                    let runningBalance = 0
                    const filteredTxs = userData.transactions.filter((t: any) => (t.academicYear || '2025-26') === selectedAcademicYear)
                    for (let i = 0; i <= idx; i++) {
                      if (filteredTxs[i].type === 'deposit') runningBalance += filteredTxs[i].amount || 0
                      else runningBalance -= filteredTxs[i].amount || 0
                    }
                    
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-[#f8f9fa]' : 'bg-white hover:bg-[#f1f5f9] transition-colors'}>
                          <td className="px-2 py-3 font-bold text-[#171532]">{idx + 1}</td>
                          <td className="px-2 py-3 text-[#747384] font-medium truncate">{transaction.date || '-'}</td>
                          <td className="px-2 py-3 text-right text-green-600 font-bold tabular-nums">
                            {transaction.type === 'deposit' ? `₹${transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-2 py-3 text-right text-red-600 font-bold tabular-nums">
                            {transaction.type === 'withdraw' ? `₹${transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-2 py-3 text-right font-black text-[#4a6670] bg-gray-50/50 tabular-nums">
                            ₹{runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-[#4a6670] text-white py-3 rounded-xl font-bold"
            >
              <Printer className="w-5 h-5" /> Print
            </button>
            <button 
              onClick={() => setIsLedgerFullscreen(false)}
              className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
