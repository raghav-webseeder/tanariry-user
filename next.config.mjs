/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.tanaririllp.com',
        pathname: '/uploads/**',        
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // async rewrites() {
  //   return [
  //     // Customer orders route (specific first)
  //     {
  //       source: '/api/customer-orders/:path*',
  //       destination: 'https://api.tanaririllp.com/api/customer-orders/:path*',
  //     },
  //     // All other API routes
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://api.tanaririllp.com/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;