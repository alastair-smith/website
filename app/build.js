const nunjucks = require('nunjucks')
const { minify } = require('html-minifier')
const sass = require('sass')
const matter = require('gray-matter')
const remark = require('remark')
const remarkHTML = require('remark-html')
const slug = require('remark-slug')
const headings = require('remark-autolink-headings')
const copydir = require('copy-dir')
const { promises: fsPromises } = require('fs')

const buildDirectory = './build'
const postsDirectory = './blog'
const pagesDirectory = './templates/pages'
const blogPostTemplate = 'components/blog-post.njk'
const rootDirectory = './root'
const scriptsDirectory = './scripts'

const nunjucksEnvironment = nunjucks
  .configure(['templates'], { autoescape: true })

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
    const pageTitle = fileDetail.content.split('\n')[1].replace(/&nbsp;/g, ' ').replace(/[^a-zA-Z0-9: ]/g, '').trim()
    const blogUrl = `/blog/${pageTitle.replace(/:/g, '').replace(/ /g, '-').toLowerCase()}`
    return {
      filePath,
      pageTitle,
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
  sortAttributes: true,
  minifyJS: true
})

const buildHTML = async () => {
  const allPostsInfo = await getAllPostsInfo()
  const pages = await getPageNames(pagesDirectory)
  const templatePages = pages.filter(page => page.endsWith('.njk'))

  // render pages
  await Promise.all(templatePages.map(async page => {
    const pagePath = page.replace(`${pagesDirectory}/`, 'pages/')
    const html = minifyHtml(
      nunjucksEnvironment.render(
        pagePath,
        { allPostsInfo, pageUrl: `/${pagePath.replace(/.njk$/, '')}` }
      )
    )

    const pageName = `${buildDirectory}/${pagePath.replace('pages/', '').replace('.njk', '')}`
    if (pageName.endsWith('index') || pageName.endsWith('404')) {
      // write to root
      await fsPromises.writeFile(`${pageName}.html`, html)
    } else {
      await fsPromises.mkdir(pageName, { recursive: true })
      await fsPromises.writeFile(`${pageName}/index.html`, html)
    }
  }))

  // render blogs
  await Promise.all(
    allPostsInfo
      .filter(postInfo => postInfo.blogUrl)
      .map(async postInfo => {
        const content = await remark()
          .use(remarkHTML)
          .use(slug)
          .use(headings, {
            linkProperties: {
              className: ['anchor-link']
            },
            content: {
              type: 'element',
              tagName: 'img',
              properties: {
                src: '/assets/images/anchor-link.svg',
                alt: 'link icon'
              }
            }
          })
          .process(postInfo.content)
        const html = minifyHtml(
          nunjucksEnvironment.render(
            blogPostTemplate,
            {
              content,
              postDate: postInfo.date,
              pageTitle: postInfo.pageTitle,
              pageUrl: postInfo.blogUrl,
              imageUrl: postInfo.imageUrl
            }
          )
        )
        const pageName = `${buildDirectory}${postInfo.blogUrl}`
        await fsPromises.mkdir(pageName, { recursive: true })
        await fsPromises.writeFile(`${pageName}/index.html`, html)
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
    await fsPromises.mkdir(`${buildDirectory}/assets/scripts`)
    await fsPromises.mkdir(`${buildDirectory}/blog`)
    console.log('📁 Build directory created')

    console.log('🖼️  Copying assets')
    copydir.sync(rootDirectory, buildDirectory)
    console.log('🖼️  Copying assets complete')

    console.log('📜  Copying scripts...')
    copydir.sync(scriptsDirectory, `${buildDirectory}/assets/scripts`)
    console.log('📜  Copying scripts complete')

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
