import { PlaylistMetadataCollection, PlaylistMetadata } from '../../app/stores/playlist_metadata'
import * as backendMetadataApi from '../../app/utils/backend_metadata_api'

jest.mock('../../app/utils/backend_metadata_api.js');

const PLAYLIST_1 = "PLAYLIST_1";
const PLAYLIST_2 = "PLAYLIST_2";

describe('PlaylistMetadataCollection', () => {

    beforeEach(() => {
        backendMetadataApi.playlists.mockClear();

        backendMetadataApi.playlists.mockReturnValue(new Promise(resolve => {
            let playlistNames = [PLAYLIST_1, PLAYLIST_2];
            resolve(playlistNames);
        }));
    });

    it('returns playlist names', () => {
        let playlistMetadataCollection = new PlaylistMetadataCollection();

        return playlistMetadataCollection.load()
            .then( () => {
                expect(playlistMetadataCollection.items.length).toBe(2);
                expect(playlistMetadataCollection.items[0].name).toBe(PLAYLIST_1);
                expect(playlistMetadataCollection.items[1].name).toBe(PLAYLIST_2);
            })
    });


});