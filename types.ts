export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  MAPS = 'MAPS',
  HISTORY = 'HISTORY'
}

export interface MedicineDetails {
  name: string;
  genericName?: string;
  purpose: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  manufacturer?: string;
  expiryDate?: string;
  confidenceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface MapPlace {
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}
