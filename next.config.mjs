// @ts-check
process.env.NEXT_DISABLE_STRICT_PNPM_CHECK = 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: process.env.NODE_ENV !== 'development',

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    // Don't expose secrets unless needed on client side
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer, dev }) => {
    // Add support for importing TypeScript files
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.symlinks = false;
    config.resolve.preferRelative = true;

    // Add fallbacks for Node.js built-ins
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };

    // Add aliases for d3-shape and related modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'hoist-non-react-statics': 'hoist-non-react-statics',
      // Explicitly map d3-* modules to their direct dependencies
      'd3-shape': 'd3-shape',
      'd3-scale': 'd3-scale',
      'd3-array': 'd3-array',
      'd3-format': 'd3-format',
      'd3-interpolate': 'd3-interpolate',
      'd3-time-format': 'd3-time-format',
      'd3-time': 'd3-time',
      'd3-color': 'd3-color',
      'd3-path': 'd3-path',
      'd3-ease': 'd3-ease',
      // Victory vendor aliases
      'victory-vendor/lib/vendor/d3-shape': 'd3-shape',
      'victory-vendor/lib/vendor/d3-scale': 'd3-scale',
    };

    // Fix for hoist-non-react-statics
    config.module.rules.push({
      test: /hoist-non-react-statics/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Only optimize chunks in production
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          // Create a separate chunk for d3 and victory
          d3: {
            test: /[\\/]node_modules[\\/](d3-|victory-)/,
            name: 'd3-vendor',
            chunks: 'all',
            priority: 20,
          },
          sentry: {
            test: /[\\/]node_modules[\\/](@sentry)/,
            name: 'sentry',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    return config;
  },

  productionBrowserSourceMaps: true,
};

export default nextConfig;
