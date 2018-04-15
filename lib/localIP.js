const os = require('os')

const localIP = function() {
  const interfaces = os.networkInterfaces()
  let addresses = []

  for (let key in interfaces) {
    for (let key2 in interfaces[key]) {
      let address = interfaces[key][key2]
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address)
      }
    }
  }
  return addresses
}

module.exports = localIP