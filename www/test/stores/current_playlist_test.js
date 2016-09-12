var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;
var jsdom = require('mocha-jsdom');

import { generateMockSong } from '../../__tests_shared__/mock_data'

const TITLE_1 = "T1";
const ARTIST_1 = "A1";
const ALBUM_1 = "M1";

const TITLE_2 = "T2";
const ARTIST_2 = "A2";
const ALBUM_2 = "M2";

describe('CurrentPlaylist', () => {

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
        let CurrentPlaylistModule = proxyquire("../../app/stores/current_playlist.js", {
            "../utils/backend_metadata_api": self.backendMetadataApiStub}
        );

        self.CurrentPlaylist = CurrentPlaylistModule.CurrentPlaylist;
    });

    it('next songs returns and reloads correctly', () => {
        let playlist = new self.CurrentPlaylist();

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
        let playlist = new self.CurrentPlaylist();

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

});