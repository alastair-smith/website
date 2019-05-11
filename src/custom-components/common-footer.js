const GITHUB_USERNAME = 'alastair-smith'
const TWITTER_HANDLE = 'alsmithdev'
const EMAIL_ADDRESS = 'contact@alsmith.dev'

const GITHUB_PATH = 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
const TWITTER_PATH = 'M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z'
const EMAIL_PATH = 'M0 4v8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1zm13 0L7 9 1 4h12zM1 5.5l4 3-4 3v-6zM2 12l3.5-3L7 10.5 8.5 9l3.5 3H2zm11-.5l-4-3 4-3v6z'

const contactStyleTemplate = document.createElement('template')
contactStyleTemplate.innerHTML = `
  <style>
    a {
      color: white;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-decoration: none;
    }

    span {
      margin-left: 0.5em;
      font-size: 18px;
    }

    svg {
      height: 40px;
      width: 40px;
    }

    path {
      fill: #efefef;
      transition: fill 0.5s ease;
    }
  </style>
`

const contactHTMLTemplate = document.createElement('template')
contactHTMLTemplate.innerHTML = `
  <a target='_blank' rel='noopener'>
    <svg
      role='img'
      xmlns='http://www.w3.org/2000/svg'>
      <path />
    </svg>
    <span></span>
  </a>
`

const getContactHTML = (url, service, path, contactName, viewBox) => {
  const element = contactHTMLTemplate.content.cloneNode(true)
  element.querySelector('a').setAttribute('href', url)
  element.querySelector('svg').setAttribute('viewBox', viewBox)
  element.querySelector('svg path').setAttribute('d', path)
  element.querySelector('span').innerHTML = `${service}</br>${contactName}`
  return element
}

customElements.define('contact-link', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    const url = this.getAttribute('url')
    const service = this.getAttribute('service')
    const contactName = this.getAttribute('contactName')
    const path = this.getAttribute('path')
    const viewBox = this.getAttribute('viewBox')

    this.appendChild(contactStyleTemplate.content.cloneNode(true))
    this.appendChild(getContactHTML(url, service, path, contactName, viewBox))
  }
})

const footerStyleTemplate = document.createElement('template')
footerStyleTemplate.innerHTML = `
  <style>
    footer {
      background-color: #5c5e73;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      padding: 36px 0 72px;
      width: 100%;
    }

    contact-link {
      margin: 12px;
      min-width: 204px;
    }

    #github:focus-within svg path, #github:hover svg path {
      fill: #999;
    }

    #twitter:focus-within svg path, #twitter:hover svg path {
      fill: #1DA1F2;
    }

    #email:focus-within a svg path, #email:hover svg path {
      fill: #e98c3f;
    }
  </style>
`
const footerHTMLTemplate = document.createElement('template')
footerHTMLTemplate.innerHTML = `
  <footer>
    <contact-link
      id='github'
      service='github'
      path='${GITHUB_PATH}'
      contactName='@${GITHUB_USERNAME}'
      url='http://github.com/${GITHUB_USERNAME}'
      viewBox='0 0 24 24'>
    </contact-link>
    <contact-link
      id='twitter'
      service='twitter'
      path='${TWITTER_PATH}'
      contactName='@${TWITTER_HANDLE}'
      url='https://twitter.com/${TWITTER_HANDLE}'
      viewBox='0 0 24 24'>
    </contact-link>
    <contact-link
      id='email'
      service='email'
      path='${EMAIL_PATH}'
      contactName='${EMAIL_ADDRESS}'
      url='mailto:${EMAIL_ADDRESS}'
      viewBox='0 0 14 14'>
    </contact-link>
  </footer>
`

customElements.define('common-footer', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(footerStyleTemplate.content.cloneNode(true))
    shadowRoot.appendChild(footerHTMLTemplate.content.cloneNode(true))
  }
})
