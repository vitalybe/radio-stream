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
        self.stubWrappedSound = {
            // mobx hack - related issue: https://github.com/mobxjs/mobx/issues/421
            play: mobx.asReference(sinon.stub()),
            pause: sinon.stub(),
            loaded: true
        };

        self.stubWrappedSoundManager = {
            loadSound: sinon.stub().returns(new Promise(resolve => {
                resolve(self.stubWrappedSound)
            }))
        };

        self.MOCK_ARTIST_IMAGE = "MOCK_ARTIST_IMAGE";

        self.backendLastFmStub = {
            getArtistImage: sinon.stub().returns(new Promise(resolve => resolve(self.MOCK_ARTIST_IMAGE)))
        };

        // SUT
        let SongModule = proxyquire('../../app/stores/song.js', {
            '../utils/wrapped_sound_manager': self.stubWrappedSoundManager,
            '../utils/backend_lastfm_api': self.backendLastFmStub
        });
        self.Song = SongModule.Song;
    });

    it('initialization', () => {
        console.log("song initialization");
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        expect(song.title).to.equal(TITLE);
        expect(song.artist).to.equal(ARTIST);
        expect(song.album).to.equal(ALBUM)
    });

    it('playSound happy path', () => {
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        return song.playSound().then(() => {
            expect(self.stubWrappedSoundManager.loadSound.callCount).to.equal(1);
            expect(self.stubWrappedSound.play.callCount).to.equal(1);
        });
    });

    it('playSound subscribe finish', () => {
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        let finishCallbackStub = sinon.stub();
        song.subscribeFinish(finishCallbackStub);
        return song.playSound().then(() => {

            var stubPlay = self.stubWrappedSound.play;
            expect(stubPlay.callCount).to.equal(1);

            var optionsArg = stubPlay.getCall(0).args[0];
            expect(optionsArg.onfinish).to.equal(finishCallbackStub);
        });
    });


    it('playSound subscribe progress', () => {
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
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
    })
});