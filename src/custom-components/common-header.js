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
        box-shadow: 0px 2px 3px 0px rgba(0,0,0,0.1);
        padding: 48px;
      }

      a {
        text-decoration: none;
        color: #5c5e73;
        font-size: 60px;
      }
    `
  }

  render () {
    return html`
      <header>
        <a href='/'>${this.name}</a>
        <common-navigation compressed></common-navigation>
      </header>
    `
  }
}

customElements.define('common-header', CommonHeader)
