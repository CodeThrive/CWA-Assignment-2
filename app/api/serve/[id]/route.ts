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
      return new NextResponse(
        '<html><body><h1>Escape Room Not Found</h1></body></html>',
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    return new NextResponse(escapeRoom.htmlOutput, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error serving escape room:', error);
    return new NextResponse(
      '<html><body><h1>Internal Server Error</h1></body></html>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}