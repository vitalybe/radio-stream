package com.radiostream.networking.metadata

import com.radiostream.R
import com.radiostream.networking.models.SongResult
import hugo.weaving.DebugLog
import timber.log.Timber
import java.util.*
import kotlin.coroutines.experimental.suspendCoroutine

@DebugLog
internal class MetadataBackendMock : MetadataBackend {

    private var lastId = 0

    private fun createMockSong(title: String, artist: String, album: String, rating: Int?): SongResult {
        val songResult = SongResult()
        songResult.id = this.lastId++
        songResult.title = title
        songResult.artist = artist
        songResult.album = album
        songResult.rating = rating!!
        songResult.path = "android.resource://com.radiostream/" + R.raw.mock

        return songResult
    }

    override suspend fun fetchPlaylist(playlistName: String): List<SongResult> {

        val songResults = ArrayList(Arrays.asList(
                this.createMockSong("title", "artist", "album", 80),
                this.createMockSong("title", "artist", "album", 80)))

        return songResults
    }

    override suspend fun markAsPlayed(songId: Int?): Unit {
        Timber.i("function start for song id: %d", songId)
    }

    override suspend fun updateSongRating(songId: Int, newRating: Int): Unit {
        Timber.i("updateSongRating for song %d with new rating: %d", songId, newRating)
    }
}
