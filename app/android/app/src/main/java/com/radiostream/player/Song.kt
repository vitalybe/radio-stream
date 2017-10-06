package com.radiostream.player

import android.accounts.NetworkErrorException
import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.PowerManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.radiostream.Settings
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.networking.models.SongResult
import com.radiostream.wrapper.UriInterface
import kotlinx.coroutines.experimental.CommonPool
import kotlinx.coroutines.experimental.Deferred
import kotlinx.coroutines.experimental.async
import kotlinx.coroutines.experimental.delay
import timber.log.Timber
import java.io.IOException
import java.io.UnsupportedEncodingException
import java.net.URLEncoder
import java.util.*
import kotlin.coroutines.experimental.suspendCoroutine

class Song {

    val id: Int
    val artist: String
    val album: String
    val title: String
    private val mPath: String
    private val mLastPlayed: Double
    private val mPlayCount: Int
    private var mRating: Int = 0

    private var mContext: Context? = null
    private var mMetadataBackendGetter: MetadataBackendGetter? = null
    private var mSongLoadingJob: Deferred<Unit>? = null
    private var mMediaPlayer: MediaPlayerInterface? = null
    private var mSettings: Settings? = null
    private var mEventsListener: EventsListener? = null
    private lateinit var mUriWrapper: UriInterface

    private var mMarkAsPlayedScheduled = false
    private var markedAsPlayedDeferred: Deferred<Unit>? = null

    // if released
    val isPlaying: Boolean
        get() = if (mMediaPlayer != null) {
            mMediaPlayer!!.isPlaying
        } else {
            false
        }

    constructor(songResult: SongResult, mediaPlayer: MediaPlayerInterface,
                context: Context, settings: Settings, metadataBackend: MetadataBackendGetter, uriWrapper: UriInterface) {
        this.artist = songResult.artist
        this.album = songResult.album
        this.title = songResult.title
        this.id = songResult.id
        this.mRating = songResult.rating
        this.mLastPlayed = songResult.lastplayed
        this.mPlayCount = songResult.playcount

        // In various mock modes we will provide the full MP3 path
        if (!songResult.path.startsWith("android.resource")) {
            var pathBuilder = ""
            val pathParts = songResult.path.split("/".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
            for (pathPart in pathParts) {
                try {
                    pathBuilder += "/" + URLEncoder.encode(pathPart, "UTF-8").replace("+", "%20")
                } catch (e: UnsupportedEncodingException) {
                    Timber.e(e, "failed to encode path part: %s", pathPart)
                }

            }

            this.mPath = settings.address + "/music/" + pathBuilder.substring(1)
        } else {
            this.mPath = songResult.path
        }

        initializeSong(mediaPlayer, context, settings, metadataBackend, uriWrapper)
    }

    constructor(otherSong: Song, mediaPlayer: MediaPlayerInterface, context: Context, settings: Settings, metadataBackend: MetadataBackendGetter, uriWrapper: UriInterface) {
        this.artist = otherSong.artist
        this.album = otherSong.album
        this.title = otherSong.title
        this.id = otherSong.id
        this.mRating = otherSong.mRating
        this.mLastPlayed = otherSong.mLastPlayed
        this.mPlayCount = otherSong.mPlayCount
        this.mPath = otherSong.mPath

        initializeSong(mediaPlayer, context, settings, metadataBackend, uriWrapper)
    }

    private fun initializeSong(mediaPlayer: MediaPlayerInterface, context: Context, settings: Settings, metadataBackend: MetadataBackendGetter, uriWrapper: UriInterface) {
        this.mMetadataBackendGetter = metadataBackend
        this.mContext = context
        this.mMediaPlayer = mediaPlayer
        this.mSettings = settings
        this.mUriWrapper = uriWrapper

        // NOTE: Wake lock will only be relevant when a song is playing
        mMediaPlayer!!.setWakeMode(context, PowerManager.PARTIAL_WAKE_LOCK)
        mMediaPlayer!!.setAudioStreamType(AudioManager.STREAM_MUSIC)

        Timber.i("created new song: %s", this.toString())
    }

    private suspend fun scheduleMarkAsPlayed() {
        Timber.i("markedAsPlayedDeferred: %h", markedAsPlayedDeferred)
        if (mMediaPlayer == null) {
            Timber.i("media player is null - song is no longer active - further scheduling cancelled")
        } else if (this.markedAsPlayedDeferred != null) {
            Timber.i("mark as played already in progress")
        } else if (mMediaPlayer!!.currentPosition >= markPlayedAfterMs) {
            Timber.i("marking song as played since its current position %d is after %d",
                    mMediaPlayer!!.currentPosition, markPlayedAfterMs)

            this.markedAsPlayedDeferred = retryMarkAsPlayed()
            if (mEventsListener != null) {
                Timber.i("finished marking as played - notifying subscribers")
                mEventsListener!!.onSongMarkedAsPlayed()
            }
        } else {
            Timber.i("this is not the time to mark as played %dms, retrying again in %dms",
                    mMediaPlayer!!.currentPosition, markPlayedRetryMs)

            delay(markPlayedRetryMs)
            Timber.i("retrying...")
            scheduleMarkAsPlayed()
        }
    }

    suspend fun waitForMarkedAsPlayed() {
        Timber.i("function start")

        if (markedAsPlayedDeferred != null) {
            Timber.i("returning existing promise")
            markedAsPlayedDeferred!!.join()
        } else {
            Timber.i("mark as played hasn't started - not waiting")
        }
    }

    private fun retryMarkAsPlayed(): Deferred<Unit> = async(CommonPool) {
        Timber.i("function start")

        try {
            mMetadataBackendGetter!!.get().markAsPlayed(this@Song.id)
            Timber.i("marked as played successfully")
        } catch (e: Exception) {
            Timber.i(e, "failed to mark as read - retrying again after sleep")
            delay(markPlayedRetryMs)
            Timber.i("sleep done - trying to mark again")
            retryMarkAsPlayed()
        }

        return@async Unit
    }

    fun subscribeToEvents(eventsListener: EventsListener) {
        Timber.i("function start")
        mEventsListener = eventsListener
    }

    suspend fun preload() {
        Timber.i("function start")

        if (mSongLoadingJob == null || mSongLoadingJob!!.isCompletedExceptionally) {
            Timber.i("creating a new deferred")
            mSongLoadingJob = async(CommonPool) { mediaPlayerPrepare(mPath) }

        } else {
            Timber.i("preload for this song already started. awaiting the deferred to complete")
        }

        Timber.i("waiting for preload to complete...")
        mSongLoadingJob!!.await()
        Timber.i("preload complete")

    }

    suspend fun mediaPlayerPrepare(path: String): Unit = suspendCoroutine { cont ->
        mMediaPlayer!!.setOnPreparedListener(MediaPlayer.OnPreparedListener {
            Timber.i("setOnPreparedListener callback for song: %s", this@Song.toString())
            cont.resume(Unit)
        })

        mMediaPlayer!!.setOnErrorListener(MediaPlayer.OnErrorListener { _, what, extra ->
            Timber.w("setOnErrorListener callback for song: %s", this@Song.toString())

            val errorMessage = String.format(Locale.ENGLISH,
                    "MediaPlayer failed to preload song: %d/%d", what, extra)
            cont.resumeWithException(NetworkErrorException(errorMessage))

            true
        })

        Timber.i("loading song from url: %s", this.mPath)
        try {
            mMediaPlayer!!.setDataSource(this.mContext!!, mUriWrapper.parse(path))
            mMediaPlayer!!.prepareAsync()
        } catch (e: IOException) {
            cont.resumeWithException(NetworkErrorException("Failed to set data source", e))
        }
    }


    suspend fun play() {
        Timber.i("function start")

        if (!mMarkAsPlayedScheduled) {
            Timber.i("this is the first play - schedule song to be marked as played")
            mMarkAsPlayedScheduled = true

            async(CommonPool) {
                try {
                    scheduleMarkAsPlayed()
                } catch (e: Exception) {
                    Timber.e(e, "Marking as played failed: ${e}")
                }
            }
        }

        mMediaPlayer!!.setOnErrorListener(MediaPlayer.OnErrorListener { _, what, extra ->

            async(CommonPool) {
                try {
                    Timber.e("song error - %d, %d", what, extra)
                    val errorMessage = String.format(Locale.ENGLISH, "Exception during playblack: %d/%d", what, extra)
                    mEventsListener!!.onSongError(Exception(errorMessage))
                } catch (e: Exception) {
                    Timber.e(e, "Error: ${e}")
                }
            }

            true
        })

        mMediaPlayer!!.setOnCompletionListener (MediaPlayer.OnCompletionListener {
            async(CommonPool) {
                try {
                    mEventsListener!!.onSongFinish(this@Song)
                } catch (e: Exception) {
                    Timber.e(e, "Error: ${e}")
                }
            }
        })

        Timber.i("starting song...")
        mMediaPlayer!!.start()
    }

    fun pause() {
        if (mMediaPlayer!!.isPlaying) {
            mMediaPlayer!!.pause()
        }
    }

    fun close() {
        Timber.i("function start: %s", this.toString())
        if (mMediaPlayer != null) {
            pause()

            Timber.i("resetting and releasing the media player")
            mMediaPlayer!!.reset()
            mMediaPlayer!!.release()
            mMediaPlayer = null
        } else {
            Timber.i("already closed")
        }
    }

    fun toBridgeObject(): WritableMap {
        val map = Arguments.createMap()
        map.putInt("id", id)
        map.putString("artist", artist)
        map.putString("title", title)
        map.putString("album", album)
        map.putInt("rating", mRating)
        map.putDouble("lastplayed", mLastPlayed)
        map.putInt("playcount", mPlayCount)
        map.putBoolean("isMarkedAsPlayed", markedAsPlayedDeferred != null && markedAsPlayedDeferred!!.isCompleted && !markedAsPlayedDeferred!!.isCompletedExceptionally)

        return map
    }

    override fun toString(): String = String.format("[%s - %s]", artist, title)

    fun setRating(newRating: Int) {
        mRating = newRating
    }

    interface EventsListener {
        suspend fun onSongFinish(song: Song)

        fun onSongMarkedAsPlayed()

        suspend fun onSongError(error: Exception)
    }

    companion object {

        val markPlayedAfterMs = 30000
        val markPlayedRetryMs = 15000L
    }
}

