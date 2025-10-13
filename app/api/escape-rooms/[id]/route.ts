import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const escapeRoom = await prisma.escapeRoom.findUnique({
      where: { id },
    });

    if (!escapeRoom) {
      return NextResponse.json(
        { error: 'Escape room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(escapeRoom, { status: 200 });
  } catch (error) {
    console.error('Error fetching escape room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escape room' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, timeLimit, challenges, htmlOutput } = body;

    const escapeRoom = await prisma.escapeRoom.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(timeLimit && { timeLimit }),
        ...(challenges && { challenges: JSON.stringify(challenges) }),
        ...(htmlOutput && { htmlOutput }),
      },
    });

    return NextResponse.json(escapeRoom, { status: 200 });
  } catch (error) {
    console.error('Error updating escape room:', error);
    return NextResponse.json(
      { error: 'Failed to update escape room' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.escapeRoom.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Escape room deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting escape room:', error);
    return NextResponse.json(
      { error: 'Failed to delete escape room' },
      { status: 500 }
    );
  }
}