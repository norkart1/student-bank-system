"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Wallet, User, ArrowUpRight, ArrowDownRight, History, QrCode, Download, Printer, Zap, Calendar, Edit2 } from "lucide-react"
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

  const loadUserData = async () => {
    try {
      // Verify session from MongoDB
      const verifyRes = await fetch('/api/auth/verify')
      if (!verifyRes.ok) {
        router.push("/login")
        return
      }
      
      const session = await verifyRes.json()
      const studentId = session.userData.id

      const res = await fetch(`/api/students/${studentId}`, {
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
      setUserData({
        id: student._id,
        name: student.name || "User",
        code: student.code || "NA-0000",
        balance: student.balance || 0,
        profileImage: student.profileImage || null,
        transactions: student.transactions || [],
      })
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

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
  }, [isLoading])

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
    doc.text(`Balance: ₹${(userData?.balance || 0).toFixed(2)}`, margin, yPosition)
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
        t.type === 'deposit' ? `₹${t.amount?.toFixed(2)}` : '-',
        t.type === 'withdraw' ? `₹${t.amount?.toFixed(2)}` : '-',
        `₹${runningBalance.toFixed(2)}`
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
      ['Balance', `₹${(userData?.balance || 0).toFixed(2)}`],
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
        t.type === 'deposit' ? `₹${t.amount?.toFixed(2)}` : '-',
        t.type === 'withdraw' ? `₹${t.amount?.toFixed(2)}` : '-',
        `₹${runningBalance.toFixed(2)}`
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
              <p className="text-white/70 text-sm font-medium">Total Balance</p>
            </div>
            <p className="text-3xl font-bold text-white">₹{(userData?.balance || 0)?.toFixed(2)}</p>
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
                <p className="text-xs text-[#747384] font-medium">QR Code</p>
              </div>
              <div className="bg-white p-2 rounded border border-[#e5e7eb]">
                <QRCodeSVG value={userData?.code || 'NA-0000'} size={120} level="H" includeMargin={true} />
              </div>
              <p className="text-xs text-[#747384] mt-2 text-center">Scan to verify account</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/user/transactions" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-[#7056B2] hover:bg-[#5a4499] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors">
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
            </Link>
            <Link href="/user/transactions/edit" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-[#7056B2] hover:bg-[#5a4499] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </Link>
          </div>

          {/* Print and Export Buttons */}
          <div className="mt-3 grid grid-cols-3 gap-2">
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
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-[#4a6670]" />
                <h3 className="font-semibold text-[#171532]">Transaction Ledger</h3>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#4a6670] text-white sticky top-0">
                      <th className="border border-[#3d565e] px-2 py-2 text-left font-semibold">S.No</th>
                      <th className="border border-[#3d565e] px-2 py-2 text-left font-semibold">Date</th>
                      <th className="border border-[#3d565e] px-2 py-2 text-right font-semibold">Deposit</th>
                      <th className="border border-[#3d565e] px-2 py-2 text-right font-semibold">Withdraw</th>
                      <th className="border border-[#3d565e] px-2 py-2 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.transactions.map((transaction: any, idx: number) => {
                      // Calculate running balance
                      let runningBalance = 0
                      for (let i = 0; i <= idx; i++) {
                        if (userData.transactions[i].type === 'deposit') {
                          runningBalance += userData.transactions[i].amount || 0
                        } else {
                          runningBalance -= userData.transactions[i].amount || 0
                        }
                      }
                      
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-[#f8f9fa]' : 'bg-white'}>
                          <td className="border border-[#e5e7eb] px-2 py-2 font-semibold text-[#171532]">{idx + 1}</td>
                          <td className="border border-[#e5e7eb] px-2 py-2 text-[#747384]">{transaction.date || '-'}</td>
                          <td className="border border-[#e5e7eb] px-2 py-2 text-right">
                            {transaction.type === 'deposit' ? (
                              <span className="text-[#10B981] font-semibold">₹{transaction.amount?.toFixed(2)}</span>
                            ) : (
                              <span className="text-[#747384]">-</span>
                            )}
                          </td>
                          <td className="border border-[#e5e7eb] px-2 py-2 text-right">
                            {transaction.type === 'withdraw' ? (
                              <span className="text-[#EF4444] font-semibold">₹{transaction.amount?.toFixed(2)}</span>
                            ) : (
                              <span className="text-[#747384]">-</span>
                            )}
                          </td>
                          <td className="border border-[#e5e7eb] px-2 py-2 text-right font-bold text-[#4a6670]">
                            ₹{runningBalance.toFixed(2)}
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
    </div>
  )
}
