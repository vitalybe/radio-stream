package com.radiostream.player;

import android.accounts.NetworkErrorException;
import android.content.Context;
import android.media.MediaPlayer;

import com.radiostream.BuildConfig;
import com.radiostream.Settings;
import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.DoneCallback;
import org.jdeferred.FailCallback;
import org.jdeferred.Promise;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.internal.util.MockUtil;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.Answer;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class)
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

    final String settingsUrl = "http://wwww.fake-url.com/";

    @Before
    public void setUp() throws Exception {
        when(mockSettings.getAddress()).thenReturn(settingsUrl);

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnPreparedListener = invocation.getArgument(0);
                return null;
            }
        }).when(mockMediaPlayer).setOnPreparedListener(ArgumentMatchers.<MediaPlayer.OnPreparedListener>any());

        Mockito.doAnswer(new Answer() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                dummyOnErrorListener = invocation.getArgument(0);
                return null;
            }
        }).when(mockMediaPlayer).setOnErrorListener(ArgumentMatchers.<MediaPlayer.OnErrorListener>any());
    }

    @Test
    public void preload_preloadResolvesOnFinish() throws Exception {
        String songPath = "artist/song.mp3";

        SongResult songResult = new SongResult();
        songResult.path = songPath;

        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings);

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
        SongResult songResult = new SongResult();
        songResult.artist = "artist";
        songResult.title = "title";
        songResult.path = "artist/song.mp3";

        final Song song = new Song(songResult, mockMediaPlayer, mockContext, mockSettings);

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
}
