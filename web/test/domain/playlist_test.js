import loggerCreator from '../../app/utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var expect = require('chai').expect;
var jsdom = require('mocha-jsdom');

import {generateMockSong} from '../_shared/mock_data'

const TITLE_1 = "T1";
const ARTIST_1 = "A1";
const ALBUM_1 = "M1";

const TITLE_2 = "T2";
const ARTIST_2 = "A2";
const ALBUM_2 = "M2";

describe('Playlist', () => {

  jsdom();
  let self = {};

  beforeEach(() => {

    // Mocks
    self.backendMetadataApiStub = {
      "playlistSongs": sinon.stub()
    };

    self.backendMetadataApiStub.playlistSongs.returns(new Promise(resolve => {
      let songs = [generateMockSong(ARTIST_1, ALBUM_1, TITLE_1), generateMockSong(ARTIST_2, ALBUM_2, TITLE_2)];
      resolve(songs);
    }));

    // SUT
    self.sutPlaylist = (...args) => {
      let module = proxyquire("../../app/domain/playlist.js", {
          "../utils/backend_metadata_api": self.backendMetadataApiStub
        }
      );

      return module.default;
    }
  });

  it('next songs returns and reloads correctly', () => {
    let playlist = new (self.sutPlaylist());

    return playlist.nextSong()
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);

        return expect(song.title).to.be.equal(TITLE_1);
      })
      .then(() => {
        return playlist.nextSong()
      })
      .then(song => {
        return expect(song.title).to.be.equal(TITLE_2);
      })
      .then(() => {
        return playlist.nextSong()
      })
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(2);

        return expect(song.title).to.be.equal(TITLE_1);
      });
  });

  it('peek song returns the current song', () => {
    let playlist = new (self.sutPlaylist());

    return playlist.peekNextSong()
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);

        return expect(song.title).to.be.equal(TITLE_1);
      })
      .then(() => {
        return playlist.peekNextSong()
      })
      .then(song => {
        return expect(song.title).to.be.equal(TITLE_1);
      })
      .then(() => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
      });
  });

  it('reload playlist if it did not reload for a while', () => {
    let logger = loggerCreator("test", moduleLogger);

    self.backendMetadataApiStub.playlistSongs.returns(new Promise(resolve => {
      var mockSong = generateMockSong(ARTIST_1, ALBUM_1, TITLE_1);

      let songs = [mockSong, mockSong, mockSong, mockSong, mockSong];
      resolve(songs);
    }));

    let PlaylistClass = self.sutPlaylist();
    let playlist = new PlaylistClass();

    var clock = sinon.useFakeTimers();
    return playlist.nextSong()
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
        return playlist.nextSong()
      })
      .then(() => {
        return playlist.nextSong()
      })
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(1);
      })
      .then(() => {
        clock.tick(PlaylistClass.RELOAD_PLAYLIST_AFTER_MINUTES * 60 * 1000)
        return playlist.nextSong()
      })
      .then(song => {
        expect(self.backendMetadataApiStub.playlistSongs.callCount).to.be.equal(2);
      })
      // finally
      .catch(err => {
        return err;
      })
      .then(err => {
        logger.info(`restoring clock`);
        clock.restore();

        if (err)
          throw err;
      });
  })

})
;