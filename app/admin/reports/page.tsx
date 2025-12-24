'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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
  const [searchType, setSearchType] = useState<'student' | 'date' | 'month' | 'year'>('student');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filteredTransactions, setFilteredTransactions] = useState<(Transaction & { index: number })[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentSearch.trim() === '') {
      setFilteredStudents([]);
    } else {
      const query = studentSearch.toLowerCase();
      setFilteredStudents(
        students.filter(
          (student) =>
            student.name.toLowerCase().includes(query) ||
            student.code.toLowerCase().includes(query) ||
            student._id.toLowerCase().includes(query)
        )
      );
    }
  }, [studentSearch, students]);

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
    let filtered: (Transaction & { index: number })[] = [];

    if (searchType === 'student') {
      if (!selectedStudent) return;
      filtered = selectedStudent.transactions.map((t, idx) => ({ ...t, index: idx }));
    } else if (searchType === 'date') {
      if (!startDate || !endDate) return;
      const start = new Date(startDate);
      const end = new Date(endDate);
      students.forEach((student) => {
        student.transactions.forEach((t, idx) => {
          const tDate = new Date(t.date || '');
          if (tDate >= start && tDate <= end) {
            filtered.push({ ...t, index: idx });
          }
        });
      });
    } else if (searchType === 'month') {
      if (!selectedMonth) return;
      const [year, month] = selectedMonth.split('-');
      students.forEach((student) => {
        student.transactions.forEach((t, idx) => {
          const tDate = new Date(t.date || '');
          if (tDate.getFullYear().toString() === year && (tDate.getMonth() + 1).toString().padStart(2, '0') === month) {
            filtered.push({ ...t, index: idx });
          }
        });
      });
    } else if (searchType === 'year') {
      students.forEach((student) => {
        student.transactions.forEach((t, idx) => {
          const tDate = new Date(t.date || '');
          if (tDate.getFullYear().toString() === selectedYear) {
            filtered.push({ ...t, index: idx });
          }
        });
      });
    }

    setFilteredTransactions(filtered);
    setShowResults(true);
  };

  const exportPDF = () => {
    if (filteredTransactions.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.text('Transaction Ledger Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Report Info
    doc.setFontSize(10);
    if (searchType === 'student' && selectedStudent) {
      doc.text(`Student: ${selectedStudent.name} (${selectedStudent.code})`, 20, yPosition);
      yPosition += 7;
    } else if (searchType === 'date') {
      doc.text(`Date Range: ${startDate} to ${endDate}`, 20, yPosition);
      yPosition += 7;
    } else if (searchType === 'month') {
      doc.text(`Month: ${selectedMonth}`, 20, yPosition);
      yPosition += 7;
    } else if (searchType === 'year') {
      doc.text(`Year: ${selectedYear}`, 20, yPosition);
      yPosition += 7;
    }
    yPosition += 8;

    // Table Headers
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(79, 117, 135);
    const columnWidths = [15, 35, 25, 25, 25];
    const headers = ['S.No', 'Date', 'Deposit', 'Withdraw', 'Balance'];
    let xPosition = 20;

    headers.forEach((header, index) => {
      doc.rect(xPosition, yPosition - 5, columnWidths[index], 8, 'F');
      doc.text(header, xPosition + columnWidths[index] / 2, yPosition, { align: 'center' });
      xPosition += columnWidths[index];
    });

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    // Table Rows
    filteredTransactions.forEach((transaction, displayIdx) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      xPosition = 20;
      const balance = calculateBalance(filteredTransactions, displayIdx);
      const date = transaction.date || 'N/A';
      const deposit = transaction.type === 'deposit' ? `₹${transaction.amount.toFixed(2)}` : '–';
      const withdraw = transaction.type === 'withdraw' ? `₹${transaction.amount.toFixed(2)}` : '–';

      doc.text((displayIdx + 1).toString(), xPosition + columnWidths[0] / 2, yPosition, { align: 'center' });
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

    doc.save(`transaction-ledger-${searchType}.pdf`);
  };

  const exportExcel = () => {
    if (filteredTransactions.length === 0) return;

    const data = filteredTransactions.map((transaction, index) => ({
      'S.No': index + 1,
      Date: transaction.date || 'N/A',
      Deposit: transaction.type === 'deposit' ? transaction.amount : '',
      Withdraw: transaction.type === 'withdraw' ? transaction.amount : '',
      Balance: calculateBalance(filteredTransactions, index),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    XLSX.writeFile(wb, `transaction-ledger-${searchType}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Search and view transaction ledgers</p>
        </div>

        {/* Search Card */}
        <Card className="p-6 mb-8 bg-white shadow">
          <div className="space-y-6">
            {/* Search Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search By</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'student', label: 'Student' },
                  { value: 'date', label: 'Date Range' },
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSearchType(option.value as any);
                      setShowResults(false);
                      setFilteredTransactions([]);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      searchType === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Search */}
            {searchType === 'student' && (
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search Student</label>
                <input
                  type="text"
                  placeholder="Enter student name, code, or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setStudentSearch(student.name);
                          setShowStudentDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.code}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date Range */}
            {searchType === 'date' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Month Selection */}
            {searchType === 'month' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Year Selection */}
            {searchType === 'year' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Button */}
            {(
              (searchType === 'student' && selectedStudent) ||
              (searchType === 'date' && startDate && endDate) ||
              (searchType === 'month' && selectedMonth) ||
              searchType === 'year'
            ) && (
              <button
                onClick={filterTransactions}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Search Report
              </button>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {showResults && filteredTransactions.length > 0 && (
          <div className="space-y-6">
            {/* Transaction Ledger */}
            <Card className="p-4 bg-white shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Ledger</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                      <th className="px-2 py-2 text-left font-semibold text-xs">S.No</th>
                      <th className="px-2 py-2 text-left font-semibold text-xs">Date</th>
                      <th className="px-2 py-2 text-right font-semibold text-xs">Deposit</th>
                      <th className="px-2 py-2 text-right font-semibold text-xs">Withdraw</th>
                      <th className="px-2 py-2 text-right font-semibold text-xs">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-2 py-2 text-gray-700 text-xs">{index + 1}</td>
                        <td className="px-2 py-2 text-gray-700 text-xs">{transaction.date || 'N/A'}</td>
                        <td className="px-2 py-2 text-right text-xs">
                          {transaction.type === 'deposit' && (
                            <span className="text-green-600 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                          )}
                          {transaction.type !== 'deposit' && <span className="text-gray-400">–</span>}
                        </td>
                        <td className="px-2 py-2 text-right text-xs">
                          {transaction.type === 'withdraw' && (
                            <span className="text-red-600 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                          )}
                          {transaction.type !== 'withdraw' && <span className="text-gray-400">–</span>}
                        </td>
                        <td className="px-2 py-2 text-right text-gray-900 font-semibold text-xs">
                          ₹{calculateBalance(filteredTransactions, index).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Download Buttons */}
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Download Report</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={exportPDF}
                  className="h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
                  </svg>
                  Download PDF
                </Button>
                <Button
                  onClick={exportExcel}
                  className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
                  </svg>
                  Download Excel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {showResults && filteredTransactions.length === 0 && (
          <Card className="p-12 bg-white shadow text-center">
            <p className="text-gray-600 text-lg">No transactions found for the selected criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
