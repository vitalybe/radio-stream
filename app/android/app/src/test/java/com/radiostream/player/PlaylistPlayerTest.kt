package com.radiostream.player

import com.nhaarman.mockito_kotlin.mock
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

//        `when`(mockPlaylist!!.isCurrentSong(mockFirstSong!!)).thenReturn(true)

//        val dummyPlaylistBridge = Arguments.createMap()
//        dummyFirstSongBridge.putString("name", "x")
//        `when`(mockPlaylist!!.toBridgeObject()).thenReturn(dummyPlaylistBridge)
    }

    suspend fun returnMockSongData(song: Song) {

        val dummyFirstSongBridge = ArgumentsWrapperTest().createMap()
        dummyFirstSongBridge.putString("title", "mockFirstSong")
        whenever(song.toBridgeObject()).thenReturn(dummyFirstSongBridge)

    }

    @Test
    @Throws(Exception::class)
    fun play_playSongIfSongAvailable() = runBlocking {

        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val mockStatusProvider = mock<StatusProvider>()

        val mockFirstSong = mock<Song>()
        returnMockSongData(mockFirstSong)
        val mockSecondSong = mock<Song>()
        returnMockSongData(mockSecondSong)

        val mockPlaylist = mock<Playlist>()
        val mockPlaylistFactory = mock<PlaylistFactory>()
        val mockPlayerNotifcation = mock<PlayerNotification>()

        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation, ArgumentsWrapperTest())
        playlistPlayer.play()

        verify<Playlist>(mockPlaylist, atLeastOnce()).peekCurrentSong()
        verify<Song>(mockFirstSong, atLeastOnce()).play()

        playlistPlayer.play()
        verify<Song>(mockFirstSong, Mockito.times(1)).preload()
    }

//    @Test
//    @Throws(Exception::class)
//    fun playNext_playingSecondSong() {
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.playNext()
//
//        verify<Playlist>(mockPlaylist, times(1)).nextSong()
//        verify<Song>(mockFirstSong, times(1)).play()
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun playNext_playFirstSong() {
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.playNext()
//
//        verify<Song>(mockFirstSong, times(1)).play()
//    }
//
//    @Test(expected = IllegalStateException::class)
//    @Throws(Exception::class)
//    fun pause_throwsExceptionIfNoSong() {
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.pause()
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun close_closesPlaylist() {
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.close()
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun close_closesSongIfExists() {
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.play()
//        playlistPlayer.close()
//
//        verify<Song>(mockFirstSong, times(1)).close()
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun playNext_retriesOnFailure() {
//        `when`<Any>(mockFirstSong!!.preload())
//                .thenReturn(Utils.rejectedPromise<Song>(Exception()))
//                .thenReturn(Utils.resolvedPromise<Song>(mockFirstSong))
//
//        `when`(mockSetTimeout.run(anyInt())).thenReturn(resolvedPromise<Void>(null as Void?))
//
//        val playlistPlayer = PlaylistPlayer(mockPlaylist, mockSetTimeout, mockMetadataBackendGetter, mockStatusProvider, mockPlayerNotifcation)
//        playlistPlayer.play()
//
//        // song will be loaded if preloading the first one failed
//        verify<Song>(mockFirstSong, times(1)).play()
//    }
}