'use strict'
const os = require('os')
const ifaces = os.networkInterfaces()

const getNetworkAddress = () => {
  var infos = []
  Object.keys(ifaces).forEach(ifname => {
    let seq = 0
    ifaces[ifname].forEach(iface => {
      if ('IPv6' === iface.family || iface.internal) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return
      }
      infos.push({
        ipAddress: iface.address,
        macAddress: iface.mac
      })
      seq++
    })
  })

  return infos[0]
}

const getInfo = () => {
  const os = require('os')
  console.log(os.hostname()) // localhost
  console.log(os.type()) // Darwin(MaxOS)
  console.log(os.platform()) // drawin
  console.log(os.release()) // 18.6.0?
  console.log(os.arch()) // x64
  console.log(os.totalmem() / 1024 / 1024 / 1024) // 8
  console.log(os.cpus()[0].model) // Intel(R) Core(TM) i5-5257U CPU @ 2.70GHz
  console.log(os.networkInterfaces()) //

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    memory: os.totalmem() / 1024 / 1024 / 1024 + 'GB',
    cpu: os.cpus()[0].model,
    ...getNetworkAddress()
  }
}

module.exports = { getInfo }