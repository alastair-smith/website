(() => {
  const currentDocument = document.currentScript.ownerDocument

  const getContainerStyle = hexHeight => `
    display: grid;
    grid-column-gap: calc(${hexHeight}*2/15);
    grid-row-gap: calc(${hexHeight}/30);
    grid-template-columns: repeat(auto-fit, calc(${hexHeight}*45/26));
    justify-content: center;
    padding-bottom:calc(${hexHeight}/2);
    padding-left: calc(${hexHeight}*15/52);
  `

  const initGetHexStyle = (hexHeight, marginTop, marginBottom, marginLeft) =>
    isSecondHex => `
      margin-left:${marginLeft};
      margin-bottom:${marginBottom};
      ${
        isSecondHex
          ? `margin-top:${marginTop};`
          : `margin-right:calc(${hexHeight}/15);`
      }
      `

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
      const leftSpace = `${hexHeight}*15/52`
      const marginLeft = `calc(-${leftSpace})`
      const marginBottom = `calc(-${hexHeight}/2)`
      const marginTop = `calc((${hexHeight}/2) + (${hexHeight}/30))`
      const getHexStyle = initGetHexStyle(hexHeight, marginTop, marginBottom, marginLeft)

      const containerElement = this.shadowRoot.querySelector('.container')
      containerElement.setAttribute('style', getContainerStyle(hexHeight))
      const blankHex = {}
      const hexPairs = items
        .reduce((pairing, hex, index) => {
          return pairing.prevHex
            ? { hexPairs: pairing.hexPairs.concat([[pairing.prevHex, hex]]) }
            : index === items.length - 1
              ? { hexPairs: pairing.hexPairs.concat([[hex, blankHex]]) }
              : { hexPairs: pairing.hexPairs, prevHex: hex }
        }, {hexPairs: []}).hexPairs

      hexPairs.forEach(hexPair => {
        const pairWrapper = document.createElement('div')
        pairWrapper.setAttribute('class', `pair-wrapper`)
        containerElement.appendChild(pairWrapper)
        hexPair.forEach((hex, index) => {
          const hexElement = document.createElement('hex-link')
          hexElement.setAttribute('hex-height', hexHeight)
          if (hex.url) hexElement.setAttribute('url', hex.url)
          if (hex.name) hexElement.setAttribute('name', hex.name)
          if (hex.svg) hexElement.setAttribute('svg', hex.svg)
          hexElement.setAttribute('style', getHexStyle(index === 1))
          pairWrapper.appendChild(hexElement)
        })
      })
    }
  }

  customElements.define('hex-grid', HexGrid)
})()
