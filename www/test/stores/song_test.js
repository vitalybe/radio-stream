var proxyquire = require('proxyquire');
var sinon = require('sinon');
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
        self.Song = proxyquire('../../app/stores/song.js', { '../utils/wrapped_sound_manager': {} }).Song;
    });

    it('initialization', () => {
        console.log("song initialization");
        let song = new self.Song(generateMockSong(ARTIST, ALBUM, TITLE));
        expect(song.title).to.be.equal(TITLE);
        expect(song.artist).to.be.equal(ARTIST);
        expect(song.album).to.be.equal(ALBUM)
    });
});