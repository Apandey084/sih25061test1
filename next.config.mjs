// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */

// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images served from your Cloudinary account(s)
    // This pattern matches URLs like:
    //   https://res.cloudinary.com/<cloud_name>/image/upload/...
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // allow any path under res.cloudinary.com
      },
    ],
    // optional: uncomment to enable AVIF/WEBP automatic formats
    // formats: ['image/avif', 'image/webp'],
  },

  // (Optional) other Next.js config you might already use:
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;
