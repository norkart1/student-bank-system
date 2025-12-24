import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminExists = await Admin.findOne({ username: adminUsername });

    if (!adminExists) {
      return NextResponse.json({
        status: 'not_initialized',
        message: 'Admin account not found in database',
        username: adminUsername,
        hasEnvVars: !!process.env.ADMIN_USERNAME && !!process.env.ADMIN_PASSWORD,
      });
    }

    return NextResponse.json({
      status: 'initialized',
      message: 'Admin account found in database',
      admin: {
        id: adminExists._id.toString(),
        username: adminExists.username,
        name: adminExists.name,
        role: adminExists.role,
        hasPassword: !!adminExists.password,
        createdAt: adminExists.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check admin status',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
