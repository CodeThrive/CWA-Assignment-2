import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve all escape rooms
export async function GET() {
  try {
    const escapeRooms = await prisma.escapeRoom.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(escapeRooms, { status: 200 });
  } catch (error) {
    console.error('Error fetching escape rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escape rooms' },
      { status: 500 }
    );
  }
}

// POST - Create a new escape room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, timeLimit, challenges, htmlOutput } = body;

    // Validation
    if (!name || !timeLimit || !challenges || !htmlOutput) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const escapeRoom = await prisma.escapeRoom.create({
      data: {
        name,
        timeLimit,
        challenges: JSON.stringify(challenges),
        htmlOutput,
      },
    });

    return NextResponse.json(escapeRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating escape room:', error);
    return NextResponse.json(
      { error: 'Failed to create escape room' },
      { status: 500 }
    );
  }
}