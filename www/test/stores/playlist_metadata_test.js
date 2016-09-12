var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;
var jsdom = require('mocha-jsdom');

const PLAYLIST_1 = "PLAYLIST_1";
const PLAYLIST_2 = "PLAYLIST_2";

describe('PlaylistMetadataCollection', () => {

    jsdom();
    let self = {};

    beforeEach(() => {
        // Mocks
        self.backendMetadataApiStub = {
            "playlists": sinon.stub()
        };

        self.backendMetadataApiStub.playlists.returns(new Promise(resolve => {
            let playlistNames = [PLAYLIST_1, PLAYLIST_2];
            resolve(playlistNames);
        }));

        // SUT
        let PlaylistMetadataModule = proxyquire("../../app/stores/playlist_metadata", {
            "../utils/backend_metadata_api": self.backendMetadataApiStub}
        );

        self.PlaylistMetadataCollection = PlaylistMetadataModule.PlaylistMetadataCollection;
    });

    it('returns playlist names', () => {
        let playlistMetadataCollection = new self.PlaylistMetadataCollection();

        return playlistMetadataCollection.load()
            .then( () => {
                expect(playlistMetadataCollection.items.length).to.be.equal(2);
                expect(playlistMetadataCollection.items[0].name).to.be.equal(PLAYLIST_1);
                expect(playlistMetadataCollection.items[1].name).to.be.equal(PLAYLIST_2);
            })
    });


});