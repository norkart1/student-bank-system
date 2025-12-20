"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { defaultStudents } from "@/lib/students"

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
      } else {
        // Check if username matches any student
        const student = defaultStudents.find(
          (s) => s.username === username && s.password === password
        )
        if (student) {
          localStorage.setItem("isUserAuthenticated", "true")
          localStorage.setItem("userRole", "student")
          localStorage.setItem("studentId", student.id)
          localStorage.setItem("studentName", student.name)
          router.push("/user/dashboard")
        } else {
          // Check custom accounts created by users
          const customAccounts = JSON.parse(localStorage.getItem("customAccounts") || "[]")
          const customAccount = customAccounts.find(
            (acc: any) => acc.username === username && acc.password === password
          )
          if (customAccount) {
            localStorage.setItem("isUserAuthenticated", "true")
            localStorage.setItem("userRole", "custom")
            localStorage.setItem("customAccountId", customAccount.id)
            localStorage.setItem("customUsername", customAccount.username)
            router.push("/user/dashboard")
          } else {
            setError("Invalid username or password")
            setIsLoading(false)
          }
        }
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-b from-[#2a5f6f] to-[#1a3f4f] relative overflow-hidden">
        <Image
          src="/islamic-mosque.jpg"
          alt="Islamic artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 md:py-16 justify-start md:justify-center">
        <Link href="/">
          <div className="w-10 h-10 bg-[#4a6670] rounded-full flex items-center justify-center hover:bg-[#3d565e] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            Hey,<br />Welcome Back
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 pl-12 pr-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4a6670] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  )
}
