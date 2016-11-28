 package com.radiostream.player;

import android.media.MediaPlayer;

import com.radiostream.BuildConfig;
import com.radiostream.javascript.bridge.PlayerEventsEmitter;
import com.radiostream.javascript.bridge.PlaylistPlayerBridge;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLog;

import java.util.List;

import static com.radiostream.player.Utils.resolvedPromise;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class)
public class PlaylistPlayerTest {

    @Mock
    Song mockFirstSong;

    @Mock
    Song mockSecondSong;

    @Mock
    Playlist mockPlaylist;

    @Mock
    PlaylistFactory mockPlaylistFactory;

    @Mock
    PlayerEventsEmitter mockPlayerEventsEmitter;

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();

    @BeforeClass
    public static void setUpClass() throws Exception {
        ShadowLog.stream = System.out;
    }

    @Before
    public void setUp() throws Exception {
        when(mockFirstSong.preload()).thenReturn(resolvedPromise(mockFirstSong));
        when(mockSecondSong.preload()).thenReturn(resolvedPromise(mockSecondSong));

        when(mockPlaylist.nextSong())
            .thenReturn(resolvedPromise(mockFirstSong))
            .thenReturn(resolvedPromise(mockSecondSong));

        when(mockPlaylist.peekNextSong())
            .thenReturn(resolvedPromise(mockSecondSong));
    }

    @Test
    public void play_playsNextSongIfNotSongAvailable() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.play();

        verify(mockFirstSong, times(1)).play();

        ArgumentCaptor<PlaylistPlayerBridge> captor = ArgumentCaptor.forClass(PlaylistPlayerBridge.class);
        verify(mockPlayerEventsEmitter, times(3)).sendPlayerStatus(captor.capture());

        final List<PlaylistPlayerBridge> bridges = captor.getAllValues();

        assertEquals(bridges.get(0).getIsLoading(), true);

        assertEquals(bridges.get(2).getIsLoading(), false);

    }

    @Test
    public void play_playSongIfSongAvailable() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.play();

        verify(mockPlaylist, times(1)).nextSong();
        verify(mockFirstSong, times(1)).play();

        playlistPlayer.play();
        verify(mockPlaylist, times(1)).nextSong();
        verify(mockFirstSong, times(2)).play();
    }

    @Test
    public void playNext_playingSecondSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.playNext();
        playlistPlayer.playNext();

        verify(mockFirstSong, times(1)).play();
        verify(mockFirstSong, times(1)).close();
        verify(mockSecondSong, times(1)).play();
    }

    @Test
    public void playNext_playFirstSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.playNext();

        verify(mockFirstSong, times(1)).play();
    }

    @Test(expected=IllegalStateException.class)
    public void pause_throwsExceptionIfNoSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.pause();
    }

    @Test
    public void close_closesPlaylist() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.close();
    }

    @Test
    public void close_closesSongIfExists() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.play();
        playlistPlayer.close();

        verify(mockFirstSong, times(1)).close();
    }

    @Test
    public void playNext_retriesOnFailure() throws Exception {
        when(mockFirstSong.preload()).thenReturn(Utils.<Song>rejectedPromise(new Exception()));

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist, mockPlayerEventsEmitter);
        playlistPlayer.playNext();

        // second song will be loaded if preloading the first one failed
        verify(mockSecondSong, times(1)).play();
    }
}