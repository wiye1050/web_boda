/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow external links like Imgur or other CDNs since users can input any link
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
