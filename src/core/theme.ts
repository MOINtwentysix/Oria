export const theme = {
  colors: {
    // Oria takes its visual cues from a city map after sunset: deep water, soft
    // street light, and one easy-to-spot location accent.
    ink: '#F4FAF8',
    muted: '#A6BDC7',
    paper: '#061B2B',
    surface: '#0D2A3B',
    surfaceRaised: '#14364A',
    line: '#285167',
    moss: '#68D5B9',
    mossSoft: '#123F49',
    signal: '#FFBD72',
    signalSoft: '#3D3024',
    night: '#041522',
    white: '#F7FCFA',
    danger: '#FF8C7A',
    mapWater: '#0A2335',
  },
  fonts: {
    regular: 'Archivo_400Regular',
    medium: 'Archivo_500Medium',
    semibold: 'Archivo_600SemiBold',
    bold: 'Archivo_700Bold',
    black: 'Archivo_800ExtraBold',
  },
  radius: { sm: 12, md: 18, lg: 28, pill: 999 },
  space: (n: number) => n * 4,
};
