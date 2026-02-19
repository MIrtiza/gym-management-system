import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Member } from '@/types';

// Mock data - replace with database calls
const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-0001',
    isActive: true,
    joinDate: '2024-01-15',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '555-0002',
    isActive: true,
    joinDate: '2024-02-10',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
  },
];

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Member[]>>> {
  try {
    // TODO: Replace with database query
    return NextResponse.json({
      success: true,
      data: mockMembers,
      message: 'Members retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve members',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Member>>> {
  try {
    const body = await request.json();
    
    // TODO: Add validation
    // TODO: Save to database
    
    const newMember: Member = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newMember,
        message: 'Member created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create member',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
