"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  ArrowLeft, 
  Search, 
  ChevronRight,
  Loader,
  Plus
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function TeacherAccountsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
        }
      } catch (err) {
        console.error("Fetch accounts error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const filteredStudents = students.filter(s => 
    (s.academicYear === selectedAcademicYear) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/teacher/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Student Accounts</h1>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search students..."
              className="pl-12 h-12 bg-gray-50 border-none rounded-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Link 
              key={student._id}
              href={`/teacher/dashboard/transactions/${student._id}`}
              className="block group"
            >
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-bold text-[#1a1a2e]">#{student.code}</h4>
                  <span className="px-3 py-1 bg-[#e7f5ee] text-[#2d6a4f] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400">Student</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#2d4b3d] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#1a1a2e]">{student.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="text-sm font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400">Year</span>
                    <span className="text-sm font-medium text-gray-600">{student.academicYear || '2025-26'}</span>
                  </div>
                </div>
                
                <div className="absolute right-4 bottom-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#2d6a4f] group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
