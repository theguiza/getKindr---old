// /app/api/events/rejectApplication/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'No applicationId provided' }, { status: 400 });
    }

    const application = await prisma.eventApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 });
  }
}