import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "../../");

const withNextIntl = createNextIntlPlugin();

const secureHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  { key: "X-Frame-Options", value: "deny" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  output: process.env.NEXT_OUTPUT_MODE || undefined,
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  reactStrictMode: true,
  experimental: {
    // Add React 19 compatibility optimizations
    optimizePackageImports: ["@radix-ui/react-tooltip", "@heroicons/react"],
    serverActions: {
      ...(process.env.SERVER_ACTION_ALLOWED_ORIGINS
        ? { allowedOrigins: process.env.SERVER_ACTION_ALLOWED_ORIGINS.split(",").map((o) => o.trim()) }
        : {}),
    },
  },
  // Packages that must not be bundled by webpack and should remain as external
  // requires at runtime. These packages use native modules or have bundling
  // incompatibilities. Keep this list in sync with package.json dependencies
  // when adding new OpenTelemetry or logging packages.
  serverExternalPackages: [
    "winston",
    "@opentelemetry/api",
    "@opentelemetry/api-logs",
    "@opentelemetry/sdk-node",
    "@opentelemetry/sdk-metrics",
    "@opentelemetry/sdk-logs",
    "@opentelemetry/exporter-metrics-otlp-http",
    "@opentelemetry/exporter-logs-otlp-http",
    "@opentelemetry/exporter-prometheus",
    "@opentelemetry/resources",
    "@opentelemetry/semantic-conventions",
    "@opentelemetry/auto-instrumentations-node",
    "@opentelemetry/winston-transport",
    "@opentelemetry/resource-detector-container",
    "@opentelemetry/resource-detector-gcp",
  ],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: secureHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
