log.info('Sonos time...');

const Sonos = require('sonos');
const search = Sonos.DeviceDiscovery({timeout: 30000})

search.on('DeviceAvailable', function (device, model) {
    log.info(device, model)
});

/*device.getTopology()
    .then(console.log);*/

/*class Sonos {

}

module.exports = Sonos;*/