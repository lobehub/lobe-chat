const fs = require('node:fs');

// Function to merge package.json files
function mergePackageJson(originalPath, upstreamPath, outputPath) {
  try {
    // Read the original and upstream package.json files
    const original = JSON.parse(fs.readFileSync(originalPath, 'utf8'));
    const upstream = JSON.parse(fs.readFileSync(upstreamPath, 'utf8'));

    // Create a merged version
    const merged = { ...upstream };

    // Preserve custom dependencies from original
    if (original.dependencies) {
      merged.dependencies = { ...upstream.dependencies };

      // For each dependency in the original package.json
      Object.keys(original.dependencies).forEach(pkg => {
        // If the package exists in both, keep the original version if it's different
        if (merged.dependencies[pkg] && original.dependencies[pkg] !== merged.dependencies[pkg]) {
          console.log(`Preserving custom version for ${pkg}: ${original.dependencies[pkg]} (upstream: ${merged.dependencies[pkg]})`);
          merged.dependencies[pkg] = original.dependencies[pkg];
        }
        // If the package only exists in original, add it to merged
        else if (!merged.dependencies[pkg]) {
          console.log(`Adding custom package ${pkg}: ${original.dependencies[pkg]}`);
          merged.dependencies[pkg] = original.dependencies[pkg];
        }
      });
    }

    // Do the same for devDependencies
    if (original.devDependencies) {
      merged.devDependencies = { ...upstream.devDependencies };

      Object.keys(original.devDependencies).forEach(pkg => {
        if (merged.devDependencies[pkg] && original.devDependencies[pkg] !== merged.devDependencies[pkg]) {
          console.log(`Preserving custom version for ${pkg}: ${original.devDependencies[pkg]} (upstream: ${merged.devDependencies[pkg]})`);
          merged.devDependencies[pkg] = original.devDependencies[pkg];
        }
        else if (!merged.devDependencies[pkg]) {
          console.log(`Adding custom package ${pkg}: ${original.devDependencies[pkg]}`);
          merged.devDependencies[pkg] = original.devDependencies[pkg];
        }
      });
    }

    // Preserve any custom pnpm settings
    if (original.pnpm) {
      merged.pnpm = { ...upstream.pnpm, ...original.pnpm };

      // Merge overrides
      if (original.pnpm.overrides && upstream.pnpm.overrides) {
        merged.pnpm.overrides = { ...upstream.pnpm.overrides, ...original.pnpm.overrides };
      }

      // Merge onlyBuiltDependencies
      if (original.pnpm.onlyBuiltDependencies && upstream.pnpm.onlyBuiltDependencies) {
        const combinedDeps = new Set([
          ...upstream.pnpm.onlyBuiltDependencies,
          ...original.pnpm.onlyBuiltDependencies
        ]);
        merged.pnpm.onlyBuiltDependencies = Array.from(combinedDeps);
      }
    }

    // Preserve any custom overrides
    if (original.overrides) {
      merged.overrides = { ...upstream.overrides, ...original.overrides };
    }

    // Write the merged package.json
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    console.log('Successfully merged package.json files');
    return true;
  } catch (error) {
    console.error('Error merging package.json files:', error);
    return false;
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.error('Usage: node mergePackageJson.js <originalPath> <upstreamPath> <outputPath>');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const [originalPath, upstreamPath, outputPath] = args;
  const success = mergePackageJson(originalPath, upstreamPath, outputPath);

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(success ? 0 : 1);
}

module.exports = { mergePackageJson };
