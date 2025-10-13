import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the data but DON'T save to database
    if (!body.name || !body.timeLimit || !body.challenges || !body.htmlOutput) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Return success without saving
    return NextResponse.json(
      { 
        success: true,
        message: 'Test successful - data not saved',
        id: 'test-' + Date.now() 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}