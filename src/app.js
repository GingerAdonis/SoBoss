#!/usr/bin/env node

import 'core-js';
import 'regenerator-runtime/runtime';
import 'source-map-support/register';
import log from './log';
import Config from './config';
import Utils from './utils/utils';
import Sonos from './base/sonos';
import PackageJson from '../package.json';
import GenericDevices from './base/genericDevices';

// Show project name with version
const versionString = `# SoBoss v${PackageJson.version} #`;
console.log('#'.repeat(versionString.length));
console.log(versionString);
console.log('#'.repeat(versionString.length));

Utils.runAsync(async () => {
  log.info(`Current environment: ${Config.environment} (development: %s)`, Config.development);

  Sonos.startDiscoverDevices();

  // Wait a short while to allow Sonos devices to be discovered
  // eslint-disable-next-line promise/param-names
  await new Promise((r) => setTimeout(r, 4000));

  // Load general devices
  GenericDevices.load();

  log.info('Application is initialized and ready for use');

  // First generic devices check, which also schedules the next process
  Utils.runAsync(async () => {
    await GenericDevices.process();
  });
});
