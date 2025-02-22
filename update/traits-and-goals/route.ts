import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  console.log('GET /api/auth/update/traits-and-goals - Request received');

  try {
    const traits = await prisma.trait.findMany();
    const goals = await prisma.goal.findMany();
    console.log('Traits and goals fetched successfully');
    return NextResponse.json({ traits, goals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching traits and goals:', error);
    return NextResponse.json({ message: 'Failed to fetch traits and goals' }, { status: 500 });
  }
}