const expo = require('eslint-config-expo/flat');

module.exports = [
  ...(Array.isArray(expo) ? expo : [expo]),
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
    },
  },
  {
    ignores: ['server/**', 'dist/**', '.expo/**', 'scripts/**', 'node_modules/**'],
  },
];
