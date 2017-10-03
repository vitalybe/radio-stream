package com.radiostream.player

import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.times
import com.nhaarman.mockito_kotlin.whenever
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.ui.PlayerNotification
import kotlinx.coroutines.experimental.runBlocking
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito
import org.mockito.Mockito.atLeastOnce
import org.mockito.Mockito.verify


class PlaylistPlayerTest {

    @Before
    @Throws(Exception::class)
    fun setUp() {
        Utils.initTestLogging()
    }

    suspend fun returnMockSongData(song: Song) {

        val dummyFirstSongBridge = ArgumentsWrapperTest().createMap()
        dummyFirstSongBridge.putString("title", "mockFirstSong")
        whenever(song.toBridgeObject()).thenReturn(dummyFirstSongBridge)

    }

    @Test
    fun play_playSongIfSongAvailable() = runBlocking {

        val mockPlayerNotifcation = mock<PlayerNotification>()
        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()

        val mockFirstSong = mock<Song>()
        returnMockSongData(mockFirstSong)

        val mockPlaylist = mock<Playlist>()
        whenever(mockPlaylist.peekCurrentSong()).thenReturn(mockFirstSong)
        whenever(mockPlaylist.isCurrentSong(mockFirstSong)).thenReturn(true)

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.play()

        verify<Playlist>(mockPlaylist, atLeastOnce()).peekCurrentSong()
        verify<Song>(mockFirstSong, atLeastOnce()).play()

        playlistPlayer.play()
        verify<Song>(mockFirstSong, Mockito.times(1)).preload()
    }

    @Test
    fun playNext_playingNextSong() = runBlocking {
        val mockPlayerNotifcation = mock<PlayerNotification>()
        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()

        val mockFirstSong = mock<Song>()
        returnMockSongData(mockFirstSong)

        val mockPlaylist = mock<Playlist>()
        whenever(mockPlaylist.peekCurrentSong()).thenReturn(mockFirstSong)
        whenever(mockPlaylist.isCurrentSong(mockFirstSong)).thenReturn(true)

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.playNext()

        verify<Playlist>(mockPlaylist, times(1)).nextSong()
        verify<Song>(mockFirstSong, times(1)).play()
    }


    @Test(expected = IllegalStateException::class)
    fun pause_throwsExceptionIfNoSong() = runBlocking {
        val mockPlayerNotifcation = mock<PlayerNotification>()
        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()
        val mockPlaylist = mock<Playlist>()

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.pause()
    }

    @Test
    fun close_closesPlaylistAndSongIfExists() = runBlocking {
        val mockPlayerNotifcation = mock<PlayerNotification>()
        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()

        val mockFirstSong = mock<Song>()
        returnMockSongData(mockFirstSong)

        val mockPlaylist = mock<Playlist>()
        whenever(mockPlaylist.peekCurrentSong()).thenReturn(mockFirstSong)
        whenever(mockPlaylist.isCurrentSong(mockFirstSong)).thenReturn(true)

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.play()
        playlistPlayer.close()

        verify<Song>(mockFirstSong, times(1)).close()
    }

    @Test
    fun playNext_retriesOnFailure() = runBlocking {
        val mockPlayerNotifcation = mock<PlayerNotification>()
        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()

        val mockFirstSong = mock<Song>()
        returnMockSongData(mockFirstSong)
        whenever(mockFirstSong.preload()).thenThrow(RuntimeException()).thenReturn(Unit)

        val mockPlaylist = mock<Playlist>()
        whenever(mockPlaylist.peekCurrentSong()).thenReturn(mockFirstSong)
        whenever(mockPlaylist.isCurrentSong(mockFirstSong)).thenReturn(true)

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.play()

        // song will be loaded if preloading the first one failed
        verify<Song>(mockFirstSong, times(1)).play()
    }
}