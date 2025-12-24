import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'ADMIN_USERNAME and ADMIN_PASSWORD environment variables not set' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    
    if (existingAdmin) {
      // Update password if admin exists
      existingAdmin.password = password;
      await existingAdmin.save();
      return NextResponse.json({
        success: true,
        message: 'Admin password updated',
        admin: {
          id: existingAdmin._id,
          username: existingAdmin.username,
          name: existingAdmin.name,
        },
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      password,
      name: 'Administrator',
      role: 'admin',
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    return NextResponse.json(
      { error: 'Initialization failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow GET request to trigger initialization
  return POST(req);
}
