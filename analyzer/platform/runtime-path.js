'use strict';
const path = require('path');

function platformKey(platform = process.platform, arch = process.arch) {
  return `${platform}-${arch}`;
}

function resolveRuntime(rootDir, manifest, platform = process.platform, arch = process.arch) {
  const key = platformKey(platform, arch);
  const target = manifest.targets[key];
  if (!target) {
    throw new Error(`Nicht unterstützte Plattform: ${key}`);
  }
  return {
    key,
    target,
    executable: path.resolve(rootDir, target.executableRelativePath)
  };
}

module.exports = { platformKey, resolveRuntime };
