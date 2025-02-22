import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, volunteerId } = body;

    console.log('Received body:', body);

    const application = await prisma.eventApplication.create({
      data: {
        eventId,
        volunteerId,
        status: 'PENDING',
      },
    });

    console.log('Application created:', application);

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: ''+error+ 'Failed to apply for event' }, { status: 500 });
  }
}
