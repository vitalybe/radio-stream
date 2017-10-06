package com.radiostream.player

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import kotlinx.coroutines.experimental.Deferred

interface MediaPlayerInterface {
    var isPlaying: Boolean
    fun setWakeMode(context: Context, mode: Int)
    fun setAudioStreamType(type: Int)
    val currentPosition: Int
    fun setDataSource(mContext: Context, uri: Uri?)
    fun prepareAsync()
    fun release()
    fun reset()
    fun pause()
    fun start()

    fun setOnPreparedListener(function: MediaPlayer.OnPreparedListener)
    fun setOnErrorListener(function: MediaPlayer.OnErrorListener)
    fun setOnCompletionListener(function: MediaPlayer.OnCompletionListener)

}