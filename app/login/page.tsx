"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"code" | "name">("code")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const query = searchType === "code" 
        ? `code=${encodeURIComponent(searchQuery.toUpperCase())}` 
        : `name=${encodeURIComponent(searchQuery)}`
      
      const res = await fetch(`/api/students/search?${query}`)
      
      if (!res.ok) {
        setError("Account holder not found")
        setIsLoading(false)
        return
      }

      const student = await res.json()
      
      // Create session via MongoDB instead of localStorage
      const sessionRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: searchType === "code" ? searchQuery.toUpperCase() : undefined,
          name: searchType === "name" ? searchQuery : undefined,
          type: "user"
        })
      })
      
      if (sessionRes.ok) {
        router.push("/user/dashboard")
      } else {
        setError("Failed to create session")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Search error. Please try again.")
      setIsLoading(false)
    }
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
            Find Your<br />Account
          </h1>
          <p className="text-[#6b7280] mt-2">Search by account code or full name</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 max-w-md">
          {/* Search Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSearchType("code")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                searchType === "code"
                  ? "bg-[#4a6670] text-white"
                  : "bg-[#e5e7eb] text-[#171532] hover:bg-[#d1d5db]"
              }`}
            >
              By Code
            </button>
            <button
              type="button"
              onClick={() => setSearchType("name")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                searchType === "name"
                  ? "bg-[#4a6670] text-white"
                  : "bg-[#e5e7eb] text-[#171532] hover:bg-[#d1d5db]"
              }`}
            >
              By Name
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder={searchType === "code" ? "e.g., MR-5774" : "Enter full name"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
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
            className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>

        <p className="text-sm text-[#6b7280] mt-8">
          Don't have an account code? Contact administration for assistance.
        </p>

        <div className="text-center mt-6">
          <Link href="/admin-login" className="text-xs text-[#4a6670] hover:text-[#3d565e] underline transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
