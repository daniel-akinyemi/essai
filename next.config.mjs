// @ts-check
const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV !== 'development',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
    },
  },
  serverExternalPackages: ['@prisma/client'],
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
};

// Disable custom Webpack config on Vercel
if (!isVercel) {
  nextConfig.webpack = (config, { isServer, dev }) => {
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.symlinks = false;
    config.resolve.preferRelative = true;

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      'hoist-non-react-statics': 'hoist-non-react-statics',
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
      'victory-vendor/lib/vendor/d3-shape': 'd3-shape',
      'victory-vendor/lib/vendor/d3-scale': 'd3-scale',
    };

    config.module.rules.push({
      test: /hoist-non-react-statics/,
      resolve: {
        fullySpecified: false,
      },
    });

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
  };
}

export default nextConfig;
