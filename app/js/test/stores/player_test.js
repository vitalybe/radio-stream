import loggerCreator from "../../app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

var proxyquire = require("proxyquire").noCallThru();
var sinon = require("sinon");
var expect = require("chai").expect;
var jsdom = require("mocha-jsdom");
var mobx = require("mobx");
var promiseRetryLib = require("promise-retry");

const RETRIES_COUNT = 5;

describe("Player", () => {
  jsdom();
  let self = {};

  beforeEach(async () => {
    // Mocks

    // mobx hack - related issue: https://github.com/mobxjs/mobx/issues/421
    // must use Object create and not object literal
    self.stubSong = Object.create({
      playSound: sinon.stub(),
      load: sinon.stub(),
      subscribePlayProgress: sinon.stub(),
      subscribeFinish: sinon.stub(),
    });

    self.stubPlaylist = Object.create({
      nextSong: sinon.stub().returns(
        new Promise(resolve => {
          resolve(self.stubSong);
        })
      ),
      peekNextSong: sinon.stub().returns(
        new Promise(resolve => {
          resolve(self.stubSong);
        })
      ),
      name: "StubPlaylist",
    });

    self.stubRetries = Object.create({
      promiseRetry: f => {
        let logger = loggerCreator("promiseRetry stub", moduleLogger);
        logger.info(`start`);

        return promiseRetryLib(
          retry => {
            logger.info(`starting: try...`);
            return f().catch(err => {
              logger.info(`caught err - will retry`);
              retry(err);
            });
          },
          { retries: RETRIES_COUNT, minTimeout: 0, maxTimeout: 0 }
        );
      },
    });

    // SUT
    let module = proxyquire("../../app/stores/player", {
      "../utils/retries": self.stubRetries,
    });

    self.player = module.default;
    await self.player.changePlaylist(self.stubPlaylist);
  });

  it("next plays the next song", async () => {
    await self.player.next();
    expect(self.stubSong.playSound.callCount).to.equal(1);
    expect(self.stubPlaylist.peekNextSong.callCount).to.equal(1);
  });

  it("next succeeds even if peeking fails", () => {
    self.stubPlaylist.peekNextSong = sinon.stub().returns(Promise.reject(new Error()));

    return self.player.next().then(() => {
      expect(self.stubSong.playSound.callCount).to.equal(1);
    });
  });

  it("keep retrying if playSound fails", () => {
    let logger = loggerCreator("test", moduleLogger);

    logger.info(`start`);

    let playSoundFails = true;
    self.stubSong.playSound = sinon.spy(() => {
      logger.info(`playSound spy called`);
      if (playSoundFails) {
        logger.info(`rejecting`);
        playSoundFails = false;
        return Promise.reject(new Error());
      } else {
        logger.info(`resolving`);
        return Promise.resolve();
      }
    });

    return self.player.next().then(() => {
      expect(self.stubSong.playSound.callCount).to.equal(2);
    });
  });
});
