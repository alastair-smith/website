const currentDocument = document.currentScript.ownerDocument
// const style = currentDocument.querySelector('style')
// document.head.appendChild(style)

class HexLink extends HTMLElement {
  connectedCallback () {
    const shadowRoot = this.attachShadow({mode: 'open'})
    const template = currentDocument.querySelector('#hex-link-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    const title = this.getAttribute('title')
    const url = this.getAttribute('url')
    this.render({
      title,
      url
    })
  }

  render ({title, url}) {
    // Fill the respective areas of the card using DOM manipulation APIs
    // All of our components elements reside under shadow dom. So we created a this.shadowRoot property
    // We use this property to call selectors so that the DOM is searched only under this subtree
    this.shadowRoot.querySelector('.link').href = url
    this.shadowRoot.querySelector('.title').innerHTML =
      `<h1>${title}</h1>`
  }
}

customElements.define('hex-link', HexLink)
