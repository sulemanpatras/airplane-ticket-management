/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/:path*',
      },
    ];
  },
};


module.exports = nextConfig
