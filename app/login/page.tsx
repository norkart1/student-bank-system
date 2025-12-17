"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Wallet, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (username === "admin" && password === "12345") {
        localStorage.setItem("isAdminAuthenticated", "true")
        localStorage.setItem("userRole", "admin")
        router.push("/admin/dashboard")
      } else if (username === "user" && password === "12345") {
        localStorage.setItem("isUserAuthenticated", "true")
        localStorage.setItem("userRole", "user")
        router.push("/user/dashboard")
      } else {
        setError("Invalid username or password")
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e8e0f0] via-[#d4c8e8] to-[#c9b8e0] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#d4c8e8] rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#c9b8e0] rounded-full opacity-60 blur-3xl"></div>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-[#7056B2] hover:text-[#55389B] hover:bg-[#7056B2]/10">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#7056B2] to-[#55389B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7056B2]/30">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#171532]">Welcome Back</CardTitle>
            <CardDescription className="text-[#747384] mt-1">Sign in to JDSA Students Bank</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#171532] font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-[#f8f7fc] border-[#e2e0ec] focus:border-[#7056B2] focus:ring-[#7056B2]/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#171532] font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-[#f8f7fc] border-[#e2e0ec] focus:border-[#7056B2] focus:ring-[#7056B2]/20 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747384] hover:text-[#7056B2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#7056B2] to-[#55389B] hover:from-[#8462E1] hover:to-[#7056B2] rounded-xl shadow-lg shadow-[#7056B2]/20 transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e2e0ec]">
            <p className="text-center text-sm text-[#747384]">
              Demo Credentials
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#f8f7fc] p-3 rounded-xl">
                <p className="font-semibold text-[#7056B2]">Admin</p>
                <p className="text-[#747384]">admin / 12345</p>
              </div>
              <div className="bg-[#f8f7fc] p-3 rounded-xl">
                <p className="font-semibold text-[#D975BB]">User</p>
                <p className="text-[#747384]">user / 12345</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
