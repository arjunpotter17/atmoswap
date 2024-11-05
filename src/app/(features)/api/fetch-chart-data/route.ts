import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Parse the request body as JSON
  const API_KEY = process.env.COINGECKO_API_KEY;
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const days = searchParams.get("date");

  if (!id || !days) {
    return NextResponse.json(
      { error: "Missing required query parameters: id or days" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-cg-demo-api-key": `${API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to fetch data from CoinGecko: ${response.statusText}` },
      { status: response.status }
    );
  }

  const data = await response.json();

  if (!data || Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No data found for the provided parameters" },
      { status: 404 }
    );
  }
  return NextResponse.json(data);
}
