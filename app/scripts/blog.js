const copyCode = async event => {
  const codeElement = event.target.parentElement.children[1]
  await navigator.clipboard.writeText(codeElement.textContent)
}

const activateCopyButtons = () => {
  const buttons = document.getElementsByClassName('copy-button')

  for (const button of buttons) {
    button.addEventListener('click', copyCode)
  }
}

const main = () => {
  activateCopyButtons()
}

main()
