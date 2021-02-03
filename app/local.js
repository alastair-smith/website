const express = require('express')
const path = require('path')

const app = express()
const port = 8080
app.use(express.static('build', { extensions: ['html'] }))
app.use((request, response, next) => response.status(404).sendFile(path.join(__dirname, './build/404.html')))
app.listen(port)
console.log(`🏃 App started at http://localhost:${port}/`)
