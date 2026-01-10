import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get('academicYear');
    
    let student;
    if (academicYear) {
      // Find the student by code and academic year if code is available
      const currentStudent = await Student.findById(id);
      if (currentStudent && currentStudent.code) {
        student = await Student.findOne({ 
          code: currentStudent.code, 
          academicYear: academicYear 
        });
      }
    }
    
    if (!student) {
      student = await Student.findById(id);
    }
    
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Prevent caching to ensure fresh data
    const response = NextResponse.json(student);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await req.json();
    
    // Only update allowed fields
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
    if (data.balance !== undefined) updateData.balance = data.balance;
    if (data.transactions !== undefined) updateData.transactions = data.transactions;
    
    const student = await Student.findByIdAndUpdate(id, updateData, { new: true });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    
    // Prevent caching to ensure fresh data
    const response = NextResponse.json(student);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update student', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    await Student.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
