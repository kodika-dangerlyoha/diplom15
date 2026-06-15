/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'shared.fastly.steamstatic.com' }
    ]
  }
};

export default nextConfig;
