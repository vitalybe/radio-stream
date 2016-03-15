package com.vitalyb.android_music_stream;

import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnClick;

public class MainActivity extends AppCompatActivity implements PlaylistsFragment.OnPlaylistSelectedListener, MusicService.OnMusicEventsListener {

    public static final String INTENT_PARAM_PLAYLIST = "INTENT_PARAM_PLAYLIST";

    @InjectView(R.id.image_album)
    ImageView imageAlbum;
    @InjectView(R.id.text_name)
    TextView textName;
    @InjectView(R.id.text_artist)
    TextView textArtist;
    @InjectView(R.id.stars)
    LinearLayout stars;
    @InjectView(R.id.layout_drawer)
    DrawerLayout layoutDrawer;
    @InjectView(R.id.progress_song)
    ProgressBar progressSong;
    @InjectView(R.id.layout_song)
    LinearLayout layoutSong;
    @InjectView(R.id.button_play_pause)
    ImageButton buttonPlayPause;

    Intent mMusicServiceIntent = null;
    MusicService mMusicService = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.inject(this);


    }

    @Override
    protected void onStart() {
        super.onStart();

        mMusicServiceIntent = new Intent(this, MusicService.class);
        bindService(mMusicServiceIntent, mServiceConnection, BIND_AUTO_CREATE);
        startService(mMusicServiceIntent);
    }

    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            MusicService.MusicServiceBinder binder = (MusicService.MusicServiceBinder) service;
            mMusicService = binder.getService();
            mMusicService.subscribeToEvents(MainActivity.this);

            String initialPlaylist = getIntent().getExtras().getString(INTENT_PARAM_PLAYLIST);
            mMusicService.playPlaylist(initialPlaylist);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mMusicService = null;
        }
    };

    @Override
    protected void onResume() {
        super.onResume();

        if (mMusicService != null) {
            mMusicService.subscribeToEvents(this);
        }
    }

    @Override
    protected void onStop() {
        if (mMusicService != null) {
            mMusicService.unsubscribeToEvents();
        }

        super.onStop();
    }

    @Override
    protected void onDestroy() {
        StopMusicService();
        super.onDestroy();
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.menu_quit:
                StopMusicService();
                System.exit(0);
                break;
        }

        return super.onOptionsItemSelected(item);
    }

    private void StopMusicService() {
        stopService(mMusicServiceIntent);
        mMusicService = null;
    }


    private ImageView createImage(int imageId) {
        ImageView imageView = new ImageView(this);
        imageView.setImageResource(imageId);
        imageView.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        return imageView;
    }

    private void addStars(int stars, int starImageId) {
        for (int i = 0; i < stars; i++) {
            ImageView starImage = createImage(starImageId);
            this.stars.addView(starImage);
        }
    }

    public void showSong(SongModel song) {
        textArtist.setText(song.getArtist());
        textName.setText(song.getName());

        stars.removeAllViews();
        addStars(song.getStars(), R.mipmap.image_star);
        addStars(5 - song.getStars(), R.mipmap.image_no_star);
    }

    @Override
    public void onPlaylistSelected(String playlist) {
        layoutDrawer.closeDrawer(Gravity.LEFT);
        mMusicService.playPlaylist(playlist);
    }

    @Override
    public void OnSongPreloading(SongModel song) {
        layoutSong.setVisibility(View.GONE);
        progressSong.setVisibility(View.VISIBLE);
    }

    @Override
    public void OnSongPlaying(SongModel song) {
        layoutSong.setVisibility(View.VISIBLE);
        progressSong.setVisibility(View.GONE);
        showSong(song);

        buttonPlayPause.setImageResource(R.mipmap.image_pause);
    }

    @Override
    public void OnSongPaused(SongModel song) {
        buttonPlayPause.setImageResource(R.mipmap.image_play);
    }

    @OnClick({R.id.button_play_pause, R.id.button_next_song})
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.button_play_pause:
                mMusicService.togglePlayPause();
                break;
            case R.id.button_next_song:
                mMusicService.skipToNextSong();
                break;
        }
    }
}
