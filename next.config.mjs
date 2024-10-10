/** @type {import('next').NextConfig} */

import checkVars from "./checkVars.mjs";

checkVars();

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["discord.js"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        {
          "utf-8-validate": "commonjs utf-8-validate",
          bufferutil: "commonjs bufferutil",
          "zlib-sync": "commonjs zlib-sync",
          erlpack: "commonjs erlpack",
        },
        "discord.js",
      );
    }
    return config;
  },
};

export default nextConfig;
