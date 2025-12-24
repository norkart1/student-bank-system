import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify admin login with password "12345"
 * This helps debug password hashing issues
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = '12345'; // Test password

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found',
        username,
      });
    }

    // Test password comparison
    const isMatch = await admin.comparePassword(password);

    return NextResponse.json({
      success: isMatch,
      message: isMatch ? 'Password matches!' : 'Password does not match',
      username,
      adminId: admin._id.toString(),
      hashedPasswordLength: admin.password.length,
      isMatch,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Test failed',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
