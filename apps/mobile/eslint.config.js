// apps/mobile/eslint.config.js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const pluginQuery = require('@tanstack/eslint-plugin-query');

module.exports = defineConfig([
  expoConfig,
  ...pluginQuery.configs['flat/recommended'],
  {
    rules: {
      // Metro doesn't tree-shake, so the root entry bundles every icon (~2 MB).
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              message: "Import icons individually, e.g. `import X from 'lucide-react-native/icons/x'`.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'ios/*', 'android/*'],
  },
]);
