export function formatSong(song) {
    if(song) {
        return `|${song.artist} - ${song.title}|`;
    } else {
        return "NULL-SONG";
    }
}