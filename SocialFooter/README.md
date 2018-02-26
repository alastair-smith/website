# Social Footer #

## Use ##

Requires the following in `index.html`'s `<head>`:

```html
<script src="https://use.fontawesome.com/0000000000.js"></script>
<link rel="import" href="./SocialFooter/SocialFooter.html">
```

Add the following at the bottom of `<body>`:

```html
<social-footer>
  <!-- Font awesome web component workaround -->
  <i slot="github" class="fa fa-github" aria-hidden="true" title='github'></i>
  <i slot="twitter" class="fa fa-twitter" aria-hidden="true" title='twitter'></i>
  <i slot="email" class="fa fa-envelope" aria-hidden="true" title='email'></i>
</social-footer>
```
