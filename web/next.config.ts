export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  allowedDevOrigins: ["192.168.1.36"],

  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "planb.studiovimana.com.ar",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "planb.studiovimana.com.ar",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "planb.test",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.36",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.studiovimana.com.ar",
        pathname: "/**",
      },
    ],
  },
};