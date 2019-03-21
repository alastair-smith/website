import { LitElement, html, css } from 'lit-element'

export default class CommonNavigation extends LitElement {
  constructor () {
    super()

    this.darkMode = false
    this.compressed = false
  }

  static get properties () {
    return {
      darkMode: { type: Boolean },
      compressed: { type: Boolean }
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
        text-align: center;
        margin: 0 36px;
        text-decoration: none;
      }

      span {
        font-size: 60px;
      }

      .hide {
        display: none;
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
    console.log(this.compressed, 'x')
    return html`
      <nav class=${this.darkMode ? 'dark-mode' : 'light-mode'}>
        <a id='home' href='/' title='home' class=${this.compressed ? 'hide' : ''}>
          <span class='icon'>🏠</span>
          <span class='description'>home</span>
        </a>
        <a href='/projects' title='projects'>
          <span class='icon'>⚗️</span>
          <span class=${this.compressed ? 'hide' : ''}>projects</span>
        </a>
        <a href='/blog' title='blog'>
          <span class='icon'>✍️</span>
          <span class=${this.compressed ? 'hide' : ''}>blog</span>
        </a>
        <a href='/contact' title='contact'>
          <span class='icon'>📇</span>
          <span class=${this.compressed ? 'hide' : ''}>contact</span>
        </a>
      </nav>
    `
  }
}

customElements.define('common-navigation', CommonNavigation)
