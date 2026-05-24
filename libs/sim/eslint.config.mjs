import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'libs/sim must remain framework-free' },
            { name: 'react-dom', message: 'libs/sim must remain framework-free' },
            { name: 'next', message: 'libs/sim must remain framework-free' },
          ],
          patterns: [
            { group: ['next/*'], message: 'libs/sim must remain framework-free' },
            { group: ['@nestjs/*'], message: 'libs/sim must remain framework-free' },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'libs/sim must remain framework-free — no network I/O' },
      ],
    },
  },
];
