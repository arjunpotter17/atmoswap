export const getAsset = async (mintAddress: string) => {
    const response = await fetch('/api/fetchMetadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputMint: mintAddress }), // Pass the mint address in the body
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch asset data');
    }
  
    const data = await response.json();
    if(data.error) {
        throw new Error(data.error);
     
    }
    return data.result;
  };
  