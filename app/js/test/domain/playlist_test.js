import loggerCreator from "../../app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

var proxyquire = require("proxyquire").noCallThru();
var sinon = require("sinon");
var expect = require("chai").expect;
var jsdom = require("mocha-jsdom");

import { generateMockSong } from "../_shared/mock_data";
import Constants from "app/utils/constants";

const TITLE_1 = "T1";
const ARTIST_1 = "A1";
const ALBUM_1 = "M1";

const TITLE_2 = "T2";
const ARTIST_2 = "A2";
const ALBUM_2 = "M2";

const TITLE_3 = "T3";
const ARTIST_3 = "A3";
const ALBUM_3 = "M3";

describe("Playlist", () => {
  jsdom();
  let self = {};

  beforeEach(() => {
    // Mocks
    self.backendMetadataApiStub = {
      playlistSongs: sinon
        .stub()
        .onCall(0)
        .returns(
          new Promise(resolve => {
            let songs = [generateMockSong(ARTIST_1, ALBUM_1, TITLE_1), generateMockSong(ARTIST_2, ALBUM_2, TITLE_2)];
            resolve(songs);
          })
        )
        .onCall(1)
        .returns(
          new Promise(resolve => {
            let songs = [generateMockSong(ARTIST_3, ALBUM_3, TITLE_3)];
            resolve(songs);
          })
        ),
    };

    self.mockSong = function(songData) {
      this.title = songData.title;
      this.id = songData.id;
      this.artist = songData.artist;
      this.album = songData.album;
    };

    // SUT
    self.sutPlaylist = (...args) => {
      let module = proxyquire("../../app/stores/player/playlist/playlist.web.js", {
        "app/utils/backend_metadata_api/backend_metadata_api": { backendMetadataApi: self.backendMetadataApiStub },
        "app/stores/player/song/song.web": self.mockSong,
      });

      return module.default;
    };
  });

  it("next songs returns and reloads correctly", async () => {
    let logger = loggerCreator("test", moduleLogger);

    let playlist = new (self.sutPlaylist())();

    let song = await playlist.nextSong();
    expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
    expect(song.title).to.be.equal(TITLE_1);

    song = await playlist.nextSong();
    expect(song.title).to.be.equal(TITLE_2);

    song = await playlist.nextSong();
    expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(2);
    expect(song.title).to.be.equal(TITLE_3);
  });

  it("peek song returns the current song", async () => {
    let playlist = new (self.sutPlaylist())();

    let song = await playlist.peekNextSong();
    expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
    expect(song.title).to.be.equal(TITLE_1);

    song = await playlist.peekNextSong();
    expect(song.title).to.be.equal(TITLE_1);
    expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
  });

  it("reload playlist if it did not reload for a while", async () => {
    let logger = loggerCreator("test", moduleLogger);

    self.backendMetadataApiStub.playlistSongs = sinon.stub().returns(
      new Promise(resolve => {
        var mockSong = generateMockSong(ARTIST_1, ALBUM_1, TITLE_1);
        let songs = [mockSong, mockSong, mockSong, mockSong, mockSong];
        resolve(songs);
      })
    );

    let playlist = new (self.sutPlaylist())();

    try {
      var clock = sinon.useFakeTimers();
      await playlist.nextSong();
      logger.info(`got songs amount: ${playlist.songs.length}`);
      expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
      await playlist.nextSong();

      await playlist.nextSong();
      expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
      clock.tick(Constants.RELOAD_PLAYLIST_AFTER_MINUTES * 60 * 1000);

      await playlist.nextSong();
      expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(2);
      logger.info(`restoring clock`);
    } finally {
      clock.restore();
    }
  });
});
