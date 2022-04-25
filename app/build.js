import remarkParse from 'remark-parse'
import nunjucks from 'nunjucks'
import { minify } from 'html-minifier'
import sass from 'sass'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkRehype from 'remark-rehype'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import rehypeRewrite from 'rehype-rewrite'
import { definer as hightlightTerraform } from 'highlightjs-terraform'
import copydir from 'copy-dir'
import { promises as fsPromises } from 'fs'

const buildDirectory = './build'
const postsDirectory = './blog'
const pagesDirectory = './templates/pages'
const blogPostTemplate = 'components/blog-post.njk'
const rootDirectory = './root'
const scriptsDirectory = './scripts'

const sassBuild = options => new Promise(
  (resolve, reject) => sass.render(
    options,
    (error, result) => error ? reject(error) : resolve(result)
  )
)

const buildCSS = async assetsVersion => {
  const addAssetVersion = url => new sass.types.String(
    `${url.getValue()}?v=${assetsVersion}`
  )
  const outFile = `${buildDirectory}/assets/styles/styles.css`
  const { css } = await sassBuild({
    file: './styles/styles.scss',
    outFile,
    outputStyle: 'compressed',
    functions: {
      'asset($url)': addAssetVersion
    }
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
    const blogUrl = fileDetail.data.publish ? `/blog/${pageTitle.replace(/:/g, '').replace(/ /g, '-').toLowerCase()}` : undefined
    return {
      filePath,
      pageTitle,
      content: fileDetail.content,
      blogUrl,
      ...fileDetail.data
    }
  })))
    .filter(({ publish, url }) => publish || url)
    .sort((a, b) => a.date < b.date ? 1 : -1)
}

const minifyHtml = html => minify(html, {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  quoteCharacter: '"',
  removeComments: true,
  removeEmptyAttributes: true,
  sortAttributes: true,
  minifyJS: true
})

const buildHTML = async assetsVersion => {
  const nunjucksEnvironment = nunjucks.configure(['templates'], { autoescape: true })

  nunjucksEnvironment.addFilter('asset', url => `${url}?v=${assetsVersion}`)

  nunjucksEnvironment.addFilter('date', dateText => {
    const date = new Date(dateText)
    return new Intl.DateTimeFormat(
      'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ).format(date)
  })

  nunjucksEnvironment.addFilter('injectDate',
    (contents, dateText) => contents.replace('</h1>', `</h1>${dateText}`)
  )

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

  const addCodeBlockCopyButton = node => {
    if (node.type === 'element' && node.tagName === 'pre') {
      node.children = [{
        type: 'element',
        tagName: 'button',
        properties: {
          className: 'copy-button'
        },
        children: [{ type: 'text', value: 'Copy 📋' }]
      }, ...node.children]
    }
  }

  // render blogs
  await Promise.all(
    allPostsInfo
      .filter(postInfo => postInfo.blogUrl)
      .map(async postInfo => {
        const content = String(await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeHighlight, { languages: { terraform: hightlightTerraform } })
          .use(rehypeRewrite, { rewrite: addCodeBlockCopyButton })
          .use(rehypeExternalLinks, { target: '_blank', rel: ['noreferrer'] })
          .use(rehypeSlug)
          .use(rehypeAutolinkHeadings, {
            behavior: 'prepend',
            properties: {
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
          .use(rehypeStringify)
          .process(postInfo.content))

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

const buildOtherStaticAssets = async assetsVersion => {
  const buildManifest = async filename => {
    const rawManifest = await fsPromises.readFile(`./manifests/${filename}`, 'utf8')
    const versionedManifest = rawManifest
      .replace(/\.png/g, `.png?v=${assetsVersion}`)
    await fsPromises
      .writeFile(`${buildDirectory}/${filename}`, versionedManifest)
  }

  const buildVersionEndpoint = async () => {
    const versionData = JSON.stringify({
      assetsVersion,
      commit: process.env.DRONE_COMMIT_SHA,
      build: process.env.DRONE_BUILD_NUMBER
    }, null, 2)
    await fsPromises.writeFile(`${buildDirectory}/version.json`, versionData)
  }

  await buildManifest('site.webmanifest')
  await buildManifest('browserconfig.xml')
  await buildVersionEndpoint()
}

const build = async () => {
  try {
    console.log('👷 Starting build...\n')

    console.log('📁 Creating build directory...')
    await fsPromises.rm(buildDirectory, { force: true, recursive: true })
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

    console.log('🔢 Generating asset version...')
    const assetsVersion = Date.now().toString(32)
    console.log('🔢 Generated asset version')

    console.log('📜 Copying scripts...')
    copydir.sync(scriptsDirectory, `${buildDirectory}/assets/scripts`)
    console.log('📜 Copying scripts complete')

    console.log('🖌️  Building CSS...')
    await buildCSS(assetsVersion)
    console.log('🖌️  CSS build complete')

    console.log('📄 Building HTML...')
    await buildHTML(assetsVersion)
    console.log('📄 HTML build complete')

    console.log('🗃️  Building other static assets...')
    await buildOtherStaticAssets(assetsVersion)
    console.log('🗃️  Build of other static assets complete')

    console.log(`\n🆔 Version Information:\n${await fsPromises.readFile(`${buildDirectory}/version.json`, 'utf8')}`)

    console.log('\n✅ Build successful')
    process.exit(0)
  } catch (error) {
    console.error(error)
    console.error('\n❌ Build Failed')
    process.exit(1)
  }
}

build()
