import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { volunteerId, eventId } = body;

    if (!volunteerId || !eventId) {
      return NextResponse.json({ error: 'No volunteerId or eventId provided' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.eventVolunteer.deleteMany({
        where: {
          AND: [
            { volunteerId: volunteerId },
            { eventId: eventId },
          ],
        },
      }),
      prisma.eventApplication.deleteMany({
        where: {
          AND: [
            { volunteerId: volunteerId },
            { eventId: eventId },
          ],
        },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing volunteer and application:', error);
    return NextResponse.json({ error: 'Failed to remove volunteer and application' }, { status: 500 });
  }
}
