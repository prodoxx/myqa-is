export type MetaplexMetadataV2 = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }> | null;
  collection?: {
    verified: boolean;
    key: string;
  } | null;
  uses?: {
    useMethod: 'burn' | 'multiple' | 'single';
    remaining: number;
    total: number;
  } | null;
};

export type UploadRequest = {
  question: string;
  answer: string;
  unlockPrice: number;
  maxKeys: number;
};
