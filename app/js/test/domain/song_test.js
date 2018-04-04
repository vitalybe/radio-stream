var proxyquire = require("proxyquire").noCallThru();
var sinon = require("sinon");
var mobx = require("mobx");
var expect = require("chai").expect;
var jsdom = require("mocha-jsdom");

import { generateMockSong } from "../_shared/mock_data";

const TITLE = "T1";
const ARTIST = "A1";
const ALBUM = "M1";

describe("Song", () => {
  jsdom();
  let self = {};

  beforeEach(() => {
    // Mocks
    // mobx hack - related issue: https://github.com/mobxjs/mobx/issues/421
    self.stubWrappedSound = Object.create({
      play: sinon.stub(),
      pause: sinon.stub(),
      loaded: true,
    });

    self.stubWrappedSoundManager = {
      loadSound: sinon.stub().returns(
        new Promise(resolve => {
          resolve(self.stubWrappedSound);
        })
      ),
    };

    self.MOCK_ARTIST_IMAGE = "MOCK_ARTIST_IMAGE";

    self.stubBackendLastFm = {
      getArtistImage: sinon.stub().returns(new Promise(resolve => resolve(self.MOCK_ARTIST_IMAGE))),
    };

    // SUT
    self.sutNewSong = (...args) => {
      let module = proxyquire("../../app/stores/player/song/song.web.js", {
        "app/stores/player/wrapped_sound/wrapped_sound_manager": self.stubWrappedSoundManager,
        "app/utils/backend_lastfm_api": self.stubBackendLastFm,
        "app/utils/backend_metadata_api/backend_metadata_api": sinon.stub(),
        "app/stores/player/song_actions": sinon.stub(),
      });

      return new module.default(...args);
    };
  });

  it("initialization", () => {
    console.log("song initialization");
    let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));

    expect(song.title).to.equal(TITLE);
    expect(song.artist).to.equal(ARTIST);
    expect(song.album).to.equal(ALBUM);
  });

  describe("playsound", () => {
    it("happy path", () => {
      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));
      return song.playSound().then(() => {
        expect(self.stubWrappedSoundManager.loadSound.callCount).to.equal(1);
        expect(self.stubBackendLastFm.getArtistImage.callCount).to.equal(1);
        expect(self.stubWrappedSound.play.callCount).to.equal(1);
      });
    });

    it("loadSound fails", () => {
      let STUB_ERROR = new Error();
      self.stubWrappedSoundManager.loadSound = sinon.stub().returns(Promise.reject(STUB_ERROR));

      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));
      return song
        .playSound()
        .then(() => {
          throw "Exception not thrown";
        })
        .catch(err => {
          expect(err).to.equal(STUB_ERROR);
        });
    });

    it("getArtistImage fails", () => {
      let STUB_ERROR = "IMAGE_ERROR";
      self.stubBackendLastFm.getArtistImage = sinon.stub().returns(Promise.reject(STUB_ERROR));

      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));
      return song.playSound().then(() => {
        expect(true).to.equal(true);
      });
    });

    it("subscribe finish", async () => {
      let finishCallbackStub = sinon.stub();
      let progressCallbackStub = sinon.stub();
      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE), progressCallbackStub, finishCallbackStub);

      await song.playSound();

      let stubLoadSound = self.stubWrappedSoundManager.loadSound;
      expect(stubLoadSound.callCount).to.equal(1);

      let optionsArg = stubLoadSound.getCall(0).args[1];
      expect(optionsArg.onfinish).to.equal(finishCallbackStub);
    });

    it("subscribe progress", async () => {
      let finishCallbackStub = sinon.stub();
      let progressCallbackStub = sinon.stub();
      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE), progressCallbackStub, finishCallbackStub);

      await song.playSound();
      let stubLoadSound = self.stubWrappedSoundManager.loadSound;
      expect(stubLoadSound.callCount).to.equal(1);

      let optionsArg = stubLoadSound.getCall(0).args[1];

      expect(progressCallbackStub.callCount).to.equal(0);

      self.stubWrappedSound.position = 5000;
      optionsArg.whileplaying.call(self.stubWrappedSound);
      expect(progressCallbackStub.callCount).to.equal(1);

      // callback shouldn't be called if position still on same second
      self.stubWrappedSound.position = 5100;
      optionsArg.whileplaying.call(self.stubWrappedSound);
      expect(progressCallbackStub.callCount).to.equal(1);

      self.stubWrappedSound.position = 6000;
      optionsArg.whileplaying.call(self.stubWrappedSound);
      expect(progressCallbackStub.callCount).to.equal(2);
    });
  });
});
