const
  url = require('url'),
  httpProxy = require('http-proxy')

const Proxy = function(proxyURL) {
  if (!proxyURL.match(/^https?:\/\//)) {
    proxyURL = 'http://' + proxyURL
  }

  const host = url.parse(proxyURL).hostname || 'localhost'
  const port = url.parse(proxyURL).port || 80

  const proxy = new httpProxy.HttpProxy({
    target: {
      host: host,
      port: port
    }
  })

  this.url = proxyURL
  this.host = host
  this.port = port
  this.proxy = proxy
}

Proxy.prototype.proxyRequest = function(req, res) {
  const host = this.host
  const proxy = this.proxy

  req.headers.host = host
  proxy.proxyRequest(req, res)
}

module.exports = Proxy
