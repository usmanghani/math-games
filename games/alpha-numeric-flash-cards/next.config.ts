import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "..", "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  reactStrictMode: true,
};

export default nextConfig;
