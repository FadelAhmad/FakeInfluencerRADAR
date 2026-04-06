import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_URL ||
  "https://overexpressive-nonburdensomely-elfrieda.ngrok-free.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  let pathString = path?.join("/") || "";
  
  // Map "status" to root endpoint
  if (pathString === "status") {
    pathString = "";
  }
  
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathString}${searchParams ? `?${searchParams}` : ""}`;

  console.log("[v0] Proxy GET:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    
    // Check if response is JSON
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[v0] Proxy: Non-JSON response from backend:", response.status, text.substring(0, 200));
      return NextResponse.json(
        { error: `Backend returned non-JSON response (${response.status})`, details: text.substring(0, 200) },
        { status: response.status >= 400 ? response.status : 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[v0] Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from backend", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}
