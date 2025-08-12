declare module "@next/bundle-analyzer" {
  import type { NextConfig } from "next";
  type AnalyzerOptions = {
    enabled?: boolean | string;
    openAnalyzer?: boolean | string;
    analyzerMode?: "server" | "static" | "disabled";
    reportFilename?: string;
  };
  const create: (opts?: AnalyzerOptions) => (config: NextConfig) => NextConfig;
  export default create;
}
