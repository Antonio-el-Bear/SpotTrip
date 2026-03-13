// Active Next.js runtime config. These rewrites proxy the frontend to the Django backend
// for API, websocket, media, and static requests during local development.
/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/ws/:path*",
          destination: "http://127.0.0.1:8000/ws/:path*",
        },
        {
          source: "/media/:path*",
          destination: "http://127.0.0.1:8000/media/:path*",
        },
        {
          source: "/static/:path*",
          destination: "http://127.0.0.1:8000/static/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;