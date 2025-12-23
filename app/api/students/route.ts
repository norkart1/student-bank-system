import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find({});
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    const student = new Student(data);
    await student.save();
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
