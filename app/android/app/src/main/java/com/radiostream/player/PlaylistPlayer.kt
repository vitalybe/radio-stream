package com.radiostream.player

import com.facebook.react.bridge.WritableMap
import com.radiostream.wrapper.ArgumentsInterface
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.ui.PlayerNotification
import kotlinx.coroutines.experimental.*

import javax.inject.Inject

import timber.log.Timber

class PlaylistPlayer @Inject
constructor(private var mPlaylist: Playlist?, private val mMetadataBackendGetter: MetadataBackendGetter, private val mStatusProvider: StatusProvider,
            private val mArguments: ArgumentsInterface) : Song.EventsListener, PlaylistControls {

    var currentSong: Song? = null
        private set(value) {
            field = value
        }

    var isLoading = false
        private set(value) {
            field = value
        }

    private var mLastLoadingErrorMessage: String = ""

    private var mIsClosed = false

    val isPlaying: Boolean
        get() = if (currentSong == null) {
            false
        } else {
            currentSong!!.isPlaying
        }

    private fun setSongLoadingStatus(isLoading: Boolean, errorMessage: String = "") {
        Timber.i("change loading to: %b and error to: %s", isLoading, errorMessage)
        if (isLoading != this.isLoading || mLastLoadingErrorMessage !== errorMessage) {
            Timber.i("value changed")
            this.isLoading = isLoading
            mLastLoadingErrorMessage = errorMessage
            mStatusProvider.sendStatus()
        } else {
            Timber.i("value didn't change")
        }
    }

    override suspend fun play() {
        Timber.i("function start")
        if (isLoading) {
            Timber.i("invalid request. song already loading")
            throw IllegalStateException("invalid request. song already loading")
        }

        if (currentSong != null && mPlaylist!!.isCurrentSong(currentSong!!)) {
            Timber.i("playing paused song")
            currentSong!!.subscribeToEvents(this@PlaylistPlayer)
            currentSong!!.play()

            mStatusProvider.sendStatus()
        } else {
            Timber.i("loading different song from playlist")
            retryPreloadAndPlaySong()
            preloadPeekedSong()
        }
    }

    override fun pause() {
        Timber.i("function start")

        if (isLoading || currentSong == null) {
            throw IllegalStateException("no song was loaded yet")
        }

        currentSong!!.pause()
        mStatusProvider.sendStatus()
    }

    override suspend fun playNext() {
        Timber.i("function start")
        this.mPlaylist!!.nextSong()
        this.play()
    }

    override suspend fun skipToSongByIndex(index: Int) {
        Timber.i("function start")

        this.mPlaylist!!.skipToIndex(index)
        this.play()
    }

    private suspend fun retryPreloadAndPlaySong() {
        Timber.i("function start")

        try {
            setSongLoadingStatus(true, mLastLoadingErrorMessage)
            if (currentSong != null) {
                currentSong!!.pause()
                currentSong!!.close()

                currentSong = null
            }

            mStatusProvider.sendStatus()

            waitForCurrentSongMarkedAsPlayed()
            val peekedSong = mPlaylist!!.peekCurrentSong()
            Timber.i("peeked song: $peekedSong")
            Timber.i("preloading song: %s", peekedSong.toString())

            mStatusProvider.sendStatus()
            peekedSong.preload()
            setSongLoadingStatus(false)

            // We won't be playing any new music if playlistPlayer is closed
            if (!mIsClosed) {
                Timber.i("changing current song to: %s", peekedSong.toString())
                currentSong = peekedSong
                mStatusProvider.sendStatus()
                play()
            } else {
                Timber.i("playlist player was already closed - not playing loaded song")
            }

            Timber.i("song preloaded successfully")
        } catch (e: Exception) {
            Timber.e(e, "exception occurred during next song loading")
            setSongLoadingStatus(true, "Failed. Retrying...")

            Timber.i("no song was loaded - waiting and retrying")
            delay(5000)
            Timber.i("timeout finished - retrying")
            retryPreloadAndPlaySong()
        }
    }

    private suspend fun waitForCurrentSongMarkedAsPlayed() {
        Timber.i("function start")
        if (currentSong != null) {
            currentSong!!.waitForMarkedAsPlayed()
        } else {
            Timber.i("no current song found - not waiting")
        }
    }

    private suspend fun preloadPeekedSong() {
        Timber.i("function start")

        try {
            val peekedSong = mPlaylist!!.peekNextSong()
            Timber.i("preloading peeked song: %s", peekedSong.toString())
            peekedSong.preload()
        } catch (e: Exception) {
            Timber.w("failed to preload song: %s", e.toString())
        }
    }

    fun close() {
        Timber.i("function start")
        mIsClosed = true

        if (currentSong != null) {
            Timber.i("closing current song")
            currentSong!!.close()
        }

        if (mPlaylist != null) {
            mPlaylist!!.close()
            mPlaylist = null
        }
    }

    override suspend fun onSongFinish(song: Song) {
        Timber.i("function start")
        this.playNext()
    }

    override fun onSongMarkedAsPlayed() {
        mStatusProvider.sendStatus()
    }

    override suspend fun onSongError(error: Exception) {
        Timber.e(error, "error occurred in song '%s'", currentSong)
        if (currentSong != null) {
            Timber.i("pausing existing song")
            currentSong!!.pause()
        }

        Timber.i("trying to play next song")
        playNext()
    }

    fun toBridgeObject(): WritableMap {
        val map = mArguments.createMap()
        map.putBoolean("isLoading", isLoading)
        map.putBoolean("isPlaying", isPlaying)
        map.putMap("playlist", if (mPlaylist != null) mPlaylist!!.toBridgeObject() else null)
        map.putString("loadingError", mLastLoadingErrorMessage)

        return map
    }

    suspend fun updateSongRating(songId: Int, newRating: Int) {
        Timber.i("function start")
        val updatedSong = currentSong
        if (updatedSong!!.id == songId) {
            mMetadataBackendGetter.get().updateSongRating(songId, newRating)
            updatedSong.setRating(newRating)
            Timber.i("song rating updated - sending status update")
            mStatusProvider.sendStatus()
        } else {
            Timber.w("tried to update id %d even though current song %s has id %d",
                    songId, updatedSong.toString(), updatedSong.id)
        }
    }
}
