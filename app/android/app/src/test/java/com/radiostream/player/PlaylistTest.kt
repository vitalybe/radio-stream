package com.radiostream.player

import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.times
import com.nhaarman.mockito_kotlin.verify
import com.nhaarman.mockito_kotlin.whenever
import com.radiostream.networking.metadata.MetadataBackend
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.networking.models.SongResult
import kotlinx.coroutines.experimental.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers


class PlaylistTest {


    private val mPlaylistName = "X"

    @Before
    fun setUp() {
        Utils.initTestLogging()
    }

    fun createMockSongResult(title: String): SongResult {
        val mockSong = mock<SongResult>()
        mockSong.title = title

        return mockSong
    }

    private fun buildSongFromSongResult(mockSongFactory: SongFactory) {
        whenever(mockSongFactory.build(ArgumentMatchers.any<SongResult>())).thenAnswer { invocation ->
            val songResult = invocation.arguments[0] as SongResult

            val mockSong = mock<Song>()
            whenever(mockSong.title).thenReturn(songResult.title)

            mockSong
        }
    }

    @Test
    fun nextSong_movesToNextSong() = runBlocking {

        val mockSongFactory = mock<SongFactory>()
        buildSongFromSongResult(mockSongFactory)

        val mockLoadedSongs1_Song1 = createMockSongResult(title = "mockLoadedSongs1_Song1")
        val mockLoadedSongs1_Song2 = createMockSongResult(title = "mockLoadedSongs1_Song2")

        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val listOfSongs = listOf(mockLoadedSongs1_Song1, mockLoadedSongs1_Song2)
        whenever(mockMetadataBackendGetter.get()).thenReturn(mock<MetadataBackend>())
        whenever(mockMetadataBackendGetter.get().fetchPlaylist(playlistName = ArgumentMatchers.anyString())).thenReturn(listOfSongs)

        val playlist = Playlist(mPlaylistName, mockMetadataBackendGetter, mockSongFactory)
        val peekedSong = playlist.peekCurrentSong()
        assertEquals(peekedSong.title, mockLoadedSongs1_Song1.title)

        playlist.nextSong()
        val nextPeekedSong = playlist.peekCurrentSong()
        assertEquals(nextPeekedSong.title, mockLoadedSongs1_Song2.title)
    }

    @Test
    fun peekCurrentSong_reloadsPlaylistIfFinished() = runBlocking {
        val mockSongFactory = mock<SongFactory>()
        buildSongFromSongResult(mockSongFactory)

        val mockLoadedSongs1_Song1 = createMockSongResult(title = "mockLoadedSongs1_Song1")
        val mockLoadedSongs1_Song2 = createMockSongResult(title = "mockLoadedSongs1_Song2")
        val mockLoadedSongs2_Song1 = createMockSongResult(title = "mockLoadedSongs2_Song1")
        val mockLoadedSongs2_Song2 = createMockSongResult(title = "mockLoadedSongs2_Song2")

        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val listOfSongs1 = listOf(mockLoadedSongs1_Song1, mockLoadedSongs1_Song2)
        val listOfSongs2 = listOf(mockLoadedSongs2_Song1, mockLoadedSongs2_Song2)
        val mockMetadataBackend = mock<MetadataBackend>()
        whenever(mockMetadataBackendGetter.get()).thenReturn(mockMetadataBackend)
        whenever(mockMetadataBackend.fetchPlaylist(playlistName = ArgumentMatchers.anyString()))
                .thenReturn(listOfSongs1).thenReturn(listOfSongs2)

        val playlist = Playlist(mPlaylistName, mockMetadataBackendGetter, mockSongFactory)
        assertEquals(playlist.peekCurrentSong().title, mockLoadedSongs1_Song1.title)

        playlist.nextSong()
        playlist.nextSong()

        assertEquals(playlist.peekCurrentSong().title, mockLoadedSongs2_Song1.title)
        verify<MetadataBackend>(mockMetadataBackend, times(2)).fetchPlaylist(mPlaylistName)

        Unit
    }

    @Test
    fun isCurrentSong_returnsTrueIfCurrentFalseOtherwise() = runBlocking {
        val mockSongFactory = mock<SongFactory>()
        buildSongFromSongResult(mockSongFactory)

        val mockLoadedSongs1_Song1 = createMockSongResult(title = "mockLoadedSongs1_Song1")
        val mockLoadedSongs1_Song2 = createMockSongResult(title = "mockLoadedSongs1_Song2")

        val mockMetadataBackendGetter = mock<MetadataBackendGetter>()
        val listOfSongs = listOf(mockLoadedSongs1_Song1, mockLoadedSongs1_Song2)
        whenever(mockMetadataBackendGetter.get()).thenReturn(mock<MetadataBackend>())
        whenever(mockMetadataBackendGetter.get().fetchPlaylist(playlistName = ArgumentMatchers.anyString())).thenReturn(listOfSongs)

        val playlist = Playlist(mPlaylistName, mockMetadataBackendGetter, mockSongFactory)

        val peekedSong = playlist.peekCurrentSong()
        assertTrue(playlist.isCurrentSong(peekedSong))
        playlist.nextSong()
        assertFalse(playlist.isCurrentSong(peekedSong))
    }
}
