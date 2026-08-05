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

  // A breakpoint's ceiling can exceed the window that triggered it — a 1024px
  // window is "desktop" but cannot host the 1180px game ceiling. Callers treat
  // these as real widths (GameScreen sizes its header from one), so an
  // unclamped ceiling renders wider than the screen and gets clipped on both
  // sides. Never promise more room than the window actually has.
  const fits = (ceiling: number) => Math.min(safeWidth, ceiling);

  return {
    isTablet,
    isDesktop,
    contentMaxWidth: isDesktop ? fits(980) : isTablet ? fits(720) : safeWidth,
    formMaxWidth: isTablet ? fits(640) : safeWidth,
    gameContentMaxWidth: isDesktop ? fits(1180) : isTablet ? fits(760) : safeWidth,
    gameColumns: isDesktop ? 2 : 1,
    screenPadding: isDesktop ? 32 : isTablet ? 24 : 16,
  };
}
