import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import ora from 'ora';

import {
  ContextExtractor,
  ExperienceExtractor,
  ExtractorConfig,
  IdentityExtractor,
  PreferenceExtractor,
  UserMemoryGateKeeper,
} from '../src';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Layer-specific model and provider configuration
 * Allows using different models for different extraction layers
 */
const LAYER_CONFIGS: Record<
  keyof LayerExtractorMap,
  { model?: string; provider?: string } | undefined
> = {
  context: {
    // model: 'gpt-4o',
    // provider: 'openai',
  },
  experience: {
    // model: 'gpt-4o',
    // provider: 'openai',
  },
  identity: {
    // model: 'gpt-4o',
    // provider: 'openai',
  },
  preference: {
    // model: 'gpt-4o',
    // provider: 'openai',
  },
};

/**
 * Layer-specific extraction options
 * Default options for each layer extractor
 */
const LAYER_OPTIONS: Record<keyof LayerExtractorMap, Record<string, any> | undefined> = {
  context: {
    language: 'zh-CN',
    username: 'User',
  },
  experience: {
    language: 'zh-CN',
    username: 'User',
  },
  identity: {
    existingIdentitiesContext: 'No existing identity entries.',
    retrievedContext: 'No similar memories retrieved.',
    sessionDate: new Date().toISOString(),
    username: 'User',
  },
  preference: {
    language: 'zh-CN',
    username: 'User',
  },
};

// ============================================================================
// Implement
// ============================================================================

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

interface InputData {
  messages: Array<{ content: string; role: string }>;
  options?: {
    availableCategories?: string[];
    existingContext?: string;
    existingIdentitiesContext?: string;
    language?: string;
    retrievedContext?: string;
    sessionDate?: string;
    topK?: number;
    username?: string;
  };
}

interface LayerExtractorMap {
  context: typeof ContextExtractor;
  experience: typeof ExperienceExtractor;
  identity: typeof IdentityExtractor;
  preference: typeof PreferenceExtractor;
}

const LAYER_EXTRACTORS: LayerExtractorMap = {
  context: ContextExtractor,
  experience: ExperienceExtractor,
  identity: IdentityExtractor,
  preference: PreferenceExtractor,
};

interface CacheCheckResult {
  gatekeeperExists: boolean;
  gatekeeperResult?: any;
  missingLayers: string[];
}

async function checkCache(outputFolder: string): Promise<CacheCheckResult> {
  try {
    await fs.access(outputFolder);

    // Check if gatekeeper file exists
    const gatekeeperPath = path.join(outputFolder, '1-gatekeeper.json');
    try {
      const gatekeeperContent = await fs.readFile(gatekeeperPath, 'utf8');
      const gatekeeperData = JSON.parse(gatekeeperContent);
      const gatekeeperResult = gatekeeperData.output;

      // Get layers that should be extracted according to gatekeeper
      const expectedLayers = Object.entries(gatekeeperResult)
        .filter(([, decision]: [string, any]) => decision.shouldExtract)
        .map(([layer]) => layer);

      // Check which layer files are missing
      const files = await fs.readdir(outputFolder);
      const missingLayers = expectedLayers.filter(
        (layer) => !files.includes(`2-layer-${layer}.json`),
      );

      return {
        gatekeeperExists: true,
        gatekeeperResult,
        missingLayers,
      };
    } catch {
      // Gatekeeper file doesn't exist or is invalid
      return {
        gatekeeperExists: false,
        missingLayers: [],
      };
    }
  } catch {
    // Output folder doesn't exist
    return {
      gatekeeperExists: false,
      missingLayers: [],
    };
  }
}

async function processFile(
  file: string,
  inputDir: string,
  outputDir: string,
  config: ExtractorConfig,
) {
  const inputPath = path.join(inputDir, file);
  const fileNameWithoutExt = path.basename(file, '.json');
  const outputFolder = path.join(outputDir, fileNameWithoutExt);

  // Check cache
  const cacheResult = await checkCache(outputFolder);

  // If cache is complete, skip
  if (cacheResult.gatekeeperExists && cacheResult.missingLayers.length === 0) {
    ora().info(`Skipped ${file} (cache complete)`);
    return { skipped: true };
  }

  const fileSpinner = ora(`Processing ${file}...`).start();

  try {
    // Read input
    const inputContent = await fs.readFile(inputPath, 'utf8');
    const inputData: InputData = JSON.parse(inputContent);

    // Ensure output folder exists
    await fs.mkdir(outputFolder, { recursive: true });

    let gatekeeperResult;

    // Step 1: Run GateKeeper if not cached
    if (!cacheResult.gatekeeperExists) {
      fileSpinner.text = `${file}: Running GateKeeper...`;
      const gatekeeper = new UserMemoryGateKeeper(config);
      gatekeeperResult = await gatekeeper.check(inputData.messages, {
        retrievedContext: inputData.options?.retrievedContext,
        topK: inputData.options?.topK,
      });

      // Save GateKeeper result
      await fs.writeFile(
        path.join(outputFolder, '1-gatekeeper.json'),
        JSON.stringify(
          {
            output: gatekeeperResult,
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            input: inputData,
            metadata: {
              model: config.model,
              processedAt: new Date().toISOString(),
              provider: config.provider,
            },
          },
          null,
          2,
        ),
        'utf8',
      );
    } else {
      fileSpinner.text = `${file}: Using cached GateKeeper result...`;
      gatekeeperResult = cacheResult.gatekeeperResult;
    }

    // Step 2: Run layer extractors based on GateKeeper results
    const layersToExtract = cacheResult.gatekeeperExists
      ? // If gatekeeper is cached, only extract missing layers
        cacheResult.missingLayers.map((layer) => [
          layer,
          gatekeeperResult[layer as keyof typeof gatekeeperResult],
        ])
      : // Otherwise, extract all layers that should be extracted
        Object.entries(gatekeeperResult).filter(
          ([, decision]: [string, any]) => decision.shouldExtract,
        );

    if (layersToExtract.length === 0) {
      fileSpinner.succeed(`${file}: No layers to extract`);
      return { processed: true };
    }

    let extractedCount = 0;
    for (const [layer] of layersToExtract) {
      const layerKey = layer as keyof LayerExtractorMap;
      const ExtractorClass = LAYER_EXTRACTORS[layerKey];
      if (!ExtractorClass) {
        fileSpinner.warn(`${file}: Unknown layer ${layer}, skipping`);
        continue;
      }

      fileSpinner.text = `${file}: Extracting ${layer} layer...`;

      // Create layer-specific config by merging base config with layer config
      const layerConfig: ExtractorConfig = {
        ...config,
        ...LAYER_CONFIGS[layerKey],
      };

      // Create layer-specific options by merging default layer options with input options
      const layerOptions = {
        ...LAYER_OPTIONS[layerKey],
        ...inputData.options,
      };

      const extractor = new ExtractorClass(layerConfig);
      const extractResult = await extractor.extract(inputData.messages, layerOptions);

      // Save layer extraction result
      await fs.writeFile(
        path.join(outputFolder, `2-layer-${layer}.json`),
        JSON.stringify(
          {
            output: extractResult,
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            input: inputData,
            metadata: {
              layer,
              model: layerConfig.model,
              options: layerOptions,
              processedAt: new Date().toISOString(),
              provider: layerConfig.provider,
            },
          },
          null,
          2,
        ),
        'utf8',
      );
      extractedCount++;
    }

    const isIncremental = cacheResult.gatekeeperExists;
    const message = isIncremental
      ? `${file}: Extracted ${extractedCount} missing layer(s)`
      : `${file}: Extracted ${extractedCount} layer(s)`;
    fileSpinner.succeed(message);
    return { processed: true };
  } catch (error) {
    fileSpinner.fail(
      `Failed to process ${file}: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error(error);
    return { failed: true };
  }
}

async function main() {
  const spinner = ora('Starting memory extraction...').start();

  try {
    // Check environment variables
    const provider = process.env.EXTRACT_PROVIDER || 'openai';
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    const model = process.env.EXTRACT_MODEL;

    if (!apiKey) {
      spinner.fail('Missing API key. Please set OPENAI_API_KEY or EXTRACT_API_KEY');
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }

    spinner.text = `Using provider: ${provider}, model: ${model}`;

    // Initialize config
    const config: ExtractorConfig = {
      apiKey,
      baseURL,
      model,
      provider,
    };

    // Get directories
    const inputDir = path.join(__dirname, '../datasets/inputs');
    const outputDir = path.join(__dirname, '../datasets/outputs');

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Read all JSON files from input directory
    const files = await fs.readdir(inputDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      spinner.warn('No JSON files found in datasets/inputs');
      return;
    }

    spinner.succeed(`Found ${jsonFiles.length} input file(s)`);

    // Process each file
    let skipped = 0;
    let processed = 0;
    let failed = 0;

    for (const file of jsonFiles) {
      const result = await processFile(file, inputDir, outputDir, config);

      if (result.skipped) {
        skipped++;
      } else if (result.processed) {
        processed++;
      } else if (result.failed) {
        failed++;
      }
    }

    // Summary
    const summary = [
      `✓ Processed: ${processed}`,
      skipped > 0 ? `ℹ Skipped: ${skipped}` : '',
      failed > 0 ? `✖ Failed: ${failed}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    ora().succeed(`All done! ${summary}`);
  } catch (error) {
    spinner.fail(`Error: ${error instanceof Error ? error.message : String(error)}`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().then(() => {
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
});
