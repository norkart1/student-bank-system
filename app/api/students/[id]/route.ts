import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const student = await Student.findById(params.id);
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();
    const student = await Student.findByIdAndUpdate(params.id, data, { new: true });
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Student.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
