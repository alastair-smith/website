const emphasiseWord = (word, color) => {
  const textNode = document.createTextNode(word)
  const italics = document.createElement('i')
  if (color) italics.setAttribute('style', `color:${color};`)
  italics.appendChild(textNode)
  return italics
}

const mapSentences = mapping => text => {
  const possibleDelimiters = ',.?!'
  const delimiters = text
    .split('')
    .filter(char => possibleDelimiters.includes(char))
    .map(delimiter => document.createTextNode(delimiter))
  const sentences = text.split(/[,.?!]/).filter(sentence => sentence)
  return sentences
    .reduce((nodesSoFar, sentence, index) => {
      const withNewNode = nodesSoFar.concat(mapping(sentence))
      return delimiters[index]
        ? withNewNode.concat(delimiters[index])
        : withNewNode
    }, [])
}

const replaceLastWord = (sentence, color) => {
  const words = sentence.split(' ')
  const lastWord = words.pop()
  const textStartNode = document.createTextNode(words.join(' '))
  const lastNode = emphasiseWord(` ${lastWord}`, color)
  return [textStartNode, lastNode]
}

const replaceBes = (sentence, color) => {
  const nodesWithoutBes = sentence
    .split(' be ')
    .map(text => document.createTextNode(text))
  return nodesWithoutBes
    .reduce((nodesSoFar, textNode, index) => {
      const withNewNode = nodesSoFar.concat(textNode)
      return index !== nodesWithoutBes.length - 1
        ? withNewNode.concat(emphasiseWord(' be ', color))
        : withNewNode
    }, [])
}

customElements.define('chandler-bing', class extends HTMLElement {
  constructor (...args) {
    super(...args)

    this.updateText = this.updateText.bind(this)

    this.updateText()

    this.isUpdating = false
    this.addEventListener('DOMNodeInserted', event => {
      if (!this.isUpdating) {
        this.isUpdating = true
        this.updateText()
        this.isUpdating = false
      }
    })
    this.addEventListener('slotChange', () => {
      this.updateText()
    })
  }

  updateText () {
    const color = this.getAttribute('inflection-color')
    const formattedNodes = mapSentences(sentence =>
      sentence
        .trim()
        .toLowerCase()
        .startsWith('could')
        ? replaceBes(sentence, color)
        : sentence
          .trim()
          .toLowerCase()
          .startsWith('maybe')
          ? replaceLastWord(sentence, color)
          : [document.createTextNode(sentence)]
    )(this.childNodes[0].nodeValue.trim())

    const heWouldSayThatLikeANormalPerson = formattedNodes.length <= 1

    if (!heWouldSayThatLikeANormalPerson) {
      while (this.firstChild) {
        this.removeChild(this.firstChild)
      }
      formattedNodes.forEach(node => this.appendChild(node))
    }
  }
})
