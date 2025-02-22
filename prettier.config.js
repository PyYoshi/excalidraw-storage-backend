module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrderParserPlugins: [
    'typescript',
    'classProperties',
    'decorators-legacy',
  ],
  singleQuote: true,
  trailingComma: 'all',
  importOrder: ['^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
