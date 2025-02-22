import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serialNumber');

    if (!serialNumber) {
        return NextResponse.json({ error: 'Serial number is required' }, { status: 400 });
    }

    try {
        const tag = await prisma.nFCTag.findUnique({
            where: { serialNumber }
        });

        if (!tag) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ text: tag.text }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tag text:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
