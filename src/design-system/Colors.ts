export const Colors = {
  light: {
    // Core semantic colors - Distinctive palette for Oria: Deep forest teal + warm sand + vibrant coral
    // Inspired by German forests (Black Forest, Bavarian woods) and the warmth of discovery
    ink: '#0D1B1E',           // Deep forest night - primary text
    inkMuted: '#4A656A',      // Muted forest green-gray
    inkSubtle: '#8B9FA3',     // Subtle water/mist tone
    
    paper: '#FEFBF6',         // Warm sand/cream - base background
    paperElevated: '#F5F0E8', // Slightly warmer elevated surface
    paperOverlay: 'rgba(254, 251, 246, 0.95)',
    
    accent: '#E85D3A',        // Vibrant coral - primary actions (discovery, warmth)
    accentSoft: '#FFF4F1',    // Subtle coral backgrounds
    accentHover: '#D14A2E',   // Pressed state - deeper coral
    accentGlow: '#FF7B5A',    // Glow/highlight state
    
    success: '#2D8C4A',       // Forest green - success
    successSoft: '#E8F5EB',
    warning: '#D4A83D',       // Warm amber - warning
    warningSoft: '#FEF9E7',
    error: '#C0392B',         // Deep red - error
    errorSoft: '#FDEDEC',
    
    border: '#E8E0D8',        // Warm sand border
    borderFocus: '#E85D3A',   // Coral focus
    
    // Glassmorphism - warm sand based
    glass: 'rgba(254, 251, 246, 0.92)',
    glassBorder: 'rgba(13, 27, 30, 0.05)',
    glassShadow: 'rgba(13, 27, 30, 0.06)',
    
    // Overlays
    overlay: 'rgba(13, 27, 30, 0.45)',
    overlayStrong: 'rgba(13, 27, 30, 0.7)',
    
    // Map pins - distinctive
    pinDefault: '#E85D3A',    // Coral for default pins
    pinSelected: '#D14A2E',   // Deeper coral for selected
    pinCluster: '#2D8C4A',    // Forest green for clusters
    
    // Legacy aliases for gradual migration
    primary: '#E85D3A',
    primaryLight: '#FFF4F1',
    primaryDark: '#D14A2E',
    secondary: '#2D8C4A',
    secondaryLight: '#E8F5EB',
    background: '#FEFBF6',
    backgroundSecondary: '#F5F0E8',
    backgroundTertiary: '#EDE5DB',
    surface: '#FEFBF6',
    surfaceElevated: '#F5F0E8',
    text: '#0D1B1E',
    textSecondary: '#4A656A',
    textTertiary: '#8B9FA3',
    textInverse: '#FEFBF6',
    textOnPrimary: '#FEFBF6',
  },
  dark: {
    // Dark mode: Deep forest night with coral accents
    ink: '#F5F0E8',           // Warm sand for text
    inkMuted: '#B8C5C8',      // Misty muted
    inkSubtle: '#8B9FA3',     // Subtle water tone
    
    paper: '#0D1B1E',         // Deep forest night
    paperElevated: '#14282E', // Slightly elevated
    paperOverlay: 'rgba(13, 27, 30, 0.95)',
    
    accent: '#FF7B5A',        // Brighter coral for dark mode
    accentSoft: '#3D1A15',    // Deep coral background
    accentHover: '#FF9578',   // Lighter hover
    accentGlow: '#FFB39A',    // Glow
    
    success: '#5ED97A',       // Bright forest green
    successSoft: '#0A2E12',
    warning: '#F5D05E',       // Warm amber
    warningSoft: '#2E2508',
    error: '#F87171',         // Red
    errorSoft: '#2E0A0A',
    
    border: '#1E3A3F',        // Deep forest border
    borderFocus: '#FF7B5A',   // Coral focus
    
    glass: 'rgba(13, 27, 30, 0.9)',
    glassBorder: 'rgba(245, 240, 232, 0.06)',
    glassShadow: 'rgba(0, 0, 0, 0.3)',
    
    overlay: 'rgba(0, 0, 0, 0.55)',
    overlayStrong: 'rgba(0, 0, 0, 0.8)',
    
    pinDefault: '#FF7B5A',
    pinSelected: '#FF9578',
    pinCluster: '#5ED97A',
    
    // Legacy aliases
    primary: '#FF7B5A',
    primaryLight: '#3D1A15',
    primaryDark: '#E85D3A',
    secondary: '#5ED97A',
    secondaryLight: '#0A2E12',
    background: '#0D1B1E',
    backgroundSecondary: '#14282E',
    backgroundTertiary: '#1E3A3F',
    surface: '#14282E',
    surfaceElevated: '#1E3A3F',
    text: '#F5F0E8',
    textSecondary: '#B8C5C8',
    textTertiary: '#8B9FA3',
    textInverse: '#0D1B1E',
    textOnPrimary: '#0D1B1E',
  },
};
