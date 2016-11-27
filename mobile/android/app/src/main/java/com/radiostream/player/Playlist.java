package com.radiostream.player;

import com.radiostream.networking.MetadataBackend;
import com.radiostream.networking.models.SongResult;

import org.jdeferred.DoneFilter;
import org.jdeferred.DonePipe;
import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.util.ArrayList;
import java.util.List;

import hugo.weaving.DebugLog;
import timber.log.Timber;

public class Playlist {
    private String mPlaylistName;
    private MetadataBackend mMetadataBackend;
    private SongFactory mSongFactory;

    private List<Song> mSongs = new ArrayList<Song>();
    private int mIndex = -1;

    public Playlist(String playlistName, MetadataBackend metadataBackend, SongFactory songFactory) {
        mPlaylistName = playlistName;
        mMetadataBackend = metadataBackend;
        mSongFactory = songFactory;
    }

    private Promise<Void, Exception, Void> reloadIfNeededForNextSong() {
        Timber.i("checking if reload is needed. songs count: %d Current index: %d", mSongs.size(), mIndex);
        if(mIndex+1 >= mSongs.size()) {
            Timber.i("reloading songs");

            mSongs.clear();
            mIndex = -1;

            return mMetadataBackend.fetchPlaylist(mPlaylistName).then(new DoneFilter<List<SongResult>, Void>() {
                @Override
                public Void filterDone(List<SongResult> result) {
                    if (result.size() == 0) {
                        throw new RuntimeException("Empty playlists are currently unhandled");
                    }

                    for (SongResult songResult : result) {
                        mSongs.add(mSongFactory.build(songResult));
                    }

                    return null;
                }
            });
        } else {
            Timber.i("no reload required");
            return new DeferredObject<Void, Exception, Void>().resolve(null).promise();
        }
    }


    public Promise<Song, Exception, Void> nextSong() {
        Timber.i("function start");
        
        return peekNextSong().then(new DoneFilter<Song, Song>() {
            @Override
            public Song filterDone(Song result) {
                mIndex++;

                return result;
            }
        });
    }

    public Promise<Song, Exception, Void> peekNextSong() {
        Timber.i("function start");
        
        return reloadIfNeededForNextSong().then(new DonePipe<Void, Song, Exception, Void>() {
            @Override
            public Promise<Song, Exception, Void> pipeDone(Void result) {
                DeferredObject<Song, Exception, Void> deferredObject = new DeferredObject<>();
                Song resolve = mSongs.get(mIndex + 1);
                Timber.i("peeked next song: %s", resolve.toString());
                return deferredObject.resolve(resolve).promise();
            }
        });
    }
}
