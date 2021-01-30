const nunjucks = require('nunjucks')
const { minify } = require('html-minifier')

nunjucks.configure(['pages', 'components'], { autoescape: true })
const minifyHtml = html => minify(html, {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  quoteCharacter: '"',
  removeComments: true,
  removeEmptyAttributes: true,
  sortAttributes: true
})

