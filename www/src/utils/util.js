export function formatSong(song) {
    if(song) {
        return `|${song.artist} - ${song.name}|`;
    } else {
        return "NULL-SONG";
    }
}