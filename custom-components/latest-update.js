import { LitElement, html, css } from 'lit-element'

const icon = {
  Blog: '✍',
  Project: '⚗️'
}

export default class LatestUpdate extends LitElement {
  constructor () {
    super()

    this.description = 'Creating a boilerplate for webpages using web components'
    this.title = ''
    this.type = ''
    this.url = ''
  }

  static get properties () {
    return {
      description: { type: String },
      title: { type: String },
      type: { type: String },
      url: { type: String }
    }
  }

  static get styles () {
    return css`
      a {
        align-items: center;
        background-color: #eeefff;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        color: #000000;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin: 8px;
        width: 300px;
        padding: 8px;
        text-decoration: none;
        transition: 0.3s;
      }

      a:hover {
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
      }

      .update-heading {
        font-weight: bold;
      }      
    `
  }

  render () {
    return html`
      <a href=${this.url}>
        <span class='update-heading'>${icon[this.type]} ${this.type}</span>
        <span class='update-heading'>${this.title}</span>
        <slot></slot>
      </a>
    `
  }
}

customElements.define('latest-update', LatestUpdate)
