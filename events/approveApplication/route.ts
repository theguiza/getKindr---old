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
      data: { status: 'APPROVED' },
      include: {
        volunteer: {
          include: {
            user: true,
          },
        },
      },
    });

    const eventVolunteer = await prisma.eventVolunteer.create({
      data: {
        eventId: application.eventId,
        volunteerId: application.volunteerId,
      },
      include: {
        volunteer: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(eventVolunteer, { status: 200 });
  } catch (error) {
    console.error('Error approving application:', error);
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 });
  }
}
