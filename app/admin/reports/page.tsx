'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: number;
  date?: string;
  reason?: string;
}

interface Student {
  _id: string;
  name: string;
  code: string;
  balance: number;
  transactions: Transaction[];
}

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reportType, setReportType] = useState<'individual' | 'monthly' | 'yearly'>('individual');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filteredTransactions, setFilteredTransactions] = useState<(Transaction & { index: number })[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const calculateBalance = (transactions: (Transaction & { index: number })[], stopIndex: number) => {
    let balance = 0;
    for (let i = 0; i <= stopIndex; i++) {
      const transaction = transactions[i];
      if (transaction.type === 'deposit') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
    }
    return balance;
  };

  const filterTransactions = () => {
    if (!selectedStudent) return;

    let filtered = selectedStudent.transactions.map((t, idx) => ({ ...t, index: idx }));

    if (reportType === 'monthly' && selectedMonth) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date || '');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return month === selectedMonth;
      });
    } else if (reportType === 'yearly') {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date || '');
        return date.getFullYear().toString() === selectedYear;
      });
    }

    setFilteredTransactions(filtered);
    setShowResults(true);
  };

  const exportPDF = () => {
    if (!selectedStudent || filteredTransactions.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    const reportTitle = reportType === 'individual' ? 'Individual Report' : 
                       reportType === 'monthly' ? `Monthly Report - ${selectedMonth}/2025` : 
                       `Yearly Report - ${selectedYear}`;
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Student Info
    doc.setFontSize(11);
    doc.text(`Student: ${selectedStudent.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Code: ${selectedStudent.code}`, 20, yPosition);
    yPosition += 15;

    // Table Headers
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(45, 85, 120);

    const columnWidths = [15, 30, 25, 25, 25];
    const headers = ['S.No', 'Date', 'Deposit', 'Withdraw', 'Balance'];
    let xPosition = 20;

    headers.forEach((header, index) => {
      doc.rect(xPosition, yPosition - 5, columnWidths[index], 8, 'F');
      doc.text(header, xPosition + columnWidths[index] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[index];
    });

    yPosition += 10;
    doc.setTextColor(0, 0, 0);

    // Table Rows
    filteredTransactions.forEach((transaction, displayIdx) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      xPosition = 20;
      const balance = calculateBalance(filteredTransactions, displayIdx);
      const sno = displayIdx + 1;
      const date = transaction.date || 'N/A';
      const deposit = transaction.type === 'deposit' ? `₹${transaction.amount.toFixed(2)}` : '–';
      const withdraw = transaction.type === 'withdraw' ? `₹${transaction.amount.toFixed(2)}` : '–';

      doc.text(sno.toString(), xPosition + columnWidths[0] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[0];
      doc.text(date, xPosition + columnWidths[1] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[1];
      doc.text(deposit, xPosition + columnWidths[2] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[2];
      doc.text(withdraw, xPosition + columnWidths[3] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[3];
      doc.text(`₹${balance.toFixed(2)}`, xPosition + columnWidths[4] / 2, yPosition, { align: 'center' });

      yPosition += 7;
    });

    const fileName = reportType === 'individual' ? `${selectedStudent.name}-report.pdf` :
                    reportType === 'monthly' ? `${selectedStudent.name}-monthly-${selectedMonth}.pdf` :
                    `${selectedStudent.name}-yearly-${selectedYear}.pdf`;
    doc.save(fileName);
  };

  const exportExcel = () => {
    if (!selectedStudent || filteredTransactions.length === 0) return;

    const data = filteredTransactions.map((transaction, index) => ({
      'S.No': index + 1,
      Date: transaction.date || 'N/A',
      Deposit: transaction.type === 'deposit' ? transaction.amount : '',
      Withdraw: transaction.type === 'withdraw' ? transaction.amount : '',
      Balance: calculateBalance(filteredTransactions, index),
      Reason: transaction.reason || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    const fileName = reportType === 'individual' ? `${selectedStudent.name}-report.xlsx` :
                    reportType === 'monthly' ? `${selectedStudent.name}-monthly-${selectedMonth}.xlsx` :
                    `${selectedStudent.name}-yearly-${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Student Reports</h1>
          <p className="text-slate-300">Search and download transaction reports</p>
        </div>

        {/* Search Card */}
        <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-lg font-semibold text-slate-100 mb-3">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => {
                setReportType(value);
                setShowResults(false);
                setFilteredTransactions([]);
              }}>
                <SelectTrigger className="w-full h-12 border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="individual">Individual Student Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-lg font-semibold text-slate-100 mb-3">Select Student</label>
              <Select
                value={selectedStudent?._id || ''}
                onValueChange={(id: string) => {
                  const student = students.find((s) => s._id === id);
                  setSelectedStudent(student || null);
                  setShowResults(false);
                  setFilteredTransactions([]);
                }}
              >
                <SelectTrigger className="w-full h-12 border-slate-600 bg-slate-700 text-white">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.name} ({student.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Filter */}
            {reportType === 'monthly' && (
              <div>
                <label className="block text-lg font-semibold text-slate-100 mb-3">Select Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full h-12 border-slate-600 bg-slate-700 text-white">
                    <SelectValue placeholder="Select month..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[
                      { value: '01', label: 'January' },
                      { value: '02', label: 'February' },
                      { value: '03', label: 'March' },
                      { value: '04', label: 'April' },
                      { value: '05', label: 'May' },
                      { value: '06', label: 'June' },
                      { value: '07', label: 'July' },
                      { value: '08', label: 'August' },
                      { value: '09', label: 'September' },
                      { value: '10', label: 'October' },
                      { value: '11', label: 'November' },
                      { value: '12', label: 'December' },
                    ].map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Yearly Filter */}
            {reportType === 'yearly' && (
              <div>
                <label className="block text-lg font-semibold text-slate-100 mb-3">Select Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full h-12 border-slate-600 bg-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Search Button */}
            {selectedStudent && (reportType === 'individual' || (reportType === 'monthly' && selectedMonth) || (reportType === 'yearly')) && (
              <Button
                onClick={filterTransactions}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Report
              </Button>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {showResults && selectedStudent && (
          <div className="space-y-8">
            {/* Student Info */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Student Name</p>
                  <p className="text-white text-lg font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Student Code</p>
                  <p className="text-white text-lg font-semibold">{selectedStudent.code}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Transactions</p>
                  <p className="text-white text-lg font-semibold">{filteredTransactions.length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Report Type</p>
                  <p className="text-blue-400 text-lg font-semibold capitalize">{reportType}</p>
                </div>
              </div>
            </Card>

            {/* Transaction Ledger */}
            {filteredTransactions.length > 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Transaction Ledger</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700 border-b border-slate-600">
                        <th className="px-4 py-4 text-left text-slate-200 font-semibold">S.No</th>
                        <th className="px-4 py-4 text-left text-slate-200 font-semibold">Date</th>
                        <th className="px-4 py-4 text-right text-slate-200 font-semibold">Deposit</th>
                        <th className="px-4 py-4 text-right text-slate-200 font-semibold">Withdraw</th>
                        <th className="px-4 py-4 text-right text-slate-200 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction, index) => (
                        <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                          <td className="px-4 py-4 text-slate-300">{index + 1}</td>
                          <td className="px-4 py-4 text-slate-300">{transaction.date || 'N/A'}</td>
                          <td className="px-4 py-4 text-right">
                            {transaction.type === 'deposit' && (
                              <span className="text-green-400 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                            )}
                            {transaction.type !== 'deposit' && <span className="text-slate-500">–</span>}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {transaction.type === 'withdraw' && (
                              <span className="text-red-400 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                            )}
                            {transaction.type !== 'withdraw' && <span className="text-slate-500">–</span>}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-200 font-semibold">
                            ₹{calculateBalance(filteredTransactions, index).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <p className="text-slate-300 text-lg">No transactions found for the selected criteria.</p>
              </Card>
            )}

            {/* Download Buttons */}
            {filteredTransactions.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Download Report</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={exportPDF}
                    className="h-14 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
                    </svg>
                    Download PDF
                  </Button>
                  <Button
                    onClick={exportExcel}
                    className="h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
                    </svg>
                    Download Excel
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
