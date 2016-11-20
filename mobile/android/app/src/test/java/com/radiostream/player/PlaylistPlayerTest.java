package com.radiostream.player;

import android.util.Log;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnit;
import org.mockito.junit.MockitoRule;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import timber.log.Timber;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(PowerMockRunner.class)
@PrepareForTest({android.util.Log.class})
public class PlaylistPlayerTest {

    @Mock
    PlaylistFactory mockPlaylistFactory;

    @Rule
    public MockitoRule mockitoRule = MockitoJUnit.rule();

    @BeforeClass
    public static void setUpBeforeClass() throws Exception {
        Timber.plant(new Timber.DebugTree());
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
    @PrepareForTest({android.util.Log.class})
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