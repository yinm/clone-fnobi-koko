const
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  async = require('async'),
  http = require('http'),
  express = require('express'),
  emptyPort = require('empty-port'),
  colors = require('colors'),
  opn = require('opn'),

  Proxy = require('./lib/Proxy'),
  localIP = require('./lib/localIP'),

  phpExpress = require('php-express')(),
  marked = require('marked')

const Koko = function(root, opt) {
  colors.setTheme({
    info: 'green',
    warn: 'yellow',
    error: 'red'
  })

  if (!fs.existsSync(root)) {
    console.error('%s doesn\'t exist.'.error, root)
  }
  console.log('document root\t: %s'.info, root)

  this.root = root
  this.openPath = opt.openPath
  this.staticPort = opt.staticPort
  this.proxyURL = opt.proxyURL
  this.usePHP = opt.usePHP
  this.useMarkdown = opt.useMarkdown
  this.htmlHandler = opt.htmlHandler
}

Koko.prototype.start = function() {
  this.startServer(function(err) {
    if (err) {
      console.error((err + '').error)
      process.exit()
    }

    if (!this.openPath) {
      return
    }

    this.open()
  }.bind(this))
}

Koko.prototype.startServer = function(callback) {
  const proxyURL = this.proxyURL
  let proxy

  const app = express()

  if (proxyURL) {
    proxy = new Proxy(proxyURL)
    console.log('proxy\t: %s:%d'.info, proxy.host, proxy.port)
  }

  console.log('php\t: %s'.info, this.usePHP ? 'on' : 'off')
  console.log('md\t: %s'.info, this.useMarkdown ? 'on' : 'off')

  app.configure(function() {
    app.use(express.bodyParser())

    if (this.usePHP) {
      app.set('views', this.rot)
      app.engine('php', phpExpress.engine)
      app.set('view engine', 'php')

      app.use(app.router)
    }

    if (this.useMarkdown) {
      app.use(function(req, res, next) {
        if (! /\.md$/.test(req.url)) {
          next()
          return
        }
        this.renderMarkdown(req, res)
      }.bind(this))
    }

    if (this.htmlHandler) {
      app.use(function(req, res, next) {
        if (! /\.html$/.test(req.url)) {
          next()
          return
        }
        this.handleHtmlWithCustomHandler(req, res)
      }.bind(this))
    }

    app.use(express.static(this.root))
    app.use(express.directory(this.root))

    app.use(function(req, res, next) {
      if (!proxy) {
        return next()
      }
      proxy.proxyRequest(req, res)
    })
  }.bind(this))

  if (this.usePHP) {
    app.all(/.+\.php$/, phpExpress.router)
  }

  async.waterfall([
    emptyPort.bind(this, {}),
    function(p, next) {
      this.port = this.staticPort || p

      http.createServer(app).listen(this.port, next)
    }.bind(this),
    function(next) {
      console.log('[listen %d]'.info, this.port)

      next()
    }.bind(this)
  ], callback)
}
