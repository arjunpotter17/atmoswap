// app/api/fetchTokenData/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const heliusApiKey = process.env.HELIUS_RPC_KEY; // Get the API key from environment variables
  
  // Parse the request body
  const { inputMint } = await req.json(); // Extract inputMint from the body
  
  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: inputMint,
          displayOptions: {
            showFungible: true // return details about a fungible token
          }
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return NextResponse.json(data); // Return the JSON response
  } catch (error: unknown) {
    console.log('Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
