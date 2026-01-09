import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const name = searchParams.get('name');
    const academicYear = searchParams.get('academicYear');
    
    if (!code && !name) {
      return NextResponse.json({ error: 'Code or name required' }, { status: 400 });
    }
    
    let query: any = {};
    if (code) {
      query.code = code.toUpperCase();
    } else if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (academicYear) {
      if (academicYear === '2024-25') {
        query.$or = [{ academicYear: '2024-25' }, { academicYear: { $exists: false } }, { academicYear: '' }];
      } else {
        query.academicYear = academicYear;
      }
    }
    
    const student = await Student.findOne(query);
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
