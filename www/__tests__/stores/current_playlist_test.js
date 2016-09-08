import { CurrentPlaylist } from '../../app/stores/current_playlist.js'
import * as backendMetadataApi from '../../app/utils/backend_metadata_api'
import { generateMockSong } from '../../__tests_shared__/mock_data'

jest.mock('../../app/utils/backend_metadata_api.js');

const TITLE_1 = "T1";
const ARTIST_1 = "A1";
const ALBUM_1 = "M1";

const TITLE_2 = "T2";
const ARTIST_2 = "A2";
const ALBUM_2 = "M2";

describe('CurrentPlaylist', () => {

    beforeEach(() => {
        backendMetadataApi.playlistSongs.mockClear();

        backendMetadataApi.playlistSongs.mockReturnValue(new Promise(resolve => {
            let songs = [generateMockSong(ARTIST_1, ALBUM_1, TITLE_1), generateMockSong(ARTIST_2, ALBUM_2, TITLE_2)];
            resolve(songs);
        }));
    });

    it('next songs returns and reloads correctly', () => {
        let playlist = new CurrentPlaylist();

        return playlist.nextSong()
            .then(song => {
                expect(backendMetadataApi.playlistSongs.mock.calls.length).toBe(1);

                return expect(song.title).toBe(TITLE_1);
            })
            .then(() => {
                return playlist.nextSong()
            })
            .then(song => {
                return expect(song.title).toBe(TITLE_2);
            })
            .then(() => {
                return playlist.nextSong()
            })
            .then(song => {
                expect(backendMetadataApi.playlistSongs.mock.calls.length).toBe(2);

                return expect(song.title).toBe(TITLE_1);
            });
    });

    it('peek song returns the current song', () => {
        let playlist = new CurrentPlaylist();

        return playlist.peekNextSong()
            .then(song => {
                expect(backendMetadataApi.playlistSongs.mock.calls.length).toBe(1);

                return expect(song.title).toBe(TITLE_1);
            })
            .then(() => {
                return playlist.peekNextSong()
            })
            .then(song => {
                return expect(song.title).toBe(TITLE_1);
            })
            .then(() => {
                expect(backendMetadataApi.playlistSongs.mock.calls.length).toBe(1);
            });
    });

});