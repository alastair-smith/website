const nunjucks = require('nunjucks')
const { minify } = require('html-minifier')
const sass = require('sass')
const matter = require('gray-matter')
const remark = require('remark')
const remarkHTML = require('remark-html')
const { promises: fsPromises } = require('fs')

const buildDirectory = './build'
const nestedDirectoryRegex = /\.\/build\/.*\//g
const postsDirectory = './posts'
const blogPostTemplate = 'blog-post.njk'

const nunjucksEnvironment = nunjucks
  .configure(['pages', 'components'], { autoescape: true })

nunjucksEnvironment.addFilter('date', dateText => {
  const date = new Date(dateText)
  return new Intl.DateTimeFormat(
    'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  ).format(date)
})

nunjucksEnvironment.addFilter('injectDate',
  ({ contents }, dateText) => contents.replace('</h1>', `</h1>${dateText}`)
)

const sassBuild = options => new Promise(
  (resolve, reject) => sass.render(
    options,
    (error, result) => error ? reject(error) : resolve(result)
  )
)

const buildCSS = async () => {
  const outFile = `${buildDirectory}/assets/styles/styles.css`
  const { css } = await sassBuild({
    file: './styles/styles.scss',
    outFile,
    outputStyle: 'compressed'
  })
  await fsPromises.writeFile(outFile, css)
}

const getPageNames = async directory => {
  const pages = await fsPromises.readdir(directory, { withFileTypes: true })
  return (await Promise.all(pages.map(
    async page => page.isDirectory()
      ? await getPageNames(`${directory}/${page.name}`)
      : `${directory}/${page.name}`
  ))).flat()
}

const getAllPostsInfo = async () => {
  const postFileNames = await getPageNames(postsDirectory)
  return (await Promise.all(postFileNames.map(async filePath => {
    const fileDetail = matter(await fsPromises.readFile(filePath))
    const blogUrl = `/blog/${fileDetail.content.split('\n')[1].replace(/&nbsp;/g, ' ').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/ /g, '-').toLowerCase()}`
    return {
      filePath,
      content: fileDetail.content,
      blogUrl,
      ...fileDetail.data
    }
  }))).sort((a, b) => a.date < b.date ? 1 : -1)
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
  const allPostsInfo = await getAllPostsInfo()
  const pages = await getPageNames('./pages')
  const templatePages = pages.filter(page => page.endsWith('.njk'))

  // render pages
  await Promise.all(templatePages.map(async page => {
    const pagePath = page.replace('./pages/', '')
    const html = minifyHtml(nunjucksEnvironment.render(pagePath, { allPostsInfo }))
    const buildPath = `${buildDirectory}/${pagePath.replace('.njk', '.html')}`
    if (buildPath.match(nestedDirectoryRegex)) {
      const parentDirectory = buildPath.split('/').slice(0, -1).join('/')
      await fsPromises.mkdir(parentDirectory, { recursive: true })
    }
    await fsPromises.writeFile(buildPath, html)
  }))

  // render blogs
  await Promise.all(
    allPostsInfo
      .filter(postInfo => postInfo.blogUrl)
      .map(async postInfo => {
        const content = await remark().use(remarkHTML).process(postInfo.content)
        const html = minifyHtml(nunjucksEnvironment.render(blogPostTemplate, { content, postDate: postInfo.date }))
        const buildPath = `${buildDirectory}${postInfo.blogUrl}.html`
        await fsPromises.writeFile(buildPath, html)
      })
  )
}

const build = async () => {
  try {
    console.log('👷 Starting build...\n')

    console.log('📁 Creating build directory...')
    await fsPromises.rmdir(buildDirectory, { recursive: true })
    await fsPromises.mkdir(buildDirectory)
    await fsPromises.mkdir(`${buildDirectory}/assets`)
    await fsPromises.mkdir(`${buildDirectory}/assets/images`)
    await fsPromises.mkdir(`${buildDirectory}/assets/styles`)
    await fsPromises.mkdir(`${buildDirectory}/blog`)
    console.log('📁 Build directory created')

    console.log('Copying assets')
    await fsPromises.copyFile('./assets/images/line-background.svg', './build/assets/images/line-background.svg')
    console.log('Copying assets complete')

    console.log('🖌️  Building CSS...')
    await buildCSS()
    console.log('🖌️  CSS build complete')

    console.log('📄 Building HTML...')
    await buildHTML()
    console.log('📄 HTML build complete')

    console.log('\n✅ Build successful')
    process.exit(0)
  } catch (error) {
    console.error(error)
    console.error('\n❌ Build Failed')
    process.exit(1)
  }
}

build()
