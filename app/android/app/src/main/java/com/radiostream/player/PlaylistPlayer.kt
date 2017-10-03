package com.radiostream.player

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.radiostream.javascript.bridge.ArgumentsInterface
import com.radiostream.javascript.bridge.ArgumentsWrapper
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.ui.PlayerNotification
import kotlinx.coroutines.experimental.*

import javax.inject.Inject

import timber.log.Timber

class PlaylistPlayer @Inject
constructor(private var mPlaylist: Playlist?, private val mMetadataBackendGetter: MetadataBackendGetter, private val mStatusProvider: StatusProvider,
            private val mPlayerNotification: PlayerNotification, private val mArguments: ArgumentsInterface) : Song.EventsListener, PlaylistControls {

    private var currentSong: Song? = null
    private var mIsLoading = false
    private var mLastLoadingError: Exception? = null

    private var mIsClosed = false

    val isPlaying: Boolean
        get() = if (currentSong == null) {
            false
        } else {
            currentSong!!.isPlaying
        }

    private fun setSongLoadingStatus(isLoading: Boolean, error: Exception?) {
        Timber.i("change loading to: %b and error to: %s", isLoading, error?.toString() ?: "NULL")
        if (isLoading != mIsLoading || mLastLoadingError !== error) {
            Timber.i("value changed")
            mIsLoading = isLoading
            mLastLoadingError = error
            mStatusProvider.sendStatus()
        } else {
            Timber.i("value didn't change")
        }
    }

    override suspend fun play() {
        Timber.i("function start")
        if (mIsLoading) {
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

        if (mIsLoading || currentSong == null) {
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
            setSongLoadingStatus(true, mLastLoadingError)
            if (currentSong != null) {
                currentSong!!.pause()
                currentSong!!.close()
            }

            mPlayerNotification.showLoadingNotification()
            mStatusProvider.sendStatus()

            waitForCurrentSongMarkedAsPlayed()
            val peekedSong = mPlaylist!!.peekCurrentSong()
            Timber.i("preloading song: %s", peekedSong.toString())
            peekedSong.preload()
            setSongLoadingStatus(false, null)
            mPlayerNotification.showSongNotification(peekedSong)

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
            Timber.e(e, "exception occured during next song loading")
            setSongLoadingStatus(true, e)

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
        Timber.e(error, "error occured in song '%s'", currentSong)
        if (currentSong != null) {
            Timber.i("pausing existing song")
            currentSong!!.pause()
        }

        Timber.i("trying to play next song")
        playNext()
    }

    fun toBridgeObject(): WritableMap {
        val map = mArguments.createMap()
        map.putBoolean("isLoading", mIsLoading)
        map.putBoolean("isPlaying", isPlaying)
        map.putMap("playlist", if (mPlaylist != null) mPlaylist!!.toBridgeObject() else null)
        map.putString("loadingError", if (mLastLoadingError != null) mLastLoadingError!!.message else "")

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
