export type Voice = {
  id: string;
  title: string;
  description?: string;
};

export type SttResult = {
  text: string;
  duration?: number;
  segments?: Array<{ text: string; start: number; end: number }>;
};
