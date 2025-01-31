// Copyright 2017-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { join } from 'path';

import type { IConfig } from 'config';

import {
  Environment,
  getEnvironment,
  setEnvironment,
} from '../ts/environment';

// In production mode, NODE_ENV cannot be customized by the user
setEnvironment(Environment.Staging);


// Set environment vars to configure node-config before requiring it
process.env.NODE_ENV = getEnvironment();
process.env.NODE_CONFIG_DIR = join(__dirname, '..', 'config');

if (getEnvironment() === Environment.Production) {
  // harden production config against the local env
  process.env.NODE_CONFIG = '';
  process.env.NODE_CONFIG_STRICT_MODE = 'true';
  process.env.HOSTNAME = '';
  process.env.NODE_APP_INSTANCE = '';
  process.env.ALLOW_CONFIG_MUTATIONS = '';
  process.env.SUPPRESS_NO_CONFIG_WARNING = '';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '';
  process.env.SIGNAL_ENABLE_HTTP = '';
}

// We load config after we've made our modifications to NODE_ENV
// eslint-disable-next-line import/order, import/first
import config from 'config';

// Log resulting env vars in use by config
[
  'NODE_ENV',
  'NODE_CONFIG_DIR',
  'NODE_CONFIG',
  'ALLOW_CONFIG_MUTATIONS',
  'HOSTNAME',
  'NODE_APP_INSTANCE',
  'SUPPRESS_NO_CONFIG_WARNING',
  'SIGNAL_ENABLE_HTTP',
].forEach(s => {
  console.log(`${s} ${config.util.getEnv(s)}`);
});

export default config;
export type { IConfig as ConfigType };
