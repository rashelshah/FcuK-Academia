import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  try {
    const { code } = await context.params;

    const room = await prisma.gossipRoom.findUnique({
      where: { roomCode: code },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const messages = await prisma.gossipMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      room: {
        name: room.name,
        roomCode: room.roomCode,
        password: room.password,
      },
      messages
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const { code } = await context.params;
    const { content, userHash } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const room = await prisma.gossipRoom.findUnique({
      where: { roomCode: code },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const generatedHash = userHash || crypto.randomBytes(4).toString('hex');

    const message = await prisma.gossipMessage.create({
      data: {
        content: content.trim(),
        userHash: generatedHash,
        roomId: room.id,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
