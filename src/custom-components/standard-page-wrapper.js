import './common-header'
import './common-footer'

const styleTemplate = document.createElement('template')
styleTemplate.innerHTML = `
  <style>
    #standard-page-wrapper {
      display: flex;
      flex-direction: column;
      margin: 0;
      min-height: 100vh;
    }

    slot {
      display: flex;
      flex: 1;
    }
  </style>
`

const standardPageWrapperTemplate = document.createElement('template')
standardPageWrapperTemplate.innerHTML = `
  <div id='standard-page-wrapper'>
    <common-header
      name='alsmith.dev'>
    </common-header>
    <slot></slot>
    <common-footer
      githubUsername='alastair-smith'
      twitterHandle='alsmithdev'
      emailAddress='contact@alsmith.dev'>
    </common-footer>
  </div>
`

customElements.define('standard-page-wrapper', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(styleTemplate.content.cloneNode(true))
    shadowRoot.appendChild(standardPageWrapperTemplate.content.cloneNode(true))
  }
})
