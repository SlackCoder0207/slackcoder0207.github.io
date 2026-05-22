export type ThemeId = 'clinical' | 'deconstruction';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  highlight: string;
  border: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameCn: string;
  colors: ThemeColors;
  noiseOpacity: number;
  /** 'paper' | 'crt' */
  noiseType: 'paper' | 'crt';
  animSpeed: 'slow' | 'fast';
  description: string;
}
