import { LitElement, html, css } from 'lit-element'
import './common-header'
import './common-footer'

export class StandardPageWrapper extends LitElement {
  static get styles () {
    return css`
      #standard-page-wrapper {
        display: flex;
        flex-direction: column;
        margin: 0;
        min-height: 100vh;
      }

      main {
        flex: 1;
      }
    `
  }

  render () {
    return html`
    <div id='standard-page-wrapper'>
      <common-header
        name='alsmith.dev'>
      </common-header>
      <main>
        <slot></slot>
      </main>
      <common-footer
        githubUsername='alastair-smith'
        twitterHandle='alsmithdev'
        emailAddress='contact@alsmith.dev'>
      </common-footer>
    </div>
    `
  }
}

customElements.define('standard-page-wrapper', StandardPageWrapper)
