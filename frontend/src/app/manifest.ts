import type {MetadataRoute} from "next";
import {SITE_CONFIG} from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} | ${SITE_CONFIG.slogan}`,
    short_name: SITE_CONFIG.name,
    description: `${SITE_CONFIG.name}提供中美跨境供应链与物流信息服务。`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
