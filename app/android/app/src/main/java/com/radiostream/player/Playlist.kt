package com.radiostream.player

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.radiostream.networking.metadata.MetadataBackendGetter
import timber.log.Timber
import java.util.*

class Playlist(private val mPlaylistName: String, private val mMetadataBackendGetter: MetadataBackendGetter, private val mSongFactory: SongFactory) {

    private val mSongs = ArrayList<Song>()
    private var mIndex = 0

    private suspend fun reloadIfNeededForSongIndex(index: Int) {
        Timber.i("checking if reload is needed. songs count: %d Current index: %d", mSongs.size, mIndex)
        if (index >= mSongs.size) {
            Timber.i("reloading songs")

            val result = mMetadataBackendGetter.get().fetchPlaylist(mPlaylistName)
            if (result.isEmpty()) {
                Timber.e("empty playlist was returned")
                throw Exception("Empty playlists")
            }

            result.mapTo(mSongs) { mSongFactory.build(it) }
        } else {
            Timber.i("no reload required")
        }
    }

    suspend fun peekCurrentSong(): Song {
        Timber.i("function start")

        return peekSong(mIndex)
    }

    suspend fun peekNextSong(): Song {
        Timber.i("function start")

        return peekSong(mIndex + 1)
    }

    fun isCurrentSong(song: Song): Boolean {
        if (mIndex < mSongs.size) {
            Timber.i("checking if given song '%s' is the current song", song.toString())
            return mSongs[mIndex] === song
        } else {
            Timber.i("current index %d out of songs bounds %d - this can't be the current song", mIndex, mSongs.size)
            // it can't be the current song - current index is already beyond the bounds of the playlist
            return false
        }
    }

    fun nextSong() {
        Timber.i("function start. From %d to %d", mIndex, mIndex + 1)
        mIndex++
    }

    private suspend fun peekSong(index: Int): Song {
        Timber.i("function start. index: %d", index)

        reloadIfNeededForSongIndex(index)
        try {
            val song = mSongs[index]
            Timber.i("peeked next song: %s", song.toString())
            return song
        } catch (e: Exception) {
            Timber.e(e, "peek failed")
            throw e
        }
    }

    fun toBridgeObject(): WritableMap {
        val map = Arguments.createMap()
        map.putString("name", this.mPlaylistName)
        map.putInt("currentIndex", this.mIndex)

        val songsArray = Arguments.createArray()
        for (song in this.mSongs) {
            songsArray.pushMap(song.toBridgeObject())
        }
        map.putArray("songs", songsArray)

        return map
    }

    fun close() {
        Timber.i("closing all songs")
        for (song in mSongs) {
            song.close()
        }
    }

    fun skipToIndex(index: Int) {
        if (index < 0 || index >= mSongs.size) {
            throw IndexOutOfBoundsException("requested index $index is out of bounds")
        }

        // this is done since reusing the song is impossible - we destroy the MediaPlayer object everytime the song changes
        mSongs[index] = mSongFactory.build(mSongs[index])
        mIndex = index
    }
}
