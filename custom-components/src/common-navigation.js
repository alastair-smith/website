import { LitElement, html, css } from 'lit-element'

export default class CommonNavigation extends LitElement {
  constructor () {
    super()

    this.darkMode = false
  }

  static get properties () {
    return {
      darkMode: { type: Boolean }
    }
  }

  static get styles () {
    return css`
      nav {
        display: flex;
        flex-direction: row;
        padding: 1vw 0;
        flex-wrap: wrap;
      }

      a {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 1vw;
        text-decoration: none;
      }

      .dark-mode a {
        color: #efefef;
      }

      .light-mode a {
        color: #5c5e73;
      }
    `
  }

  render () {
    return html`
      <nav class=${this.darkMode ? 'dark-mode' : 'light-mode'}>
        <a href='/'>
          <span>🏠</span>
          <span>home</span>
        </a>
        <a href='/projects'>
          <span>⚗️</span>
          <span>projects</span>
        </a>
        <a href='/blog'>
          <span>✍️</span>
          <span>blog</span>
        </a>
        <a href='/contact'>
          <span>📇</span>
          <span>contact</span>
        </a>
      </nav>
    `
  }
}

customElements.define('common-navigation', CommonNavigation)
