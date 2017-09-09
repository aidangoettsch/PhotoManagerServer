"use strict";
exports.__esModule = true;
var path = require("path");
var watchman = require("fb-watchman");
var winston = require("winston");
var cfg = require(path.normalize('../cfg/config.json'));
var watch = new watchman.Client();
var logger = new winston.Logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'latest.log' }),
    ]
});
function processPhoto(path) {
    return new Promise(function (reject, resolve) { });
}
watch.capabilityCheck({ optional: [], required: [] }, function (err, resp) {
    var watcher = 'watchman';
    if (err) {
        watcher = 'fs';
    }
    if (watcher === 'watchman') {
        logger.info('Watchman detected.');
    }
    else {
        logger.warn('Watchman not detected.');
        logger.warn('See https://facebook.github.io/watchman/ for more information.');
    }
    logger.info('Photo Manager starting.');
    if (watcher === 'watchman') {
        var ingestDir = path.resolve(cfg.ingestFolder);
        logger.info(ingestDir);
        var ingestWatch = watch.command(['watch-project', ingestDir], function (err, resp) {
            if (err) {
                throw err;
            }
            if ('warning' in resp) {
                logger.warn(resp.warning);
            }
            logger.info(JSON.stringify(resp));
            watch.command([
                'subscribe',
                resp.watch,
                'ingest',
                {
                    fields: ['name', 'size', 'mtime_ms', 'exists', 'type']
                },
            ], function (err, resp) {
                if (err) {
                    logger.error(err);
                    return;
                }
            });
        });
        watch.on('subscription', function (resp) {
            if (resp.subscription !== 'ingest')
                return;
            logger.info('file changed: ' + JSON.stringify(resp));
            resp.files.forEach(function (file) {
                var mtime_ms = +file.mtime_ms;
            });
        });
    }
    else {
        logger.warn('Watchman not detected.');
        logger.warn('See https://facebook.github.io/watchman/ for more information.');
    }
});
//# sourceMappingURL=app.js.map