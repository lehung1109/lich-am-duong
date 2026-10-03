import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lịch Âm Dương Việt Nam",
    short_name: "Lịch Âm Dương",
    description: "Tra cứu lịch âm dương, lịch vạn niên và quản lý sự kiện gia đình",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#991b1b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
