/* eslint-env node */
module.exports = {
  root: true,
  env: { node: true },
  overrides: [
    // js
    {
      files: ['**/*.js', '**/*.mjs'],
      extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'prettier/prettier'
      ],
      plugins: ['prettier'],
      parserOptions: {
        ecmaVersion: 'latest'
      },
      env: {
        es6: true
      },
      overrides: [
        {
          files: ['**/*.mjs'],
          parserOptions: {
            sourceType: 'module'
          }
        }
      ]
    },

    // ts
    {
      files: ['./src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      plugins: ['import', '@typescript-eslint', 'prettier'],
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'prettier/prettier'
      ],
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts']
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true
          }
        }
      },
      rules: {
        // couchdb uses this everywhere
        'no-underscore-dangle': 'off',

        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
        ],

        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            filter: { regex: '^(_id|_rev|_revisions|_+)$', match: false },
            format: ['camelCase', 'PascalCase', 'UPPER_CASE']
          },
          // Allow camelCase functions (23.2), and PascalCase functions (23.8)
          {
            selector: 'function',
            format: ['camelCase', 'PascalCase']
          },
          // Airbnb recommends PascalCase for classes (23.3), and although Airbnb does not make TypeScript recommendations, we are assuming this rule would similarly apply to anything "type like", including interfaces, type aliases, and enums
          {
            selector: 'typeLike',
            format: ['PascalCase']
          }
        ]
      },
      overrides: [
        // tests
        {
          files: ['**/__tests__/**/*.ts', '*.spec.ts', '*.test.ts'],
          plugins: ['jest'],
          env: {
            jest: true
          },
          rules: {
            'import/no-extraneous-dependencies': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
          }
        }
      ]
    }
  ],
  settings: {
    react: {
      version: '17'
    }
  }
};
