// Type definitions for victory-vendor d3-shape and d3-scale
// This is a workaround for missing exports in victory-vendor

declare module 'victory-vendor/d3-shape' {
  import * as d3Shape from 'd3-shape';
  
  // Re-export all d3-shape exports
  export * from 'd3-shape';
  
  // Explicitly export all required functions
  export const area: typeof d3Shape.area;
  export const stack: typeof d3Shape.stack;
  export const curveBasisOpen: d3Shape.CurveFactory;
  export const curveBumpX: d3Shape.CurveFactory;
  export const curveLinear: d3Shape.CurveFactory;
  export const curveLinearClosed: d3Shape.CurveFactory;
  export const curveMonotoneX: d3Shape.CurveFactory;
  export const curveNatural: d3Shape.CurveFactory;
  export const curveStepAfter: d3Shape.CurveFactory;
  export const stackOffsetExpand: any;
  export const stackOffsetSilhouette: any;
  export const stackOrderNone: any;
  export const stackOrderAscending: any;
  export const stackOrderDescending: any;
  export const stackOrderInsideOut: any;
  export const stackOrderReverse: any;
  export const stackOffsetNone: any;
  export const stackOffsetWiggle: any;
  export const symbol: typeof d3Shape.symbol;
  export const symbolCircle: d3Shape.SymbolType;
  export const symbolDiamond: d3Shape.SymbolType;
  export const symbolStar: d3Shape.SymbolType;
  export const symbolWye: d3Shape.SymbolType;
}

declare module 'victory-vendor/d3-scale' {
  import * as d3Scale from 'd3-scale';
  
  // Re-export all d3-scale exports
  export * from 'd3-scale';
  
  // Explicitly export required scale functions
  export const scaleLinear: typeof d3Scale.scaleLinear;
  export const scaleBand: typeof d3Scale.scaleBand;
  export const scalePoint: typeof d3Scale.scalePoint;
}

// Ensure TypeScript treats this as a module
export {};
