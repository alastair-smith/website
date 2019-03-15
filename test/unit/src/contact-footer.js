const rewire = require('rewire')
const contactFooter = rewire('../../../src/contact-footer')

const sandbox = createSandbox()
describe('ContactFooter', () => {
  afterEach(() => {
    sandbox.restore()
  })
  it('element is registered', () => {
    const customElements = {
      define: sandbox.spy()
    }
    contactFooter.__set__('customElements', customElements)

    contactFooter.ContactFooter()

    expect(customElements.define.callCount).to.be.equal.to(1)
  })
})
