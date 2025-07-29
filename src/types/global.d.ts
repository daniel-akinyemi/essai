// Type declarations for d3 and lodash compatibility
declare module 'd3-scale';
declare module 'd3-shape';
declare module 'lodash';

// Victory vendor type declarations
declare module 'victory-vendor/d3-shape' {
  const d3Shape: any;
  export default d3Shape;
}

declare module 'victory-vendor/lib/vendor/d3-shape' {
  const d3Shape: any;
  export default d3Shape;
}
