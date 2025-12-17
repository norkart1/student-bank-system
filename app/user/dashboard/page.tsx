"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, LogOut, ArrowUpRight, ArrowDownRight, History } from "lucide-react"

export default function UserDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const auth = localStorage.getItem("isUserAuthenticated")
    const role = localStorage.getItem("userRole")
    if (auth !== "true" || role !== "user") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      const savedStudents = localStorage.getItem("students")
      if (savedStudents) {
        const students = JSON.parse(savedStudents)
        const currentUser = students.find((s: any) => s.name === "Demo User") || students[0]
        setUserData(currentUser || { name: "Demo User", balance: 0, transactions: [] })
      } else {
        setUserData({ name: "Demo User", balance: 500, transactions: [] })
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isUserAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  if (!isAuthenticated || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7fc] to-[#e8e0f0]">
      <header className="bg-white border-b border-[#e2e0ec] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7056B2] to-[#55389B] rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#171532]">JDSA Students Bank</h1>
                <p className="text-sm text-[#747384]">Welcome, {userData.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-[#e2e0ec] text-[#747384] hover:text-[#7056B2] hover:border-[#7056B2]">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6 border-0 bg-gradient-to-br from-[#7056B2] to-[#55389B] text-white shadow-xl">
          <CardContent className="p-6">
            <p className="text-white/70 text-sm font-medium mb-1">Current Balance</p>
            <p className="text-4xl font-bold">${userData.balance?.toFixed(2) || "0.00"}</p>
            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
                <ArrowDownRight className="w-4 h-4" />
                Deposit
              </Button>
              <Button className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-[#e2e0ec]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#747384]">Transactions</CardTitle>
              <History className="w-5 h-5 text-[#7056B2]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#171532]">{userData.transactions?.length || 0}</div>
              <p className="text-xs text-[#747384] mt-1">Total transactions</p>
            </CardContent>
          </Card>

          <Card className="border-[#e2e0ec]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#747384]">Account Status</CardTitle>
              <TrendingUp className="w-5 h-5 text-[#D975BB]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#10B981]">Active</div>
              <p className="text-xs text-[#747384] mt-1">Your account is in good standing</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#e2e0ec]">
          <CardHeader>
            <CardTitle className="text-[#171532]">Recent Transactions</CardTitle>
            <CardDescription className="text-[#747384]">Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.transactions && userData.transactions.length > 0 ? (
              <div className="space-y-3">
                {userData.transactions.slice(-5).reverse().map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#f8f7fc] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'deposit' ? 'bg-[#10B981]/10' : 'bg-[#EF4444]/10'}`}>
                        {t.type === 'deposit' ? (
                          <ArrowDownRight className="w-5 h-5 text-[#10B981]" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-[#EF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#171532] capitalize">{t.type}</p>
                        <p className="text-xs text-[#747384]">{t.date || 'Recent'}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${t.type === 'deposit' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {t.type === 'deposit' ? '+' : '-'}${t.amount?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#747384]">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
