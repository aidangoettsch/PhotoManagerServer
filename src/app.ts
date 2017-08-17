import fs from 'fs'
import path from 'path'
import watchman from 'fb-watchman'
import winston from 'winston'

const cfg = require('cfg/config.json')
const watcher = new watchman.Client()
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'latest.log' })
  ]
})

function processPhoto(path : string) {
  return new Promise((reject, resolve) => {

  })
}


watcher.capabilityCheck({optional:[], required:['relative_root']},
function (error, resp) {
  let watcher = 'watchman'
  if (error) {
    watcher = 'fs'
  }
  if (watcher === 'watchman') {
    logger.info('Watchman detected.')
  } else {
    logger.warn('Watchman not detected.')
    logger.warn('See https://facebook.github.io/watchman/ for more information.')
  }
  logger.info('Photo Manager starting.')
})
