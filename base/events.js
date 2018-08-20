const EventEmitter = require('events');
const Events = module.exports = new EventEmitter();

Events.on('deviceAvailabilityChange', (device, available) => {
    log.debug('deviceAvailabilityChange', device.getIdentifier(), available);
});
