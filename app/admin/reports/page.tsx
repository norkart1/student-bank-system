'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (transactions: Transaction[], stopIndex: number) => {
    let balance = 0;
    for (let i = 0; i <= stopIndex; i++) {
      if (transactions[i].type === 'deposit') {
        balance += transactions[i].amount;
      } else {
        balance -= transactions[i].amount;
      }
    }
    return balance;
  };

  const exportPDF = () => {
    if (!selectedStudent) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Transaction Ledger', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Student Info
    doc.setFontSize(11);
    doc.text(`Student: ${selectedStudent.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Code: ${selectedStudent.code}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Current Balance: ₹${selectedStudent.balance.toFixed(2)}`, 20, yPosition);
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
    selectedStudent.transactions.forEach((transaction, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      xPosition = 20;
      const balance = calculateBalance(selectedStudent.transactions, index);
      const sno = index + 1;
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

    doc.save(`${selectedStudent.name}-report.pdf`);
  };

  const exportExcel = () => {
    if (!selectedStudent) return;

    const data = selectedStudent.transactions.map((transaction, index) => ({
      'S.No': index + 1,
      Date: transaction.date || 'N/A',
      Deposit: transaction.type === 'deposit' ? transaction.amount : '',
      Withdraw: transaction.type === 'withdraw' ? transaction.amount : '',
      Balance: calculateBalance(selectedStudent.transactions, index),
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
    XLSX.writeFile(wb, `${selectedStudent.name}-report.xlsx`);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Reports</h1>

          {/* Report Type Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">Report Type</label>
            <Select defaultValue="individual">
              <SelectTrigger className="w-full h-12 border-2 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select Student Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">Select Student</label>
            <Select
              value={selectedStudent?._id || ''}
              onValueChange={(id: string) => {
                const student = students.find((s) => s._id === id);
                setSelectedStudent(student || null);
              }}
            >
              <SelectTrigger className="w-full h-12 border-2 border-gray-200">
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={exportPDF}
              disabled={!selectedStudent}
              className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
              </svg>
              PDF
            </Button>
            <Button
              onClick={exportExcel}
              disabled={!selectedStudent}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 0l-4 4m4-4l4 4" />
              </svg>
              Excel
            </Button>
          </div>

          {/* Transaction Ledger */}
          {selectedStudent && (
            <>
              {selectedStudent.transactions && selectedStudent.transactions.length > 0 ? (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Ledger</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-700 text-white">
                          <th className="px-4 py-3 text-left">S.No</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-right">Deposit</th>
                          <th className="px-4 py-3 text-right">Withdraw</th>
                          <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.transactions.map((transaction, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3">{transaction.date || 'N/A'}</td>
                            <td className="px-4 py-3 text-right">
                              {transaction.type === 'deposit' && (
                                <span className="text-green-600 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                              )}
                              {transaction.type !== 'deposit' && <span className="text-gray-400">–</span>}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {transaction.type === 'withdraw' && (
                                <span className="text-red-600 font-semibold">₹{transaction.amount.toFixed(2)}</span>
                              )}
                              {transaction.type !== 'withdraw' && <span className="text-gray-400">–</span>}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              ₹{calculateBalance(selectedStudent.transactions, index).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      Current Balance: <span className="text-blue-600">₹{selectedStudent.balance.toFixed(2)}</span>
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No transactions found for this student.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
