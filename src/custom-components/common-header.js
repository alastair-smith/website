import { LitElement, html, css } from 'lit-element'
import './common-navigation'

export class CommonHeader extends LitElement {
  constructor () {
    super()

    this.name = 'home'
  }

  static get properties () {
    return {
      name: { type: String }
    }
  }

  static get styles () {
    return css`
      header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0 2em;
        margin: 1em 0 4em 0;
        width: calc(100% - 4em);
        box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.1);
      }

      a {
        text-decoration: none;
        color: #5c5e73;
        margin: 1em;
        font-size: 60px;
      }
    `
  }

  render () {
    return html`
      <header>
        <a href='/'>${this.name}</a>
        <common-navigation></common-navigation>
      </header>
    `
  }
}

customElements.define('common-header', CommonHeader)
