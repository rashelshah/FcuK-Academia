import { useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/hooks/useUser';
import { getStableVariantIndex } from '@/lib/personalization';
import type { ThemeDictionary, ThemeCopy } from '@/lib/types';

type GetCopyFn = (
  section: keyof ThemeCopy,
  status?: string,
  defaultCopy?: string
) => string;

export function useThemeDictionary() {
  const { themeConfig } = useTheme();
  const { user } = useUser();

  const getTerm = useCallback(
    (key: keyof ThemeDictionary | string): string | undefined => {
      if (!themeConfig.dictionary) return undefined;
      return themeConfig.dictionary[key as keyof ThemeDictionary];
    },
    [themeConfig.dictionary]
  );

  const getCopy: GetCopyFn = useCallback(
    (section, status, defaultCopy = '') => {
      if (!themeConfig.copy) return defaultCopy;
      
      const sectionData = themeConfig.copy[section] as any;
      if (!sectionData) return defaultCopy;
      
      // Handle the case where the section is an array directly (e.g. holiday)
      if (Array.isArray(sectionData)) {
        if (sectionData.length === 0) return defaultCopy;
        if (sectionData.length === 1) return sectionData[0];
        const salt = `copy-${String(section)}-v1`;
        const index = getStableVariantIndex(user?.regNumber, salt, sectionData.length);
        return sectionData[index];
      }

      // Handle the case where the section contains statuses (e.g. attendance.safe)
      const strings = sectionData[status as keyof typeof sectionData] as string[] | string | undefined;
      if (!strings) return defaultCopy;
      
      if (Array.isArray(strings)) {
        if (strings.length === 0) return defaultCopy;
        if (strings.length === 1) return strings[0];
        
        const salt = `copy-${String(section)}-${String(status)}-v1`;
        const index = getStableVariantIndex(user?.regNumber, salt, strings.length);
        return strings[index];
      }
      
      return strings;
    },
    [themeConfig.copy, user?.regNumber]
  );

  return { getTerm, getCopy };
}
