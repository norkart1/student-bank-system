"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Download, Printer, Loader2 } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
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

  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    setIsDownloading(true)
    try {
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
      pdf.save(`QR_Codes_Bulk_${new Date().toISOString().split('T')[0]}.pdf`)
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 text-[#4a6670]" />
            </button>
            <h1 className="text-2xl font-bold text-[#171532]">QR Codes Bulk Download</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#4a6670] hover:bg-[#3d565e] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#0fa06f] text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Download PDF
            </button>
          </div>
        </div>

        {/* A4 Content Container */}
        <div className="bg-white shadow-xl mx-auto overflow-hidden print:shadow-none print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
          <div ref={printRef} className="bg-white">
            <h2 className="text-center text-xl font-bold mb-6 text-gray-800 print:block hidden">JDSA Student QR Codes</h2>
            
            {/* 7 items per row grid */}
            <div className="grid grid-cols-7 gap-2">
              {students.map((student) => (
                <div key={student._id} className="flex flex-col items-center p-2 border border-gray-100 rounded">
                  <div className="bg-white p-1">
                    <QRCodeSVG value={student.code} size={80} level="M" />
                  </div>
                  <p className="text-[8px] font-bold text-center mt-1 truncate w-full">{student.name}</p>
                  <p className="text-[7px] text-gray-500 text-center uppercase">{student.code}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile Warning */}
        <div className="mt-4 text-center text-sm text-gray-500 md:hidden print:hidden">
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
