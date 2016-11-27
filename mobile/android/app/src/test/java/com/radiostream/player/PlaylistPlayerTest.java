package com.radiostream.player;

import com.radiostream.BuildConfig;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLog;

import static com.radiostream.player.Utils.rejectedPromise;
import static com.radiostream.player.Utils.resolvedPromise;
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
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.play();

        verify(mockFirstSong, times(1)).play();
    }

    @Test
    public void play_playSongIfSongAvailable() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.play();

        verify(mockPlaylist, times(1)).nextSong();
        verify(mockFirstSong, times(1)).play();

        playlistPlayer.play();
        verify(mockPlaylist, times(1)).nextSong();
        verify(mockFirstSong, times(2)).play();
    }

    @Test
    public void playNext_playingSecondSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.playNext();
        playlistPlayer.playNext();

        verify(mockFirstSong, times(1)).play();
        verify(mockFirstSong, times(1)).close();
        verify(mockSecondSong, times(1)).play();
    }

    @Test
    public void playNext_playFirstSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.playNext();

        verify(mockFirstSong, times(1)).play();
    }

    @Test(expected=IllegalStateException.class)
    public void pause_throwsExceptionIfNoSong() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.pause();
    }

    @Test
    public void close_closesPlaylist() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.close();
    }

    @Test
    public void close_closesSongIfExists() throws Exception {
        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.play();
        playlistPlayer.close();

        verify(mockFirstSong, times(1)).close();
    }

    @Test
    public void playNext_retriesOnFailure() throws Exception {
        when(mockFirstSong.preload()).thenReturn(Utils.<Song>rejectedPromise(new Exception()));

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.playNext();

        // second song will be loaded if preloading the first one failed
        verify(mockSecondSong, times(1)).play();
    }
}