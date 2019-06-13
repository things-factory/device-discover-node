const fs = require('fs')
const dgram = require('dgram')
const path = require('path')
const url = require('url')

const device = require('./src/device')

const deviceMetaPath = './config/device.info'

// ST types:
// 0. urn:things-factory:device:all:all
// 1. urn:things-factory:device:appserver:linux
// 2. urn:things-factory:device:printer-agent:linux
// 3. urn:things-factory:device:tv-agent:linux
// 4. urn:things-factory:device:pda:android
// 5. urn:things-factory:device:tablet:android
// 6. urn:things-factory:device:browser:chrome

// fs.readFile('DATA', 'utf8', function(err, contents) {
//   console.log(contents)
// })
var contents = fs.readFileSync(path.join(__dirname, deviceMetaPath), 'utf8')
const selfSt = contents

const socket = dgram.createSocket('udp4')
const listen = () => {
  socket.on('listening', () => {
    socket.addMembership('239.255.255.250')
  })

  socket.on('message', msgBuf => {
    if (!selfSt) {
      return
    }

    msg = msgBuf.toString()
    if (
      msg.indexOf('M-SEARCH') >= 0 &&
      (msg.indexOf('urn:things-factory:device:all:all') >= 0 || msg.indexOf(selfSt) >= 0)
    ) {
      // let addrInfos = device.getNetworkAddress()
      // if (!addrInfos || addrInfos.length == 0) {
      //   console.warn('network is not avaliable!!')
      //   return
      // }
      // let { ipAddress, macAddress } = addrInfos[0]

      let deviceInfo = device.getInfo()
      let { ipAddress, macAddress } = deviceInfo
      let cacheAge = 60
      let headers = [
        'HTTP/1.1 200 OK',
        `CACHE-CONTROL: max-age = ${cacheAge}`,
        `LOCATION: ${ipAddress}`,
        `ST: ${selfSt}`,
        `USN: ${macAddress}` // electron으로 build했을때 값이 없음.
      ].join('\r\n')

      console.log(headers)
      const response = new Buffer(headers)
      socket.send(response, 0, response.length, 1900, '239.255.255.250')
    }
  })

  socket.bind(1900)
}

const search = (st) => {
  const search = new Buffer(
    [
      'M-SEARCH * HTTP/1.1',
      'HOST: 239.255.255.250:1900',
      'MAN: "ssdp:discover"',
      'MX: 1',
      `ST: ${st}`
    ].join('\r\n')
  )
  socket.send(search, 0, search.length, 1900, '239.255.255.250')
}

module.exports = { search, listen }

listen()




// noti message example
// NOTIFY * HTTP/1.1
// HOST: 239.255.255.250:1900
// CACHE-CONTROL: max-age=60
// LOCATION: http://192.168.0.200:5200/Printer.xml
// NT: upnp:rootdevice
// NTS: ssdp:alive
// SERVER: Network Printer Server UPnP/1.0 V3.00.01.18     DEC-21-2012
// USN: uuid:16a65700-007c-1000-bb49-001599e13f05::upnp:rootdevice

// response message example
// HTTP/1.1 200 OK
// CACHE-CONTROL: max-age = seconds until advertisement expires
// DATE: when response was generated
// EXT:
// LOCATION: URL for UPnP description for root device
// SERVER: OS/version UPnP/1.1 product/version
// ST: search target
// USN: composite identifier for the advertisement
// BOOTID.UPNP.ORG: number increased each time device sends an initial announce or an update message
// CONFIGID.UPNP.ORG: number used for caching description information
// SEARCHPORT.UPNP.ORG: number identifies port on which device responds to unicast M-SEARCH
