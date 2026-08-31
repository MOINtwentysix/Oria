export const Animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 700,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  springConfig: {
    gentle: { damping: 20, stiffness: 150 },
    default: { damping: 15, stiffness: 180 },
    snappy: { damping: 12, stiffness: 220 },
    stiff: { damping: 10, stiffness: 280 },
    bouncy: { damping: 8, stiffness: 200 },
  },
};

export const Transitions = {
  fade: {
    duration: Animation.duration.normal,
    easing: Animation.easing.easeOut,
  },
  slideUp: {
    duration: Animation.duration.slow,
    easing: Animation.easing.decelerate,
  },
  slideDown: {
    duration: Animation.duration.slow,
    easing: Animation.easing.accelerate,
  },
  scale: {
    duration: Animation.duration.fast,
    easing: Animation.easing.easeOut,
  },
  glassMorph: {
    duration: Animation.duration.slower,
    easing: Animation.easing.smooth,
  },
};