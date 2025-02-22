// // pages/api/modify.ts

// import { NextApiRequest, NextApiResponse } from 'next';
// import prisma from '@/lib/prisma';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { method } = req;
//     const { type } = req.query;

//     if (method == 'GET') {
//         try {
//             if (type == 'content') {
//                 const content = await prisma.content.findFirst();
//                 if (content) {
//                     res.status(200).json({ headline: content.headline, article: content.article });
//                 } else {
//                     res.status(404).json({ error: 'Content not found' });
//                 }
//             } else if (type === 'faq') {
//                 const faqs = await prisma.fAQ.findMany();
//                 res.status(200).json(faqs);
//             } else {
//                 res.status(400).json({ error: 'Invalid type parameter' });
//             }
//         } catch (error) {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     } else if (method == 'POST') {
//         try {
//             if (type == 'content') {
//                 const { headline, article } = req.body;
//                 const content = await prisma.content.upsert({
//                     where: { id: 1 },
//                     update: { headline, article },
//                     create: { headline, article },
//                 });
//                 res.status(200).json(content);
//             } else if (type === 'faq') {
//                 const { question, answer } = req.body;
//                 const faq = await prisma.fAQ.create({
//                     data: { question, answer },
//                 });
//                 const faqs = await prisma.fAQ.findMany();
//                 res.status(200).json(faqs);
//             } else {
//                 res.status(400).json({ error: 'Invalid type parameter' });
//             }
//         } catch (error) {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     } else {
//         res.setHeader('Allow', ['GET', 'POST']);
//         res.status(405).end(`Method ${method} Not Allowed`);
//     }
// }
// app/api/modify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'content') {
        const content = await prisma.content.findFirst();
        return NextResponse.json(content);
    } else if (type === 'faq') {
        const faqs = await prisma.fAQ.findMany();
        return NextResponse.json(faqs);
    } else {
        return new NextResponse('Invalid type', { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (type === 'content') {
        const updatedContent = await prisma.content.update({
            where: { id: 1 },
            data: {
                headline: body.headline,
                article: body.article,
            },

        });
        return NextResponse.json(updatedContent, { status: 400 });
    } else if (type === 'faq') {
        const newFaq = await prisma.fAQ.create({
            data: {
                question: body.question,
                answer: body.answer,
            },
        });
        return NextResponse.json(newFaq, { status: 200 });
    } else {
        return new NextResponse('Invalid type', { status: 400 });
    }
}
