import * as fs from 'fs'
import * as path from 'path'
import * as watchman from 'fb-watchman'
import * as winston from 'winston'

const cfg = require(path.normalize('../cfg/config.json'))
const watch = new watchman.Client()
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'latest.log' }),
  ],
})

function processPhoto(path: string) {
  return new Promise((reject, resolve) => {})
}

watch.capabilityCheck({ optional: [], required: [] }, (err, resp) => {
  let watcher = 'watchman'
  if (err) {
    watcher = 'fs'
  }
  if (watcher === 'watchman') {
    logger.info('Watchman detected.')
  } else {
    logger.warn('Watchman not detected.')
    logger.warn(
      'See https://facebook.github.io/watchman/ for more information.'
    )
  }
  logger.info('Photo Manager starting.')

  if (watcher === 'watchman') {
    const ingestDir = path.resolve(cfg.ingestFolder)
    logger.info(ingestDir)
    const ingestWatch = watch.command(['watch-project', ingestDir], function(
      err,
      resp
    ) {
      if (err) {
        throw err
      }

      if ('warning' in resp) {
        logger.warn(resp.warning)
      }

      logger.info(JSON.stringify(resp))

      watch.command(
        [
          'subscribe',
          resp.watch,
          'ingest',
          {
            fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
          },
        ],
        (err, resp) => {
          if (err) {
            logger.error(err)
            return
          }
        }
      )
    })

    // Subscription results are emitted via the subscription event.
    // Note that this emits for all subscriptions.  If you have
    // subscriptions with different `fields` you will need to check
    // the subscription name and handle the differing data accordingly.
    // `resp`  looks like this in practice:
    //
    // { root: '/private/tmp/foo',
    //   subscription: 'mysubscription',
    //   files: [ { name: 'node_modules/fb-watchman/index.js',
    //       size: 4768,
    //       exists: true,
    //       type: 'f' } ] }
    watch.on('subscription', resp => {
      if (resp.subscription !== 'ingest') return

      logger.info('file changed: ' + JSON.stringify(resp))

      resp.files.forEach(function(file) {
        // convert Int64 instance to javascript integer
        const mtime_ms = +file.mtime_ms
      })
    })
  } else {
    logger.warn('Watchman not detected.')
    logger.warn(
      'See https://facebook.github.io/watchman/ for more information.'
    )
  }
})
