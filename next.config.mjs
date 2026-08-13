/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the app to build & run even when Supabase env vars are absent (demo mode).
  env: {
    NEXT_PUBLIC_APP_NAME: "Us",
  },
};

export default nextConfig;
