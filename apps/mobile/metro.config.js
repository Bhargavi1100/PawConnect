const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Monorepo setup: let Metro watch and resolve the workspace root so
// @pawconnect/shared (TypeScript source) bundles correctly.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
