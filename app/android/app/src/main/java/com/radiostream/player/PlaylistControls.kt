package com.radiostream.player

interface PlaylistControls {
    suspend fun play()

    fun pause()

    suspend fun playNext()

    suspend fun skipToSongByIndex(index: Int)
}
