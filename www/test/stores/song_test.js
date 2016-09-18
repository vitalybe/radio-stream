var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var mobx = require('mobx');
var expect = require('chai').expect;
var jsdom = require('mocha-jsdom');

import { generateMockSong } from '../../__tests_shared__/mock_data'

const TITLE = "T1";
const ARTIST = "A1";
const ALBUM = "M1";

describe('Song', () => {

    jsdom();
    let self = {};

    beforeEach(() => {

        // Mocks
        self.wrappedSound = {
            // mobx hack - related issue: https://github.com/mobxjs/mobx/issues/421
            play: mobx.asReference(sinon.stub()),
            pause: sinon.stub(),
            loaded: true
        };

        self.wrappedSoundManagerStub = {
            loadSound: sinon.stub().returns(new Promise(resolve => {
                resolve(self.wrappedSound)
            }))
        };

        self.MOCK_ARTIST_IMAGE = "MOCK_ARTIST_IMAGE";

        self.backendLastFmStub = {
            getArtistImage: sinon.stub().returns(new Promise(resolve => resolve(self.MOCK_ARTIST_IMAGE)))
        };

        // SUT
        let SongModule = proxyquire('../../app/stores/song.js', {
            '../utils/wrapped_sound_manager': self.wrappedSoundManagerStub,
            '../utils/backend_lastfm_api': self.backendLastFmStub
        });
        self.Song = SongModule.Song;
    });

    it('initialization', () => {
        console.log("song initialization");
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        expect(song.title).to.be.equal(TITLE);
        expect(song.artist).to.be.equal(ARTIST);
        expect(song.album).to.be.equal(ALBUM)
    });

    it('playSound happy path', () => {
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        return song.playSound().then(() => {
            expect(self.wrappedSoundManagerStub.loadSound.callCount).to.be.equal(1);
            expect(self.wrappedSound.play.callCount).to.be.equal(1);
        });

    });

});