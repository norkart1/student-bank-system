"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Lock, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SecretAdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, type: 'password' }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push("/admin/dashboard")
        return
      }

      setError(data.error || "Invalid credentials")
      setIsLoading(false)
    } catch (err) {
      setError("Login error. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      <div className="hidden md:block w-1/2 bg-gradient-to-b from-[#2a5f6f] to-[#1a3f4f] relative overflow-hidden">
        <Image
          src="/islamic-mosque.jpg"
          alt="Islamic artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 md:py-16 justify-start md:justify-center">
        <Link href="/login">
          <div className="w-10 h-10 bg-[#2d6a4f] rounded-full flex items-center justify-center hover:bg-[#1b4332] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 mb-6 relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#2d6a4f]/10">
            <Image
              src="/students_logo.png"
              alt="JDSA Students Bank"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            JDSA<br />Students Bank
          </h1>
          <p className="text-sm text-[#6b7280] mt-2">Secret Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <User className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-8 space-y-4">
          <Link href="/admin-login" className="block text-xs text-[#2d6a4f] hover:text-[#1b4332] underline transition-colors">
            Use OTP Login
          </Link>
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto px-4">
            By logging in, you agree to our Terms and Conditions. This system is for authorized personnel only. All activities are logged.
          </p>
        </div>
      </div>
    </div>
  )
}
