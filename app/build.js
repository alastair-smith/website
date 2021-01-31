const nunjucks = require('nunjucks')
const { minify } = require('html-minifier')
const { promises: fsPromises } = require('fs')

const buildDirectory = './build'
const nestedDirectoryRegex = /\.\/build\/.*\//g

nunjucks.configure(['pages', 'components'], { autoescape: true })

const getPageNames = async directory => {
  const pages = await fsPromises.readdir(directory, { withFileTypes: true })
  return (await Promise.all(pages.map(
    async page => page.isDirectory()
      ? await getPageNames(`${directory}/${page.name}`)
      : `${directory}/${page.name}`
  ))).flat()
}

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

const buildHTML = async () => {
  const pages = await getPageNames('./pages')
  const templatePages = pages.filter(page => page.endsWith('.njk'))
  await Promise.all(templatePages.map(async page => {
    const pagePath = page.replace('./pages/', '')
    const html = minifyHtml(nunjucks.render(pagePath))
    const buildPath = `${buildDirectory}/${pagePath.replace('.njk', '.html')}`
    if (buildPath.match(nestedDirectoryRegex)) {
      const parentDirectory = buildPath.split('/').slice(0, -1).join('/')
      await fsPromises.mkdir(parentDirectory, { recursive: true })
    }
    await fsPromises.writeFile(buildPath, html)
  }))
}

const build = async () => {
  try {
    console.log('Creating build directory...')
    await fsPromises.rmdir(buildDirectory, { recursive: true })
    await fsPromises.mkdir(buildDirectory)
    console.log('Build directory created.')

    console.log('Building HTML...')
    await buildHTML()
    console.log('HTML build complete')

    console.log('✅ Build successful')
    process.exit(0)
  } catch (error) {
    console.error(error)
    console.error('❌ Build Failed')
    process.exit(1)
  }
}

build()
