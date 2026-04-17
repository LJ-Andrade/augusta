export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  // Allow access from the local network IP during development
  allowedDevOrigins: ["192.168.1.36"],

  images: {
    formats: ["image/avif", "image/webp"],
    // During local development, planb.test resolves to 127.0.0.1 (private IP).
    // Next.js Image Optimizer blocks private IPs for security, so we disable
    // optimization in dev. In production with a real domain, remove this line.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        // Local development via Laravel Herd/Valet
        protocol: "http",
        hostname: "planb.test",
        pathname: "/**",
      },
      {
        // Local development via IP (mobile, other devices on LAN)
        protocol: "http",
        hostname: "192.168.1.36",
        pathname: "/**",
      },
      {
        // Production placeholder — update hostname when deploying
        protocol: "https",
        hostname: "**.planb.com.ar",
        pathname: "/**",
      },
    ],
  },
};
