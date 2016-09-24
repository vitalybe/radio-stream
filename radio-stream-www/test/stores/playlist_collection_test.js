var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var expect = require('chai').expect;
var jsdom = require('mocha-jsdom');

const PLAYLIST_1 = "PLAYLIST_1";
const PLAYLIST_2 = "PLAYLIST_2";

describe('PlaylistCollection', () => {

    jsdom();
    let self = {};

    beforeEach(() => {
        // Mocks
        self.backendMetadataApiStub = {
            "playlists": sinon.stub().returns(new Promise(resolve => {
                let playlistNames = [PLAYLIST_1, PLAYLIST_2];
                resolve(playlistNames);
            }))
        };


        // SUT
        let PlaylistCollectionModule = proxyquire("../../app/stores/playlist_collection", {
                "../utils/backend_metadata_api": self.backendMetadataApiStub
            }
        );

        self.PlaylistCollection = PlaylistCollectionModule.PlaylistCollection;
    });

    it('returns playlist names', () => {
        let playlistCollection = new self.PlaylistCollection();

        return playlistCollection.load()
            .then(() => {
                expect(playlistCollection.items.length).to.be.equal(2);
                expect(playlistCollection.items[0].name).to.be.equal(PLAYLIST_1);
                expect(playlistCollection.items[1].name).to.be.equal(PLAYLIST_2);
            })
    });


});