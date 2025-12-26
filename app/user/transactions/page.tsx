"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ArrowLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { format, parse, isWithinInterval, startOfDay, endOfDay } from "date-fns"

export default function TransactionsCalendar() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        method: 'GET',
        cache: 'no-store',
      })
      
      if (!res.ok) return
      
      const student = await res.json()
      setUserData({
        id: student._id,
        name: student.name,
        code: student.code,
        balance: student.balance,
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    if (!userData?.transactions) return

    const dayTransactions = userData.transactions.filter((t: any) => {
      try {
        const transactionDate = parse(t.date, "dd/MM/yyyy", new Date())
        return format(transactionDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      } catch {
        return false
      }
    })
    
    setFilteredTransactions(dayTransactions)
  }

  const getDatesWithTransactions = () => {
    if (!userData?.transactions) return new Set()
    const dates = new Set<string>()
    userData.transactions.forEach((t: any) => {
      try {
        const transactionDate = parse(t.date, "dd/MM/yyyy", new Date())
        dates.add(format(transactionDate, "yyyy-MM-dd"))
      } catch {
        // Skip invalid dates
      }
    })
    return dates
  }

  const datesWithTransactions = getDatesWithTransactions()
  const today = new Date()
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1)
    return date.getMonth() === today.getMonth() ? date : null
  }).filter(Boolean) as Date[]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
        <div className="max-w-md mx-auto flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#4a6670] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-[#747384]">Loading transactions...</p>
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
            <Calendar className="w-5 h-5 text-[#4a6670]" />
            <h1 className="text-2xl font-bold text-[#171532]">Filter by Date</h1>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#171532] mb-4">
            {format(today, "MMMM yyyy")}
          </h2>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-bold text-[#747384] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((date, idx) => {
              const dateStr = format(date, "yyyy-MM-dd")
              const hasTransaction = datesWithTransactions.has(dateStr)
              const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateStr

              return (
                <button
                  key={idx}
                  onClick={() => handleDateSelect(date)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-colors ${
                    isSelected
                      ? "bg-[#4a6670] text-white"
                      : hasTransaction
                      ? "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9]"
                      : "bg-[#f5f5f5] text-[#747384] hover:bg-[#e8e8e8]"
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Transactions for selected date */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#171532] mb-4">
              Transactions on {format(selectedDate, "dd MMM yyyy")}
            </h3>

            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb] hover:border-[#4a6670] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownLeft className={`w-5 h-5 text-green-600`} />
                        ) : (
                          <ArrowUpRight className={`w-5 h-5 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#171532] capitalize">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-[#747384]">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-lg ${
                      transaction.type === 'deposit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#747384] py-8">No transactions on this date</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
