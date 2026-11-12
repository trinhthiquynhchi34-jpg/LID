export type FilmStock = 'kodak-portra' | 'ilford-hp5' | 'fuji-velvia' | 'vintage-1920' | 'normal';

export type DisplayMode = 'strip-horizontal' | 'strip-vertical' | 'projector' | 'light-table';

export interface FilmPhoto {
  id: string;
  url: string;
  title: string;
  location?: string;
  year?: string;
  filmStockName: string;
  iso?: string;
  camera?: string;
  lens?: string;
  frameNumber: string;
  caption?: string;
  aspect?: '16:9' | '3:2' | '4:3' | '1:1';
  objectPosition?: 'center' | 'top' | 'bottom';
  objectFit?: 'cover' | 'contain';
  panX?: number; // Percentage offset, e.g. -50 to 50
  panY?: number; // Percentage offset, e.g. -50 to 50
  zoom?: number; // Zoom multiplier, e.g. 1.0 to 3.0
  filmStockFilter?: FilmStock | 'match-roll';
}

export interface FilmRoll {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  stockType: FilmStock;
  stockLabel: string;
  photos: FilmPhoto[];
  coverUrl: string;
  totalCapacity?: number;
  soundtrackId?: string;
  customAudioUrl?: string;
  frameWidth?: number; // e.g. 320 to 600
  defaultAspect?: '16:9' | '3:2' | '4:3' | '1:1';
}
