package com.radiostream.player

import org.jdeferred.Promise

import kotlinx.coroutines.experimental.Job

/**
 * Created by vitaly on 18/11/2016.
 */
interface PlaylistControls {
    suspend fun play()

    fun pause()

    suspend fun playNext()

    suspend fun skipToSongByIndex(index: Int)
}
