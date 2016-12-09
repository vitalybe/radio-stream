package com.radiostream.player;

import android.accounts.NetworkErrorException;
import android.content.Context;
import android.media.MediaPlayer;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.radiostream.BuildConfig;
import com.radiostream.Settings;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;
import com.radiostream.util.SetTimeout;

import org.jdeferred.DoneCallback;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.internal.util.MockUtil;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.Answer;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(PowerMockRunner.class)
@PrepareForTest({Arguments.class, android.util.Log.class})
public class SongTest {

    private final String mPlaylistName = "X";

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();

    @Mock
    MediaPlayer mockMediaPlayer;
    MediaPlayer.OnPreparedListener dummyOnPreparedListener = null;
    MediaPlayer.OnErrorListener dummyOnErrorListener = null;

    @Mock
    Context mockContext;

    @Mock
    Settings mockSettings;

    @Mock
    SetTimeout mockSetTimeout;

    @Mock
    MetadataBackend mockMetadataBackend;

    final String settingsUrl = "http://wwww.fake-url.com/";

    @Before
    public void setUp() throws Exception {
        Utils.initTestLogging();
        Utils.mockAndroidStatics();

        final int[] dummyPosition = {0};
        when(mockMediaPlayer.getCurrentPosition()).thenAnswer(new Answer<Integer>() {
            @Override
            public Integer answer(InvocationOnMock invocation) throws Throwable {
                dummyPosition[0] += 5000;
                return dummyPosition[0];
            }
        });
        when(mockMetadataBackend.markAsPlayed()).thenReturn(resolvedPromise((Void)null));

        when(mockSettings.getAddress()).thenReturn(settingsUrl);
        when(mockSetTimeout.run(Matchers.anyInt())).thenReturn(resolvedPromise((Void)null));

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnPreparedListener = (MediaPlayer.OnPreparedListener) invocation.getArguments()[0];
                return null;
            }
        }).when(mockMediaPlayer).setOnPreparedListener(Matchers.<MediaPlayer.OnPreparedListener>any());

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnErrorListener = (MediaPlayer.OnErrorListener) invocation.getArguments()[0];
                return null;
            }
        }).when(mockMediaPlayer).setOnErrorListener(Matchers.<MediaPlayer.OnErrorListener>any());
    }

    @Test
    public void preload_loadsAndResolvesPreloadedSong() throws Exception {
        String songPath = "artist/song.mp3";

        SongResult songResult = new SongResult();
        songResult.path = songPath;

        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackend);

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnPreparedListener.onPrepared(mockMediaPlayer);
                return null;
            }
        }).when(mockMediaPlayer).prepareAsync();

        final Song[] doneResult = {null};
        song.preload().then(new DoneCallback<Song>() {
            @Override
            public void onDone(Song result) {
                doneResult[0] = result;
            }
        });

        verify(mockMediaPlayer).setDataSource(settingsUrl + "music/" + songPath);
        assertEquals(doneResult[0], song);
    }

    @Test
    public void preload_throwsExceptionOnMediaPlayerError() throws Exception {
        final Song song = new Song(createDummySongResult(), mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackend);

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnErrorListener.onError(mockMediaPlayer, 0, 0);
                return null;
            }
        }).when(mockMediaPlayer).prepareAsync();

        final Exception[] failException = {null};
        song.preload().fail(new FailCallback<Exception>() {
            @Override
            public void onFail(Exception result) {
                failException[0] = result;
            }
        });

        assertTrue(failException[0] instanceof NetworkErrorException);
    }

    @NonNull
    private SongResult createDummySongResult() {
        SongResult songResult = new SongResult();
        songResult.artist = "artist";
        songResult.title = "title";
        songResult.path = "artist/song.mp3";
        return songResult;
    }

    @Test
    public void preload_doNotRunAgainIfPreloadedBefore() throws Exception {
        String songPath = "artist/song.mp3";
        SongResult songResult = new SongResult();
        songResult.path = songPath;
        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackend);
        song.preload();
        song.preload();
        verify(mockMediaPlayer, times(1)).prepareAsync();
    }

    @Test
    public void preload_runAgainIfPreloadedFailed() throws Exception {
        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnErrorListener.onError(mockMediaPlayer, 0, 0);
                return null;
            }
        }).when(mockMediaPlayer).prepareAsync();

        String songPath = "artist/song.mp3";
        SongResult songResult = new SongResult();
        songResult.path = songPath;
        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackend);
        song.preload();
        song.preload();

        verify(mockMediaPlayer, times(2)).prepareAsync();
    }


    @Test
    public void ctor_encodesPathUrl() throws Exception {
        String songPath = "art ist/so ng.mp3";
        SongResult songResult = new SongResult();
        songResult.path = songPath;

        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings, mockSetTimeout, mockMetadataBackend);
        song.preload();

        verify(mockMediaPlayer).setDataSource(settingsUrl + "music/art%20ist/so%20ng.mp3");
    }

    @Test
    public void retriesAndMarksAsPlayed_retriesAndMarks() throws Exception {
        final Song song = new Song(createDummySongResult(), mockMediaPlayer, mockContext, mockSettings,
            mockSetTimeout, mockMetadataBackend);

        verify(mockMetadataBackend, times(1)).markAsPlayed();
   }

}