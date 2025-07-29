// Type definitions for recharts
// This is a workaround for Recharts type issues in Next.js and Vercel

declare module 'victory-vendor/d3-shape' {
  // Basic shapes
  export const area: any;
  export const line: any;
  
  // Curve types
  export const curveStep: any;
  export const curveStepBefore: any;
  export const curveStepAfter: any;
  export const curveBasis: any;
  export const curveBasisClosed: any;
  export const curveBasisOpen: any;
  export const curveBumpY: any;
  export const curveBumpX: any;
  export const curveBundle: any;
  export const curveCardinal: any;
  export const curveCardinalClosed: any;
  export const curveCardinalOpen: any;
  export const curveCatmullRom: any;
  export const curveCatmullRomClosed: any;
  export const curveCatmullRomOpen: any;
  export const curveLinear: any;
  export const curveLinearClosed: any;
  export const curveMonotoneX: any;
  export const curveMonotoneY: any;
  export const curveNatural: any;
  
  // Stack types
  export const stack: any;
  export const stackOffsetExpand: any;
  export const stackOffsetNone: any;
  export const stackOffsetSilhouette: any;
  export const stackOffsetWiggle: any;
  export const stackOrderNone: any;
  
  // Symbol types
  export const symbol: any;
  export const symbolCircle: any;
  export const symbolCross: any;
  export const symbolDiamond: any;
  export const symbolSquare: any;
  export const symbolStar: any;
  export const symbolTriangle: any;
  export const symbolWye: any;
  
  // Other shape utilities
  export const shapeArea: any;
  export const shapeLine: any;
  export const shapeStack: any;
  export const shapeSymbol: any;
  
  // Default export for d3-shape
  const d3Shape: any;
  export default d3Shape;
}

declare module 'victory-vendor/d3-scale' {
  // Scale types
  export const scaleBand: any;
  export const scaleLinear: any;
  export const scalePoint: any;
  export const scaleTime: any;
  export const scaleUtc: any;
  export const scaleLog: any;
  export const scalePow: any;
  export const scaleSqrt: any;
  export const scaleSymlog: any;
  export const scaleOrdinal: any;
  export const scaleQuantile: any;
  export const scaleQuantize: any;
  export const scaleThreshold: any;
  export const scaleSequential: any;
  export const scaleSequentialLog: any;
  export const scaleSequentialPow: any;
  export const scaleSequentialSqrt: any;
  export const scaleSequentialSymlog: any;
  export const scaleSequentialQuantile: any;
  
  // Scale methods
  export const scaleDiverging: any;
  export const scaleDivergingLog: any;
  export const scaleDivergingPow: any;
  export const scaleDivergingSqrt: any;
  export const scaleDivergingSymlog: any;
  
  // Other scale utilities
  export const d3Scales: any;
  export const scaleImplicit: any;
  export const schemeCategory10: any;
  export const schemeAccent: any;
  export const schemeDark2: any;
  export const schemePaired: any;
  export const schemePastel1: any;
  export const schemePastel2: any;
  export const schemeSet1: any;
  export const schemeSet2: any;
  export const schemeSet3: any;
  export const schemeTableau10: any;
  
  // Interpolators
  export const interpolateCubehelixDefault: any;
  export const interpolateRainbow: any;
  export const interpolateWarm: any;
  export const interpolateCool: any;
  export const interpolateViridis: any;
  export const interpolateInferno: any;
  export const interpolateMagma: any;
  export const interpolatePlasma: any;
  export const interpolateCividis: any;
  
  // Default export for d3-scale
  const d3Scale: any;
  export default d3Scale;
}

declare module 'recharts' {
  export * from 'recharts/types/index';
}

declare module 'recharts/types/component/DefaultLegendContent' {
  export * from 'recharts/types/component/DefaultLegendContent';
}

declare module 'recharts/types/component/Legend' {
  export * from 'recharts/types/component/Legend';
}

declare module 'recharts/types/component/ResponsiveContainer' {
  export * from 'recharts/types/component/ResponsiveContainer';
}

declare module 'recharts/types/cartesian/Bar' {
  export * from 'recharts/types/cartesian/Bar';
}

declare module 'recharts/types/cartesian/Line' {
  export * from 'recharts/types/cartesian/Line';
}

declare module 'recharts/types/cartesian/XAxis' {
  export * from 'recharts/types/cartesian/XAxis';
}

declare module 'recharts/types/cartesian/YAxis' {
  export * from 'recharts/types/cartesian/YAxis';
}

declare module 'recharts/types/cartesian/ZAxis' {
  export * from 'recharts/types/cartesian/ZAxis';
}

declare module 'recharts/types/component/Tooltip' {
  export * from 'recharts/types/component/Tooltip';
}

declare module 'recharts/types/cartesian/CartesianGrid' {
  export * from 'recharts/types/cartesian/CartesianGrid';
}

declare module 'recharts/types/component/Label' {
  export * from 'recharts/types/component/Label';
}

declare module 'recharts/types/component/LabelList' {
  export * from 'recharts/types/component/LabelList';
}

declare module 'recharts/types/component/ReferenceLine' {
  export * from 'recharts/types/component/ReferenceLine';
}

declare module 'recharts/types/component/ReferenceDot' {
  export * from 'recharts/types/component/ReferenceDot';
}

declare module 'recharts/types/component/ReferenceArea' {
  export * from 'recharts/types/component/ReferenceArea';
}

declare module 'recharts/types/component/ErrorBar' {
  export * from 'recharts/types/component/ErrorBar';
}

declare module 'recharts/types/component/Cell' {
  export * from 'recharts/types/component/Cell';
}

declare module 'recharts/types/chart/ComposedChart' {
  export * from 'recharts/types/chart/ComposedChart';
}

declare module 'recharts/types/chart/LineChart' {
  export * from 'recharts/types/chart/LineChart';
}

declare module 'recharts/types/chart/BarChart' {
  export * from 'recharts/types/chart/BarChart';
}

declare module 'recharts/types/chart/PieChart' {
  export * from 'recharts/types/chart/PieChart';
}

declare module 'recharts/types/chart/RadarChart' {
  export * from 'recharts/types/chart/RadarChart';
}

declare module 'recharts/types/chart/RadialBarChart' {
  export * from 'recharts/types/chart/RadialBarChart';
}

declare module 'recharts/types/chart/Sankey' {
  export * from 'recharts/types/chart/Sankey';
}

declare module 'recharts/types/chart/ScatterChart' {
  export * from 'recharts/types/chart/ScatterChart';
}

declare module 'recharts/types/chart/Treemap' {
  export * from 'recharts/types/chart/Treemap';
}

declare module 'recharts/types/chart/FunnelChart' {
  export * from 'recharts/types/chart/FunnelChart';
}

declare module 'recharts/types/chart/Radar' {
  export * from 'recharts/types/chart/Radar';
}

declare module 'recharts/types/chart/RadialBar' {
  export * from 'recharts/types/chart/RadialBar';
}

declare module 'recharts/types/chart/Sankey' {
  export * from 'recharts/types/chart/Sankey';
}

declare module 'recharts/types/chart/Scatter' {
  export * from 'recharts/types/chart/Scatter';
}

declare module 'recharts/types/chart/Treemap' {
  export * from 'recharts/types/chart/Treemap';
}

declare module 'recharts/types/chart/Funnel' {
  export * from 'recharts/types/chart/Funnel';
}

declare module 'recharts/types/chart/generateCategoricalChart' {
  export * from 'recharts/types/chart/generateCategoricalChart';
}

declare module 'recharts/types/component/Legend' {
  export * from 'recharts/types/component/Legend';
}

declare module 'recharts/types/component/ResponsiveContainer' {
  export * from 'recharts/types/component/ResponsiveContainer';
}

declare module 'recharts/types/component/Tooltip' {
  export * from 'recharts/types/component/Tooltip';
}

declare module 'recharts/types/component/DefaultLegendContent' {
  export * from 'recharts/types/component/DefaultLegendContent';
}

declare module 'recharts/types/component/Legend' {
  export * from 'recharts/types/component/Legend';
}

declare module 'recharts/types/component/ResponsiveContainer' {
  export * from 'recharts/types/component/ResponsiveContainer';
}

declare module 'recharts/types/component/Tooltip' {
  export * from 'recharts/types/component/Tooltip';
}

declare module 'recharts/types/component/DefaultTooltipContent' {
  export * from 'recharts/types/component/DefaultTooltipContent';
}

declare module 'recharts/types/component/Legend' {
  export * from 'recharts/types/component/Legend';
}

declare module 'recharts/types/component/ResponsiveContainer' {
  export * from 'recharts/types/component/ResponsiveContainer';
}

declare module 'recharts/types/component/Tooltip' {
  export * from 'recharts/types/component/Tooltip';
}

declare module 'recharts/types/component/DefaultTooltipContent' {
  export * from 'recharts/types/component/DefaultTooltipContent';
}

declare module 'recharts/types/component/DefaultLegendContent' {
  export * from 'recharts/types/component/DefaultLegendContent';
}

declare module 'recharts/types/component/Legend' {
  export * from 'recharts/types/component/Legend';
}

declare module 'recharts/types/component/ResponsiveContainer' {
  export * from 'recharts/types/component/ResponsiveContainer';
}

declare module 'recharts/types/component/Tooltip' {
  export * from 'recharts/types/component/Tooltip';
}

declare module 'recharts/types/component/DefaultTooltipContent' {
  export * from 'recharts/types/component/DefaultTooltipContent';
}

declare module 'recharts/types/component/DefaultLegendContent' {
  export * from 'recharts/types/component/DefaultLegendContent';
}
