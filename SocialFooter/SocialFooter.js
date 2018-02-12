(() => {
  const currentDocument = document.currentScript.ownerDocument

  class SocialFooter extends HTMLElement {
    connectedCallback () {
      const shadowRoot = this.attachShadow({mode: 'open'})
      const template = currentDocument.querySelector('#footer-template')
      const instance = template.content.cloneNode(true)
      shadowRoot.appendChild(instance)
    }
  }

  customElements.define('social-footer', SocialFooter)
})()
