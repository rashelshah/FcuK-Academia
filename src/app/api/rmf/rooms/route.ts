import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { syncUserToDb } from '@/lib/server/user-sync';

export async function POST(request: Request) {
  try {
    void syncUserToDb();
    const body = await request.json();
    const { action, roomCode, password, roomName } = body;

    if (action === 'CREATE') {
      if (!roomName || !roomName.trim()) {
        return NextResponse.json({ error: 'Room name is required.' }, { status: 400 });
      }

      // Generate unique 4 digit code
      let generatedCode = '';
      let existing = true;
      while (existing) {
        generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        const check = await prisma.gossipRoom.findUnique({ where: { roomCode: generatedCode } });
        if (!check) existing = false;
      }

      // Generate random 4 character password (numeric for simplicity to match dialpad UX)
      const generatedPassword = Math.floor(1000 + Math.random() * 9000).toString();
      const creatorHash = crypto.randomBytes(16).toString('hex');

      const room = await prisma.gossipRoom.create({
        data: {
          name: roomName.trim(),
          roomCode: generatedCode,
          password: generatedPassword,
          creatorHash,
        },
      });

      return NextResponse.json({ success: true, roomCode: room.roomCode, password: room.password, name: room.name });
    } 
    
    if (action === 'JOIN') {
      if (!roomCode || !password || roomCode.length !== 4 || password.length !== 4) {
        return NextResponse.json({ error: 'Code and Password must be exactly 4 digits.' }, { status: 400 });
      }

      const room = await prisma.gossipRoom.findUnique({ where: { roomCode } });
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
      }

      if (room.password !== password) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }

      return NextResponse.json({ success: true, roomCode: room.roomCode });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });

  } catch (error: any) {
    console.error('Failed to access room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
