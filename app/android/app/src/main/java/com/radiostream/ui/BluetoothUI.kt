package com.radiostream.ui

import android.content.Intent
import android.media.MediaMetadata
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.view.KeyEvent
import com.radiostream.javascript.bridge.PlayerEventsEmitter
import com.radiostream.player.Player

import com.radiostream.player.PlayerService
import com.radiostream.player.Song
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.async

import javax.inject.Inject

import timber.log.Timber

class BluetoothUI @Inject
constructor(playerEventsEmitter: PlayerEventsEmitter, private val mPlayerService: PlayerService) {

    private val mNotificationId = 1
    internal var mMediaSession: MediaSession? = null

    private val mMediaSessionCallback = object : MediaSession.Callback() {
        override fun onMediaButtonEvent(mediaButtonIntent: Intent): Boolean {
            Timber.i("function start")

            val ke = mediaButtonIntent.getParcelableExtra<KeyEvent>(Intent.EXTRA_KEY_EVENT)
            if (ke != null && ke.action == KeyEvent.ACTION_DOWN) {
                when (ke.keyCode) {
                    KeyEvent.KEYCODE_MEDIA_PLAY -> {
                        Timber.i("play media button")
                        async(CommonPool) {
                            try {
                                mPlayerService.play()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                        Timber.i("pause media button")
                        async(CommonPool) {
                            try {
                                mPlayerService.pause()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                        Timber.i("play/pause media button")
                        async(CommonPool) {
                            try {
                                mPlayerService.playPause()
                            } catch (e: Exception) {
                                Timber.e(e, "Error: ${e}")
                            }
                        }
                        return true
                    }
                }
            }

            return false
        }
    }

    init {
        Timber.i("function start")
        playerEventsEmitter.subscribePlayerChanges { player -> onPlayerChanged(player) }
    }

    fun create() {
        mMediaSession = MediaSession(mPlayerService, "PlayerService")
        mMediaSession!!.setCallback(mMediaSessionCallback)
        mMediaSession!!.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS or MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS)
    }

    fun destroy() {
        mMediaSession!!.release()
    }

    private fun onPlayerChanged(player: Player) {
        Timber.i("function start")
        val isLoading = player.isLoading
        if(isLoading) {
            Timber.i("song loading")
            updateDisplayText("Loading...")
        } else if(player.currentSong != null) {
            Timber.i("updating song information")
            updateDisplaySong(player.currentSong!!, player.isPlaying)
        } else {
            Timber.i("no playlist")
            updateDisplayText("No playlist")
        }
    }

    private fun updateDisplaySong(song: Song, isPlaying: Boolean) {
        updateMediaSesssion(isPlaying, song.title, song.artist, song.album)

    }

    private fun updateDisplayText(text: String) {
        updateMediaSesssion(true, text, text, text)
    }

    private fun updateMediaSesssion(isPlaying: Boolean, title: String, artist: String, album: String) {
        Timber.i("updating media session")
        mMediaSession!!.isActive = true
        val actions = PlaybackState.ACTION_PLAY_PAUSE or PlaybackState.ACTION_PLAY or PlaybackState.ACTION_PAUSE
        val playingState = if (isPlaying) PlaybackState.STATE_PLAYING else PlaybackState.STATE_PAUSED
        val state = PlaybackState.Builder().setActions(actions).setState(playingState, 0, 1f).build()
        mMediaSession!!.setPlaybackState(state)

        val metadata = MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
                .putString(MediaMetadata.METADATA_KEY_ALBUM, album)
                .build();

        mMediaSession!!.setMetadata(metadata);
        Timber.i("setting media metadata")
    }

}
