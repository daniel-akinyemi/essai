// Type definitions for d3-shape and victory-vendor compatibility
declare module 'victory-vendor/d3-shape' {
  export * from 'd3-shape';
}

declare module 'victory-vendor/lib/vendor/d3-shape' {
  export * from 'd3-shape';
}

declare module 'd3-shape' {
  import * as d3Shape from 'd3-shape';
  export = d3Shape;
  export as namespace d3Shape;
}
