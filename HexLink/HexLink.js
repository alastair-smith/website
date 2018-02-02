const currentDocument = document.currentScript.ownerDocument

class HexLink extends HTMLElement {
  connectedCallback () {
    const shadowRoot = this.attachShadow({mode: 'open'})
    const template = currentDocument.querySelector('#hex-link-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    const title = this.getAttribute('title')
    const url = this.getAttribute('url')
    const height = this.getAttribute('hex-height')
    this.render({
      title,
      url,
      height
    })
  }

  render ({title, url, height}) {
    const points = '300,150 225,280 75,280 0,150 75,20 225,20'
    // Fill the respective areas of the card using DOM manipulation APIs
    // All of our components elements reside under shadow dom. So we created a this.shadowRoot property
    // We use this property to call selectors so that the DOM is searched only under this subtree
    const containerHex = this.shadowRoot.querySelector('.hex-container')
    containerHex.setAttribute('style', `height:${height};`)
    this.shadowRoot.querySelector('.link').setAttribute('href', url)
    this.shadowRoot.querySelectorAll('.hex')
      .forEach(element => element.setAttribute('points', points))
  }
}

customElements.define('hex-link', HexLink)
