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
      let module = proxyquire("../../app/domain/song.js", {
        "../utils/wrapped_sound_manager": self.stubWrappedSoundManager,
        "../utils/backend_lastfm_api": self.stubBackendLastFm,
        "../utils/backend_metadata_api": sinon.stub(),
      });

      return new module.Song(...args);
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

    it("subscribe finish", () => {
      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));
      let finishCallbackStub = sinon.stub();
      song.subscribeFinish(finishCallbackStub);
      return song.playSound().then(() => {
        var stubPlay = self.stubWrappedSound.play;
        expect(stubPlay.callCount).to.equal(1);

        var optionsArg = stubPlay.getCall(0).args[0];
        expect(optionsArg.onfinish).to.equal(finishCallbackStub);
      });
    });

    it("subscribe progress", () => {
      let song = self.sutNewSong(generateMockSong(ARTIST, ALBUM, TITLE));
      let progressCallbackStub = sinon.stub();
      song.subscribePlayProgress(progressCallbackStub);
      return song.playSound().then(() => {
        var stubPlay = self.stubWrappedSound.play;
        expect(stubPlay.callCount).to.equal(1);

        var optionsArg = stubPlay.getCall(0).args[0];

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
});
