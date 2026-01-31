import { NextRequest, NextResponse } from 'next/server';

const PROOFRAILS_API_URL = process.env.NEXT_PUBLIC_PROOFRAILS_API_URL || 
  "https://middleware-iso20022-v13-production-5084.up.railway.app";

const PROOFRAILS_API_KEY = process.env.NEXT_PUBLIC_PROOFRAILS_API_KEY;

/**
 * POST /api/proofrails/record
 * Proxy for ProofRails record-tip endpoint
 * Avoids CORS issues by making server-side request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("🔄 Proxying ProofRails request:", body);

    if (!PROOFRAILS_API_KEY) {
      return NextResponse.json(
        { error: "ProofRails API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${PROOFRAILS_API_URL}/v1/iso/record-tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PROOFRAILS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ProofRails API error:", response.status, errorText);
      
      return NextResponse.json(
        { error: `ProofRails API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log("✅ ProofRails receipt created:", data.receipt_id);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Proxy error:", error);
    
    return NextResponse.json(
      { error: "Failed to proxy ProofRails request", message: error.message },
      { status: 500 }
    );
  }
}