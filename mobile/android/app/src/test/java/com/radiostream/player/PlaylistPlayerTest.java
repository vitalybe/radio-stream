package com.radiostream.player;

import com.radiostream.BuildConfig;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.mockito.stubbing.VoidAnswer1;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLog;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class)
public class PlaylistPlayerTest {

    @Mock
    PlaylistFactory mockPlaylistFactory;

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();

    @BeforeClass
    public static void setUp() throws Exception {
        ShadowLog.stream = System.out;
    }

    public <D> Promise<D, Exception, Void> resolvedPromise(D result) {
        return new DeferredObject<D, Exception, Void>().resolve(result).promise();
    }

    @Test
    public void play_playsNextSongIfNotSongAvailable() throws Exception {
        Song mockSong = mock(Song.class);
        when(mockSong.preload()).thenReturn(resolvedPromise(mockSong));

        Playlist mockPlaylist = mock(Playlist.class);
        when(mockPlaylist.load()).thenReturn(resolvedPromise((Void)null));
        when(mockPlaylist.nextSong()).thenReturn(resolvedPromise(mockSong));
        when(mockPlaylist.peekSong()).thenReturn(resolvedPromise(mockSong)); // a new song mock

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.play();

        verify(mockSong, times(1)).play();
    }

    @Test
    public void nextSong_playNextSong() throws Exception {
        Song mockSong = mock(Song.class);
        when(mockSong.preload()).thenReturn(resolvedPromise(mockSong));

        Playlist mockPlaylist = mock(Playlist.class);
        when(mockPlaylist.load()).thenReturn(resolvedPromise((Void)null));
        when(mockPlaylist.nextSong()).thenReturn(resolvedPromise(mockSong));
        when(mockPlaylist.peekSong()).thenReturn(resolvedPromise(mockSong)); // a new song mock

        PlaylistPlayer playlistPlayer = new PlaylistPlayer(mockPlaylist);
        playlistPlayer.nextSong();

        verify(mockSong, times(1)).play();
    }

    @Test
    public void play() throws Exception {

    }

    @Test
    public void pause() throws Exception {

    }

    @Test
    public void nextSong() throws Exception {

    }

    @Test
    public void close() throws Exception {

    }

}