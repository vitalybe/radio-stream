package com.radiostream.player;

import com.radiostream.networking.models.SongResult;

import org.jdeferred.Promise;

public class Song {

    private final String mTitle;
    private EventsListener mEventsListener;

    public Song(SongResult songResult) {
        this.mTitle = songResult.title;
    }

    public void subscribeToEvents(EventsListener eventsListener) {

        mEventsListener = eventsListener;
    }

    public void play() {
    }

    public void pause() {
    }

    public void close() {
    }

    public Promise<Song,Exception,Void> preload() {
        return null;
    }

    public String getTitle() {
        return mTitle;
    }

    public interface EventsListener {
        void onSongFinish(Song song);
    }
}
