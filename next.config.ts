import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? "/PLAY-BASEBALL" : "",
  assetPrefix: isGithubPages ? "/PLAY-BASEBALL/" : "",
};

export default nextConfig;
