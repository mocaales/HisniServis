import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    // Vsi testi uporabljajo isto bazo v pomnilniku, zato tečejo zaporedno.
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      include: ["app.js", "routes/**", "middleware/**", "models/**"],
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage"
    }
  }
});
