const WEBSITE_NAME = 'alsmith'

const styleTemplate = document.createElement('template')
styleTemplate.innerHTML = `
  <style>
    header {
      align-items: center;
      box-shadow: 0px 2px 3px 0px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 30px;
    }
  
    a {
      color: #5c5e73;
      font-size: 30px;
      text-decoration: none;
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
