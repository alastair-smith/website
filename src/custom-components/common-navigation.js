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
        text-align: center;
        margin: 0 40px;
        text-decoration: none;
      }

      span {
        font-size: 60px;
      }

      .description {
        display: none;
      }

      #home {
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
    return html`
      <nav class=${this.darkMode ? 'dark-mode' : 'light-mode'}>
        <a id='home' href='/' title='home'>
          <span class='icon'>🏠</span>
          <span class='description'>home</span>
        </a>
        <a href='/projects' title='projects'>
          <span class='icon'>⚗️</span>
          <span class='description'>projects</span>
        </a>
        <a href='/blog' title='blog'>
          <span class='icon'>✍️</span>
          <span class='description'>blog</span>
        </a>
        <a href='/contact' title='contact'>
          <span class='icon'>📇</span>
          <span class='description'>contact</span>
        </a>
      </nav>
    `
  }
}

customElements.define('common-navigation', CommonNavigation)
