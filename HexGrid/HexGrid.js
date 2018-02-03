(() => {
  const currentDocument = document.currentScript.ownerDocument

  const getPixelWidth = height => {
    return 300 / 280 * document.documentElement.clientHeight * height.replace(/\D+$/g, '') / 100
  }

  class HexGrid extends HTMLElement {
    connectedCallback () {
      const shadowRoot = this.attachShadow({mode: 'open'})
      const template = currentDocument.querySelector('#hex-grid-template')
      const instance = template.content.cloneNode(true)
      shadowRoot.appendChild(instance)

      const hexHeight = this.getAttribute('hex-height')
      const items = JSON.parse(this.getAttribute('items'))

      this.render({ hexHeight, items })
    }

    render ({hexHeight, items}) {
      items.forEach(({ url }, index) => {
        const hexElement = document.createElement('hex-link')
        hexElement.setAttribute('hex-height', hexHeight)
        hexElement.setAttribute('url', url)
        this.shadowRoot.querySelector('.container').appendChild(hexElement)
      })
      const containerWidth = this.shadowRoot.querySelector('.container').offsetWidth
      const hexWidth = getPixelWidth(hexHeight)
      const numberOfHexesInFirstRow = Math.floor(
        (4 * (containerWidth - hexWidth)) / (3 * hexWidth)
      ) + 1
      console.log('numberOfHexesInFirstRow', numberOfHexesInFirstRow)
      const isIndented = index => {
        return index % 2
      }

      this.shadowRoot.querySelectorAll('hex-link').forEach((element, index) => {
        const topMarginOffset = `-${hexHeight}/2`
        const horizontalMargin = `calc(-${hexWidth}px/8)`
        if (isIndented(index)) {
          element.setAttribute('style', `margin-left:${horizontalMargin};margin-right:${horizontalMargin};`)
        } else {
          element.setAttribute('style', `margin-left:${horizontalMargin};margin-right:${horizontalMargin};margin-top:calc(${topMarginOffset})`)
        }
      })
    }
  }

  customElements.define('hex-grid', HexGrid)
})()
