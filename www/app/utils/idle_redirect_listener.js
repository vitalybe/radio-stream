import history from './history'
import storeContainer, { observeStore } from './store_container';
import loggerCreator from './logger'

var observer = null;
var checkInterval = null;

var moduleLogger = loggerCreator(__filename);

const REDIRECT_AFTER = 30*60*1000;
const CHECK_EVERY = 10*1000;

export function start() {
  observer = observeStore(state => ({isPlaying: state.isPlaying}), data => {
    let logger = loggerCreator("observer", moduleLogger);
    if (!data.isPlaying) {
      logger.debug("player stopped - starting interval");
      var lastPlayStopDate = new Date();

      checkInterval = setInterval(() => {
        let logger = loggerCreator("interval", moduleLogger);
        var now = new Date();
        if (lastPlayStopDate && now - lastPlayStopDate > REDIRECT_AFTER) {
          logger.debug("player was paused for too long - redirecting to index");
          history.pushState(null, '/');
        }
      }, CHECK_EVERY);
    } else {
      logger.debug("player started - clearing interval");
      clearInterval(checkInterval);
      checkInterval = null;
    }
  });

}

export function stop() {
  let logger = loggerCreator(stop.name, moduleLogger);

  if (observer) {
    logger.debug("stopping ovserver")
    observer();
    observer = null;
  }

  if (checkInterval) {
    logger.debug("clearing interval")
    clearInterval(checkInterval);
    checkInterval = null;
  }

}