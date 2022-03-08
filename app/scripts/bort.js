const BORT_URL = '/bort/api'
const BORT_FORM_ID = 'bort'
const BORT_COUNTER_ID = 'bort-counter'

const updateBortCounter = newCount => {
  const bortCounterElement = document.getElementById(BORT_COUNTER_ID)
  bortCounterElement.textContent = newCount.toString()
}

const hideBortForm = () => {
  const bortForm = document.getElementById(BORT_FORM_ID)
  bortForm.style.visibility = 'hidden'
}

const getBortCount = async () => {
  const response = await fetch(BORT_URL)
  const count = (await response.json()).count
  updateBortCounter(count)
}

const updateBortCount = async () => {
  const options = {
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(BORT_URL, options)
  const count = (await response.json()).count

  updateBortCounter(count)
  hideBortForm()
}

const processForm = async event => {
  if (event.preventDefault) event.preventDefault()

  await updateBortCount()

  return false
}

const attachFormProcessor = () => {
  document
    .getElementById(BORT_FORM_ID)
    .addEventListener('submit', processForm)
}

const main = async () => {
  attachFormProcessor()
  await getBortCount()
}

main()
