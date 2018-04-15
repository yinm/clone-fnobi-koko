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
