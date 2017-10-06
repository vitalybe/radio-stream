package com.radiostream.player

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import com.nhaarman.mockito_kotlin.*
import com.radiostream.Settings
import com.radiostream.networking.metadata.MetadataBackend
import com.radiostream.networking.metadata.MetadataBackendGetter
import com.radiostream.networking.models.SongResult
import kotlinx.coroutines.experimental.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers
import org.mockito.invocation.InvocationOnMock
import org.mockito.stubbing.Answer
import org.mockito.Mockito
import com.radiostream.wrapper.UriInterface


internal class SongTest {

    private val mPlaylistName = "X"
    val settingsUrl = "http://wwww.fake-url.com"

    @Before
    @Throws(Exception::class)
    fun setUp() {
        Utils.initTestLogging()
    }

    @Test
    @Throws(Exception::class)
    fun preload_loadsAndResolvesPreloadedSong() = runBlocking {
        var mockMediaPlayer = mock<MediaPlayerInterface>()
        var mockContext = mock<Context>()
        var mockSettings = mock<Settings>()
        var mockUri = mock<UriInterface>()

        var mockMetadataBackendGetter = mock<MetadataBackendGetter>()

        var mockMetadataBackend = mock<MetadataBackend>()
        whenever(mockMetadataBackendGetter.get()).thenReturn(mockMetadataBackend)

        var dummyOnPreparedListener: MediaPlayer.OnPreparedListener? = null
        var dummyOnErrorListener: MediaPlayer.OnErrorListener? = null

        val dummyPosition = intArrayOf(0)
        whenever(mockMediaPlayer.currentPosition).thenAnswer {
            dummyPosition[0] += 5000
            dummyPosition[0]
        }

        whenever(mockSettings.getAddress()).thenReturn(settingsUrl)

        whenever(mockMediaPlayer.setOnPreparedListener(any<MediaPlayer.OnPreparedListener>())).doAnswer {
            dummyOnPreparedListener = it.arguments[0] as MediaPlayer.OnPreparedListener
            null
        }

        whenever(mockMediaPlayer.setOnErrorListener(any<MediaPlayer.OnErrorListener>())).doAnswer {
            dummyOnErrorListener = it.arguments[0] as MediaPlayer.OnErrorListener
            null
        }


        whenever(mockMediaPlayer.prepareAsync()).doAnswer {
            dummyOnPreparedListener!!.onPrepared(null)
        }

        val songPath = "artist/song.mp3"
        val songResult = SongResult()
        songResult.path = songPath
        songResult.album = "album"
        songResult.title = "title"
        songResult.artist = "artist"

        val song = Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockMetadataBackendGetter, mockUri)
        song.preload()
        verify(mockUri).parse(settingsUrl + "/music/" + songPath)

        Unit
    }

//    @Test
//    @Throws(Exception::class)
//    fun preload_throwsExceptionOnMediaPlayerError() {
//        val song = Song(createDummySongResult(), mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackendGetter)
//
//        Mockito.doAnswer(object : Answer() {
//            @Throws(Throwable::class)
//            fun answer(invocation: InvocationOnMock): Any? {
//                dummyOnErrorListener!!.onError(mockMediaPlayer, 0, 0)
//                return null
//            }
//        }).whenever(mockMediaPlayer).prepareAsync()
//
//        val failException = arrayOf<Exception>(null)
//        song.preload()!!.fail(object : FailCallback<Exception>() {
//            fun onFail(result: Exception) {
//                failException[0] = result
//            }
//        })
//
//        assertTrue(failException[0] is NetworkErrorException)
//    }
//
//    @NonNull
//    private fun createDummySongResult(): SongResult {
//        val songResult = SongResult()
//        songResult.artist = "artist"
//        songResult.title = "title"
//        songResult.path = "artist/song.mp3"
//        return songResult
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun preload_doNotRunAgainIfPreloadedBefore() {
//        val songPath = "artist/song.mp3"
//        val songResult = SongResult()
//        songResult.path = songPath
//        val song = Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackendGetter)
//        song.preload()
//        song.preload()
//        verify(mockMediaPlayer, times(1)).prepareAsync()
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun preload_runAgainIfPreloadedFailed() {
//        Mockito.doAnswer(object : Answer() {
//            @Throws(Throwable::class)
//            fun answer(invocation: InvocationOnMock): Any? {
//                dummyOnErrorListener!!.onError(mockMediaPlayer, 0, 0)
//                return null
//            }
//        }).whenever(mockMediaPlayer).prepareAsync()
//
//        val songPath = "artist/song.mp3"
//        val songResult = SongResult()
//        songResult.path = songPath
//        val song = Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackendGetter)
//        song.preload()
//        song.preload()
//
//        verify(mockMediaPlayer, times(2)).prepareAsync()
//    }
//
//
//    @Test
//    @Throws(Exception::class)
//    fun ctor_encodesPathUrl() {
//        val songPath = "art ist/so ng.mp3"
//        val songResult = SongResult()
//        songResult.path = songPath
//
//        val song = Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackendGetter)
//        song.preload()
//
//        verify(mockMediaPlayer).setDataSource(settingsUrl + "/music/art%20ist/so%20ng.mp3")
//    }
//
//    @Test
//    @Throws(Exception::class)
//    fun retriesAndMarksAsPlayed_retriesAndMarks() {
//        val song = Song(createDummySongResult(), mockMediaPlayer, mockContext, mockSettings,
//                mockSetTimeout, mockMetadataBackendGetter)
//        song.play()
//
//        verify(mockMetadataBackendGetter, times(1)).get().markAsPlayed(ArgumentMatchers.anyInt())
//    }

}