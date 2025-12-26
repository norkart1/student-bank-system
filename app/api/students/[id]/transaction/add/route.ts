import { connectDB } from "@/lib/db"
import Student from "@/lib/models/Student"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await req.json()
    const { date, type, amount } = body

    if (!date || !type || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const student = await Student.findById(params.id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Add new transaction
    student.transactions.push({ date, type, amount })

    // Update balance
    const balanceChange = type === 'deposit' ? amount : -amount
    student.balance += balanceChange

    await student.save()

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
