import { Song } from '../../app/stores/song'
import { generateMockSong } from '../../__tests_shared__/mock_data'

jest.mock('../../app/utils/wrapped_sound_manager.js');

const TITLE = "T1";
const ARTIST = "A1";
const ALBUM = "M1";

describe('Song', () => {

    beforeEach(() => {
    });

    it('initialization', () => {
        console.log("song initialization");
        let song = new Song(generateMockSong(ARTIST, ALBUM, TITLE));
        expect(song.title).toBe(TITLE);
        expect(song.artist).toBe(ARTIST);
        expect(song.album).toBe(ALBUM)
    });
});