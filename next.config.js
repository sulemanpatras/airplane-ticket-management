/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '*',
      },
    ];
  },
};


module.exports = nextConfig
