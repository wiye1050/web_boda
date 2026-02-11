import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{lowerCase kebabCase member}}",
      skipDefaultConversion: true,
    },
  },
};

export default nextConfig;
