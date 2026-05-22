import type { ThemeConfig } from './types';

export const clinicalArchive: ThemeConfig = {
  id: 'clinical',
  name: 'Clinical Archive',
  nameCn: '众生行记',
  colors: {
    bgPrimary: '#F2F0E8',
    bgSecondary: '#E4E8E9',
    textPrimary: '#2E3135',
    textSecondary: '#70757A',
    accent: '#002FA7',
    highlight: '#F2C94C',
    border: '#D0D4D7',
  },
  noiseOpacity: 0.035,
  noiseType: 'paper',
  animSpeed: 'slow',
  description: '档案 · 记录 · 温和',
};

export const deconstructionComplex: ThemeConfig = {
  id: 'deconstruction',
  name: 'Deconstruction Complex',
  nameCn: '离解复合',
  colors: {
    bgPrimary: '#0C0C0C',
    bgSecondary: '#151515',
    textPrimary: '#F2F2F2',
    textSecondary: '#8B8B8B',
    accent: '#4CAF50',
    highlight: '#F2C94C',
    border: '#2A2A2A',
  },
  noiseOpacity: 0.06,
  noiseType: 'crt',
  animSpeed: 'fast',
  description: '实验事故 · 数据污染 · 冷工业',
};

export const themes: Record<string, ThemeConfig> = {
  clinical: clinicalArchive,
  deconstruction: deconstructionComplex,
};

export const themeList: ThemeConfig[] = [clinicalArchive, deconstructionComplex];
