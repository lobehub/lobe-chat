import { join, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'vietnam-market',
        environment: 'happy-dom',
        globals: true,
        setupFiles: [
            join(__dirname, './tests/setup.ts'),
            join(__dirname, './tests/vietnam-market-setup.ts')
        ],
        include: [
            'src/**/*.vietnam.test.{ts,tsx}',
            'src/locales/vi-VN/**/*.test.{ts,tsx}',
            'tests/vietnam-market/**/*.test.{ts,tsx}'
        ],
        alias: {
            '@': resolve(__dirname, './src'),
            '@/locales': resolve(__dirname, './locales'),
            '@/tests': resolve(__dirname, './tests')
        },
        env: {
            // Vietnam market specific environment variables
            NEXT_PUBLIC_DEFAULT_LANG: 'vi-VN',
            NEXT_PUBLIC_ENABLE_MOBILE_DEBUG: '1',
            NEXT_PUBLIC_ENABLE_TTS: '1',
            NEXT_PUBLIC_ENABLE_STT: '1',
            TTS_DEFAULT_VOICE: 'vi-VN-HoaiMyNeural',
            STT_DEFAULT_LANGUAGE: 'vi-VN',
            DEFAULT_CURRENCY: 'VND'
        },
        coverage: {
            reporter: ['text', 'json', 'lcov', 'html'],
            reportsDirectory: './coverage/vietnam-market',
            include: [
                'src/locales/vi-VN/**/*',
                'src/components/**/*',
                'src/features/**/*',
                'src/services/**/*'
            ],
            exclude: [
                'node_modules/**',
                'tests/**',
                '**/*.test.{ts,tsx}',
                '**/*.spec.{ts,tsx}'
            ]
        },
        testTimeout: 10000, // Longer timeout for mobile testing
        hookTimeout: 10000
    }
});