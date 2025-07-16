const fs = require('node:fs');
const path = require('node:path');
const { mergePackageJson } = require('./mergePackageJson');

// Create test directory
const testDir = path.join(__dirname, 'test-merge');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create original package.json with custom dependencies
const originalPackageJson = {
  dependencies: {
    "custom-package": "^1.0.0",
    "next": "^13.0.0",
    "react": "^18.0.0"    // Package only in original
  },
  devDependencies: {
    // Custom version
    "custom-dev-package": "^2.0.0",
    "typescript": "^4.9.0" // Package only in original
  },
  name: "test-package",
  pnpm: {
    overrides: {
      "custom-override": "1.0.0"  // Custom override
    }
  },
  version: "1.0.0"
};

// Create upstream package.json with updated dependencies
const upstreamPackageJson = {
  dependencies: {
    "new-package": "^1.0.0",
    "next": "^13.0.0",
    "react": "^19.0.0"            // Same version
  },
  devDependencies: {
    "eslint": "^8.0.0",            // Package only in upstream
    "typescript": "^5.0.0"       // Updated version
  },
  name: "test-package",
  pnpm: {
    overrides: {
      "upstream-override": "1.0.0" // Upstream override
    }
  },
  version: "1.1.0"
};

// Write test files
const originalPath = path.join(testDir, 'original.json');
const upstreamPath = path.join(testDir, 'upstream.json');
const outputPath = path.join(testDir, 'merged.json');

fs.writeFileSync(originalPath, JSON.stringify(originalPackageJson, null, 2));
fs.writeFileSync(upstreamPath, JSON.stringify(upstreamPackageJson, null, 2));

// Run merge
console.log('Running package.json merge test...');
const success = mergePackageJson(originalPath, upstreamPath, outputPath);

if (success) {
  // Read merged file
  const merged = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

  // Verify results
  let testsPassed = true;

  // Check version (should be from upstream)
  if (merged.version !== upstreamPackageJson.version) {
    console.error(`❌ Version test failed: expected ${upstreamPackageJson.version}, got ${merged.version}`);
    testsPassed = false;
  } else {
    console.log(`✅ Version test passed: ${merged.version}`);
  }

  // Check dependencies
  const dependencyTests = [
    { expected: originalPackageJson.dependencies.react, name: 'react', source: 'original' },
    { expected: originalPackageJson.dependencies.next, name: 'next', source: 'original' },
    { expected: originalPackageJson.dependencies['custom-package'], name: 'custom-package', source: 'original' },
    { expected: upstreamPackageJson.dependencies['new-package'], name: 'new-package', source: 'upstream' }
  ];

  dependencyTests.forEach(test => {
    if (merged.dependencies[test.name] !== test.expected) {
      console.error(`❌ Dependency test failed for ${test.name}: expected ${test.expected}, got ${merged.dependencies[test.name]}`);
      testsPassed = false;
    } else {
      console.log(`✅ Dependency test passed for ${test.name}: ${merged.dependencies[test.name]} (from ${test.source})`);
    }
  });

  // Check devDependencies
  const devDependencyTests = [
    { expected: originalPackageJson.devDependencies.typescript, name: 'typescript', source: 'original' },
    { expected: originalPackageJson.devDependencies['custom-dev-package'], name: 'custom-dev-package', source: 'original' },
    { expected: upstreamPackageJson.devDependencies.eslint, name: 'eslint', source: 'upstream' }
  ];

  devDependencyTests.forEach(test => {
    if (merged.devDependencies[test.name] !== test.expected) {
      console.error(`❌ DevDependency test failed for ${test.name}: expected ${test.expected}, got ${merged.devDependencies[test.name]}`);
      testsPassed = false;
    } else {
      console.log(`✅ DevDependency test passed for ${test.name}: ${merged.devDependencies[test.name]} (from ${test.source})`);
    }
  });

  // Check pnpm overrides
  if (!merged.pnpm.overrides['custom-override'] || merged.pnpm.overrides['custom-override'] !== originalPackageJson.pnpm.overrides['custom-override']) {
    console.error(`❌ pnpm override test failed for custom-override`);
    testsPassed = false;
  } else {
    console.log(`✅ pnpm override test passed for custom-override: ${merged.pnpm.overrides['custom-override']} (from original)`);
  }

  if (!merged.pnpm.overrides['upstream-override'] || merged.pnpm.overrides['upstream-override'] !== upstreamPackageJson.pnpm.overrides['upstream-override']) {
    console.error(`❌ pnpm override test failed for upstream-override`);
    testsPassed = false;
  } else {
    console.log(`✅ pnpm override test passed for upstream-override: ${merged.pnpm.overrides['upstream-override']} (from upstream)`);
  }

  // Final result
  if (testsPassed) {
    console.log('\n✅ All tests passed! The package.json merge script is working correctly.');
  } else {
    console.error('\n❌ Some tests failed. Please check the merge script.');
  }

  // Clean up
  console.log('\nTest files created in:', testDir);
  console.log('You can inspect these files and then delete the directory when done.');
} else {
  console.error('❌ Merge operation failed');
}
