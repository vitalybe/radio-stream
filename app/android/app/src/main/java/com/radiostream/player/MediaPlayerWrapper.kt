package com.radiostream.player

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri

import javax.inject.Inject

/**
 * Created by vitaly on 17/11/2016.
 */

class MediaPlayerWrapper(val mMediaPlayer: MediaPlayer) : MediaPlayerInterface {
    override fun setWakeMode(context: Context, mode: Int) {
        mMediaPlayer.setWakeMode(context, mode)
    }

    override fun setAudioStreamType(type: Int) {
        mMediaPlayer.setAudioStreamType(type)
    }

    override val currentPosition: Int
        get() = mMediaPlayer.currentPosition

    override fun setDataSource(mContext: Context, uri: Uri?) {
        mMediaPlayer.setDataSource(mContext, uri)
    }

    override fun prepareAsync() {
        mMediaPlayer.prepareAsync()
    }

    override fun release() {
        mMediaPlayer.release()
    }

    override fun reset() {
        mMediaPlayer.reset()
    }

    override fun pause() {
        mMediaPlayer.pause()
    }

    override fun start() {
        mMediaPlayer.start()
    }

    override var isPlaying: Boolean = false
        get() = mMediaPlayer.isPlaying

    override fun setOnPreparedListener(function: MediaPlayer.OnPreparedListener) {
        mMediaPlayer.setOnPreparedListener(function)
    }

    override fun setOnErrorListener(function: MediaPlayer.OnErrorListener) {
        mMediaPlayer.setOnErrorListener(function)
    }

    override fun setOnCompletionListener(function: MediaPlayer.OnCompletionListener) {
        mMediaPlayer.setOnCompletionListener(function)
    }
}
