import { connectDB } from "@/lib/mongodb"
import { Student } from "@/lib/models/Student"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const body = await req.json()
    const { date, type } = body
    const amount = Number(parseFloat(body.amount).toFixed(2))

    if (!date || !type || isNaN(amount)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const student = await Student.findById(id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    student.transactions.push({ date, type, amount })

    const balanceChange = type === 'deposit' ? amount : -amount
    student.balance += balanceChange
    
    student.markModified('transactions')

    await student.save()

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error adding transaction:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
