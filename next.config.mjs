// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode in production only
  reactStrictMode: process.env.NODE_ENV !== 'development',
  
  // Environment variables configuration
  env: {
    // Make sure these environment variables are available at build time
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    // Add other environment variables that should be available at build time
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    // Enable TypeScript type checking during build
    ignoreBuildErrors: false,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Add support for importing TypeScript files
    config.resolve.extensions.push('.ts', '.tsx');
    
    // Configure resolve to handle Windows paths better
    config.resolve.symlinks = false; // Disable symlink resolution to avoid permission issues on Windows
    config.resolve.preferRelative = true; // Ensure proper path resolution on Windows
    
    // Fix for hoist-non-react-statics import issue with Sentry
    config.resolve.alias = {
      ...config.resolve.alias,
      'hoist-non-react-statics': 'hoist-non-react-statics'
    };
    
    // Add a rule to handle the hoist-non-react-statics import correctly
    config.module.rules.push({
      test: /hoist-non-react-statics/,
      resolve: {
        fullySpecified: false
      }
    });
    
    // Only optimize chunks in production
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        minSize: 20000, // Minimum chunk size of 20KB
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/](?!@sentry)/,
            chunks: 'all',
            priority: 10,
            enforce: true,
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
  
  // Enable production browser source maps
  productionBrowserSourceMaps: true,
  
  // Disable standalone output to avoid symlink issues on Windows
  // output: 'standalone',
  
  // External packages that should be bundled with the server
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Experimental features (minimal and stable only)
  experimental: {
    // Enable server actions
    serverActions: {
      // Configure allowed origins for Server Actions
      allowedOrigins: [], // Add your production domains here
    },
  },
};

export default nextConfig;