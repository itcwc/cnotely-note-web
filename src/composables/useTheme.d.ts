export function useTheme(): {
  theme: import('vue').Ref<string>;
  THEMES: string[];
  applyTheme: (name: string) => void;
  cycleTheme: () => void;
};
