import axios from 'axios';

export enum SupportedCoins {
  BONKUSDT = 'BONKUSDT',
}

export const getCryptoPrice = async (symbol: string, apiKey?: string) => {
  try {
    const currentDate = new Date().getTime();
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price`,
      {
        params: { symbol },
        ...(apiKey ? { headers: { 'X-MBX-APIKEY': apiKey } } : {}),
      }
    );
    return { price: Number(response.data.price), date: currentDate };
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
};

export type CryptoPrice = {
  price: number;
  date: number;
};
