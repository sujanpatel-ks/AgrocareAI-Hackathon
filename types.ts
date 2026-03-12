
export interface DiagnosticResult {
  diseaseName: string;
  confidence: number;
  description: string;
  recommendations: string[];
  urgency: 'Low' | 'Medium' | 'High';
  severity: 'Mild' | 'Moderate' | 'Severe';
  isOffline?: boolean;
  visualEvidence?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  pests?: {
    name: string;
    description: string;
  }[];
}

export interface WeatherData {
  temp: number;
  humidity: number;
  soilMoisture: number;
  condition: string;
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipProbability: number;
}

export interface WeatherForecast {
  current: WeatherData;
  days: ForecastDay[];
}

export interface StoreLocation {
  title: string;
  uri: string;
  address?: string;
  distance?: number;
  isVerified?: boolean;
  isEstimated?: boolean;
  inventory?: string[];
  categories?: string[];
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  phone?: string;
  reviewSnippet?: string;
}

export interface CropAlert {
  id: string;
  type: 'Pest' | 'Weather' | 'Nutrient';
  message: string;
  date: string;
}
