export const TABLET_MIN_WIDTH = 700;
export const DESKTOP_MIN_WIDTH = 1024;

export interface ResponsiveLayout {
  isTablet: boolean;
  isDesktop: boolean;
  contentMaxWidth: number;
  formMaxWidth: number;
  gameContentMaxWidth: number;
  gameColumns: 1 | 2;
  screenPadding: number;
}

export function getResponsiveLayout(width: number): ResponsiveLayout {
  const safeWidth = Math.max(0, Math.round(width || 0));
  const isTablet = safeWidth >= TABLET_MIN_WIDTH;
  const isDesktop = safeWidth >= DESKTOP_MIN_WIDTH;

  return {
    isTablet,
    isDesktop,
    contentMaxWidth: isDesktop ? 980 : isTablet ? 720 : safeWidth,
    formMaxWidth: isTablet ? 640 : safeWidth,
    gameContentMaxWidth: isDesktop ? 1180 : isTablet ? 760 : safeWidth,
    gameColumns: isDesktop ? 2 : 1,
    screenPadding: isDesktop ? 32 : isTablet ? 24 : 16,
  };
}
