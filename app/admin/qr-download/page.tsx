"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Download, Printer, Loader2, Search, CheckCircle, Circle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  code: string
  academicYear: string
}

export default function QRDownloadPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          setFilteredStudents(data)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
        toast.error("Failed to load students")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  useEffect(() => {
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredStudents(filtered)
  }, [searchQuery, students])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s._id)))
    }
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    setIsDownloading(true)
    try {
      // Temporarily show only selected students for capture
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`QR_Codes_${selectedIds.size > 0 ? 'Selected' : 'Bulk'}_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success("QR Codes downloaded successfully")
    } catch (error) {
      console.error("PDF Generation error:", error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a6670]" />
      </div>
    )
  }

  const displayStudents = selectedIds.size > 0 
    ? students.filter(s => selectedIds.has(s._id))
    : filteredStudents

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Hidden on print */}
        <div className="flex flex-col gap-6 mb-8 print:hidden max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-colors shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
              </button>
              <h1 className="text-xl font-bold text-[#171532]">QR Download</h1>
            </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 bg-[#4a6670] hover:bg-[#3d565e] text-white rounded-xl shadow-sm transition-all active:scale-95"
              title="Print QR Codes"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="p-2.5 bg-[#10B981] hover:bg-[#0fa06f] text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Download PDF"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
          </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a6670] transition-all"
              />
            </div>
            <button
              onClick={selectAll}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-[#4a6670] hover:bg-gray-50 transition-all shadow-sm"
            >
              {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 ? "Deselect All" : "Select All"}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 font-medium">
            {selectedIds.size > 0 
              ? `${selectedIds.size} student(s) selected for download` 
              : `Showing ${filteredStudents.length} student(s). Select individual students or download all.`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Selection Grid - Hidden on print */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-h-[600px] overflow-y-auto print:hidden w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStudents.map((student) => (
                <button
                  key={student._id}
                  onClick={() => toggleSelect(student._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedIds.has(student._id)
                      ? "bg-[#4a6670]/5 border-[#4a6670] ring-1 ring-[#4a6670]"
                      : "bg-white border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {selectedIds.has(student._id) ? (
                    <CheckCircle className="w-5 h-5 text-[#4a6670]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-bold text-[#171532] truncate">{student.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{student.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* A4 Preview Container - Visible for Print, Hidden for Web (using visibility: hidden instead of fixed position) */}
          <div className="bg-white mx-auto print:m-0 print:block hidden" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
            <div ref={printRef} className="bg-white">
              <h2 className="text-center text-xl font-bold mb-6 text-gray-800">JDSA Student QR Codes</h2>
              
              <div className="grid grid-cols-7 gap-2">
                {displayStudents.map((student) => (
                  <div key={student._id} className="flex flex-col items-center p-2 border border-gray-100 rounded">
                    <div className="bg-white p-1">
                      <QRCodeSVG 
                        value={`https://jdsa-students-bank.vercel.app/login?code=${student.code}`} 
                        size={80} 
                        level="M" 
                      />
                    </div>
                    <p className="text-[8px] font-bold text-center mt-1 truncate w-full">{student.name}</p>
                    <p className="text-[7px] text-gray-500 text-center uppercase">{student.code}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Warning */}
        <div className="mt-8 text-center text-sm text-gray-500 md:hidden print:hidden">
          Note: For best layout results, use a desktop browser to download or print.
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\:hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
