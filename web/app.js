const express = require('express')
var path = require('path')
const app = express()
const cookieSession = require('cookie-session')
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use('/contracts', express.static(path.join(__dirname, '../build/contracts')))
app.use('/scripts', express.static(path.join(__dirname, '../node_modules')))

app.use(cookieSession({
  name: 'session',
  keys: ['k1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get(['/', '/r/:hash'], (req, res) => {
  req.session.referral = req.session.referral || req.params.hash
  res.render('index', { hash: req.session.referral })
})

// app.get(['/wl', '/wl/:hash'], (req, res) => {
//   req.session.referral = req.session.referral || req.params.hash
//   res.render('whitelist', { hash: req.session.referral })
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
