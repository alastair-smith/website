(() => {
  const currentDocument = document.currentScript.ownerDocument

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
      const leftSpace = `${hexHeight}*300/(280*4)`
      const marginLeft = `calc(-${leftSpace})`
      const marginBottom = `calc(-${hexHeight}/2)`
      const marginTop = `calc(${hexHeight}/2)`
      const baseStyle = `margin-left:${marginLeft};margin-bottom:${marginBottom};`

      const containerElement = this.shadowRoot.querySelector('.container')
      containerElement.setAttribute(
        'style', `padding-bottom:calc(${hexHeight}/2);padding-left: calc(${leftSpace});`
      )
      const blankHex = {url: 'www.example.com'}
      const hexPairs = items
        .reduce((pairing, hex, index) => {
          return pairing.prevHex
            ? { hexPairs: pairing.hexPairs.concat([[pairing.prevHex, hex]]) }
            : index === items.length - 1
              ? { hexPairs: pairing.hexPairs.concat([[hex, blankHex]]) }
              : { hexPairs: pairing.hexPairs, prevHex: hex }
        }, {hexPairs: []}).hexPairs

      const getStyle = isSecondHex => `${baseStyle}${isSecondHex ? `margin-top:${marginTop};` : ''}`
      const renderHexes = (hexPairs, className) => hexPairs.forEach(hexPair => {
        const pairWrapper = document.createElement('div')
        pairWrapper.setAttribute('class', `pair-wrapper${className ? ` ${className}` : ''}`)
        containerElement.appendChild(pairWrapper)
        hexPair.forEach((hex, index) => {
          const hexElement = document.createElement('hex-link')
          hexElement.setAttribute('hex-height', hexHeight)
          hexElement.setAttribute('url', hex.url)
          hexElement.setAttribute('style', getStyle(index === 1, index))
          pairWrapper.appendChild(hexElement)
        })
      })

      renderHexes(
        hexPairs
      )
    }
  }

  customElements.define('hex-grid', HexGrid)
})()
