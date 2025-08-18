// Removed duplicate default export to fix the error.
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import imports from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import playwright from 'eslint-plugin-playwright'
import prettier from 'eslint-plugin-prettier/recommended'
import security from 'eslint-plugin-security'
import tsEslint from '@typescript-eslint/eslint-plugin'

// noinspection JSUnusedGlobalSymbols
export default [
  {
    ignores: ['.husky', '.idea', '.vscode', 'e2e/.build', 'eslint.config.mjs', 'node_modules'],
  },
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  imports.flatConfigs.recommended,
  prettier,
  security.configs.recommended,
  stylistic.configs['recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/tests/**'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'approveContentVariant',
            'approveOptimiseVariant',
            'checkIntegrationLog',
            'configureAndStartOptimisationIntegration',
          ],
        },
      ],
      'playwright/no-commented-out-tests': ['error'],
      'playwright/no-duplicate-hooks': ['error'],
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      'playwright/no-skipped-test': 'off',
      'playwright/prefer-hooks-in-order': ['error'],
      'playwright/prefer-hooks-on-top': ['error'],
      'playwright/prefer-to-contain': ['error'],
      'playwright/prefer-to-have-count': ['error'],
      'playwright/prefer-to-have-length': ['error'],
    },
  },
  {
    name: 'Automation',

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    files: ['**/*.{js,ts,jsx,tsx}'],

    rules: {
      '@stylistic/indent': ['error', 2, { offsetTernaryExpressions: true, SwitchCase: 1 }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/lines-between-class-members': [
        'error',
        {
          enforce: [
            { blankLine: 'always', prev: '*', next: 'method' },
            { blankLine: 'always', prev: 'method', next: '*' },
            { blankLine: 'always', prev: 'field', next: 'field' },
          ],
        },
        { exceptAfterSingleLine: true },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
          },
        },
      ],
      '@stylistic/no-extra-parens': ['error', 'functions'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', { named: 'never' }],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/ban-eslint-comment': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/parameter-properties': [
        'error',
        {
          allow: ['private readonly', 'readonly'],
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      curly: 'warn',
      'guard-for-in': 'error',
      'import/namespace': 'off',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], ['type']],
          'newlines-between': 'always',
        },
      ],
      'jsdoc/require-jsdoc': [
        'error',
        {
          checkConstructors: false,
          contexts: ["MethodDefinition:not([accessibility='private'])"],
          require: {
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
          },
        },
      ],
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
      'linebreak-style': [0, 'unix'],
      'max-len': ['error', { code: 120, comments: 160, ignoreUrls: true }],
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-console': 1,
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'off',
      'no-return-await': 'warn',
      'no-self-compare': 'error',
      'no-undef': 'off',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'off',
      'no-useless-backreference': 'error',
      'prefer-object-spread': 1,
      'prefer-template': 1,
      'require-atomic-updates': 1,
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          allowSeparatedGroups: true,
        },
      ],
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          project: ['api', 'e2e'],
        },
      },
    },
  }
]