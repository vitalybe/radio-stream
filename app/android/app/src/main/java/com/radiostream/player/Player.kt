package com.radiostream.player

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.radiostream.javascript.bridge.PlayerEventsEmitter

import javax.inject.Inject

import timber.log.Timber

class Player @Inject
constructor(private val mPlaylistPlayerFactory: PlaylistPlayerFactory, private val mPlayerEventsEmitter: PlayerEventsEmitter) : PlaylistControls {

    private var mCurrentPlaylistPlayer: PlaylistPlayer? = null

    val isPlaying: Boolean
        get() {
            Timber.i("function start")

            if (mCurrentPlaylistPlayer != null) {
                Timber.i("returning value based on current song, if any")
                return mCurrentPlaylistPlayer!!.isPlaying
            } else {
                Timber.i("no playlist selected - not playing")
                return false
            }
        }

    fun changePlaylist(playlistName: String) {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer!!.close()
        }

        mCurrentPlaylistPlayer = mPlaylistPlayerFactory.build(playlistName) { mPlayerEventsEmitter.sendPlayerStatus(this) }
    }

    var currentSong: Song? = null
        get() = mCurrentPlaylistPlayer?.currentSong

    var isLoading: Boolean = true
        get() = if (mCurrentPlaylistPlayer == null) true else mCurrentPlaylistPlayer!!.isLoading

    override suspend fun play() {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer == null) {
            throw IllegalStateException("playlist must be set")
        }

        return mCurrentPlaylistPlayer!!.play()
    }

    override fun pause() {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer == null) {
            throw IllegalStateException("playlist must be set")
        }

        mCurrentPlaylistPlayer!!.pause()
    }

    override suspend fun playNext() {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer == null) {
            throw IllegalStateException("playlist must be set")
        }

        mCurrentPlaylistPlayer!!.playNext()
    }

    override suspend fun skipToSongByIndex(index: Int) {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer == null) {
            throw IllegalStateException("playlist must be set")
        }

        mCurrentPlaylistPlayer!!.skipToSongByIndex(index)
    }

    fun close() {
        Timber.i("function start")

        if (mCurrentPlaylistPlayer != null) {
            mCurrentPlaylistPlayer!!.close()
        }
    }

    fun toBridgeObject(): WritableMap {
        val map = Arguments.createMap()
        map.putMap("playlistPlayer", if (mCurrentPlaylistPlayer != null) mCurrentPlaylistPlayer!!.toBridgeObject() else null)

        return map
    }

    suspend fun updateSongRating(songId: Int, newRating: Int) {
        Timber.i("function start")
        if (mCurrentPlaylistPlayer != null) {
            return mCurrentPlaylistPlayer!!.updateSongRating(songId, newRating)
        } else {
            Timber.w("playlist unavailable - song rating is unavailable")
        }
    }
}
