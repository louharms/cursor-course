import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Example API route template
    const searchParams = request.nextUrl.searchParams;
    const param = searchParams.get("param");

    // Your logic here
    const data = {
      message: "Test connection API endpoint",
      timestamp: new Date().toISOString(),
      param: param || null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
