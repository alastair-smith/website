(() => {
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
      const name = this.getAttribute('name')
      this.render({
        title,
        url,
        height,
        name
      })
    }

    render ({title, url, height, name}) {
      const points = '300,150 225,280 75,280 0,150 75,20 225,20'
      // Fill the respective areas of the card using DOM manipulation APIs
      // All of our components elements reside under shadow dom. So we created a this.shadowRoot property
      // We use this property to call selectors so that the DOM is searched only under this subtree
      const containerHex = this.shadowRoot.querySelector('.hex-container')
      // const width = `calc(${height} * 28 / 30)`
      containerHex.setAttribute('style', `height:${height}`)
      if (url) this.shadowRoot.querySelector('.link').setAttribute('href', url)
      else this.shadowRoot.querySelector('.link').setAttribute('disabled', true)
      this.shadowRoot.querySelector('#shape').setAttribute('points', points)
      if (name) {
        this.shadowRoot.querySelector('#text').innerHTML = name
        this.shadowRoot.querySelector('#shape').innerHTML = `<title id='hex-label'>${name}</title>`
      }
    }
  }

  customElements.define('hex-link', HexLink)
})()
