/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://java-application-production-b3af.up.railway.app*',
      },
    ];
  },
};


module.exports = nextConfig
