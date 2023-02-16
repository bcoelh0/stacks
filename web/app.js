const express = require('express')
var compression = require('compression')
var path = require('path')
const app = express()
const cookieSession = require('cookie-session')
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use('/contracts', express.static(path.join(__dirname, '../build/contracts')))
app.use('/abis', express.static(path.join(__dirname, '../build/abis')))
app.use('/scripts', express.static(path.join(__dirname, '../node_modules')))

// compress all responses
app.use(compression())

app.use(cookieSession({
  name: 'session',
  keys: ['k1'],
  maxAge: 600 * 24 * 60 * 60 * 1000 // 600 days
}))

app.get(['/', '/r/:hash'], (req, res) => {
  req.session.referral = req.session.referral || req.params.hash
  res.render('index', { hash: req.session.referral })
})

app.get(['/auction'], (req, res) => {
  res.render('auction')
})

app.get(['/about'], (req, res) => {
  res.render('about')
})

// app.get(['/wl', '/wl/:hash'], (req, res) => {
//   req.session.referral = req.session.referral || req.params.hash
//   res.render('whitelist', { hash: req.session.referral })
// })

// app.get(['/clear'], (req, res) => {
//   req.session.referral = undefined
//   res.redirect('/wl')
// })


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
