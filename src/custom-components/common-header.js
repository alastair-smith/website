const WEBSITE_NAME = 'alsmith'

const styleTemplate = document.createElement('template')
styleTemplate.innerHTML = `
  <style>
    header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0px 2px 3px 0px rgba(0,0,0,0.1);
      padding: 30px;
    }
  
    a {
      text-decoration: none;
      color: #5c5e73;
      font-size: 30px;
    }
  </style>
`

const headerTemplate = document.createElement('template')
headerTemplate.innerHTML = `
  <header>
    <a href='/'>${WEBSITE_NAME}</a>
  </header>
`

customElements.define('common-header', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(styleTemplate.content.cloneNode(true))
    shadowRoot.appendChild(headerTemplate.content.cloneNode(true))
  }
})
