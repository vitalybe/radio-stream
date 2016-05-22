package com.vitalyb.android_music_stream;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.content.LocalBroadcastManager;
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

import com.vitalyb.android_music_stream.backend.MusicBackend;
import com.vitalyb.android_music_stream.backend.MusicBackendImpl;

import java.io.InputStream;
import java.util.Objects;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnClick;

public class MainActivity extends AppCompatActivity implements PlaylistsFragment.OnPlaylistSelectedListener, MusicService.OnMusicEventsListener {

    public static final String INTENT_PARAM_PLAYLIST = "INTENT_PARAM_PLAYLIST";
    public static final String ACTION_STOP_MUSIC_ACTIVITY = "ACTION_STOP_MUSIC_ACTIVITY";
    private final Logger mLogger = Logger.getLogger();

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
    MusicBackend mMusicBackend = null;

    private BroadcastReceiver mMessageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals(ACTION_STOP_MUSIC_ACTIVITY)) {
                finish();
            }
        }
    };
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mLogger.d("Start");

            MusicService.MusicServiceBinder binder = (MusicService.MusicServiceBinder) service;
            mMusicService = binder.getService();
            mMusicService.subscribeToEvents(MainActivity.this);
            mMusicService.forceInfoUpdate();

            String initialPlaylist = getIntent().getExtras().getString(INTENT_PARAM_PLAYLIST);
            if(!Objects.equals(mMusicService.getPlaylistName(), initialPlaylist)) {
                mMusicService.playPlaylist(initialPlaylist);
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mLogger.d("Start");
            mMusicService = null;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.inject(this);
        mMusicBackend = new MusicBackendImpl(this);


        LocalBroadcastManager.getInstance(this).registerReceiver(
                mMessageReceiver, new IntentFilter(ACTION_STOP_MUSIC_ACTIVITY));
    }

    @Override
    protected void onStart() {
        mLogger.d("Start");
        super.onStart();

        mMusicServiceIntent = new Intent(this, MusicService.class);
        bindService(mMusicServiceIntent, mServiceConnection, BIND_AUTO_CREATE);
        startService(mMusicServiceIntent);
    }

    @Override
    protected void onResume() {
        mLogger.d("Start");
        super.onResume();

        if (mMusicService != null) {
            mMusicService.subscribeToEvents(this);
            mMusicService.forceInfoUpdate();
        }
    }

    @Override
    protected void onStop() {
        mLogger.d("Start");
        if (mMusicService != null) {
            mMusicService.unsubscribeToEvents();
        }
        unbindService(mServiceConnection);
        LocalBroadcastManager.getInstance(this).unregisterReceiver(mMessageReceiver);

        super.onStop();
    }

    @Override
    protected void onDestroy() {
        mLogger.d("Start");
        super.onDestroy();
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        mLogger.d("Start");
        getMenuInflater().inflate(R.menu.main, menu);

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        mLogger.d("Start");
        switch (item.getItemId()) {
            case R.id.menu_quit:
                stopMusicService();
                System.exit(0);
                break;
        }

        return super.onOptionsItemSelected(item);
    }

    private void stopMusicService() {
        mLogger.d("Start");
        stopService(mMusicServiceIntent);
        mMusicService = null;
    }


    private ImageView createImage(int imageId) {
        mLogger.d("Start");
        ImageView imageView = new ImageView(this);
        imageView.setImageResource(imageId);
        imageView.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        return imageView;
    }

    private void addStars(int stars, int starImageId) {
        mLogger.d("Start");
        for (int i = 0; i < stars; i++) {
            ImageView starImage = createImage(starImageId);
            this.stars.addView(starImage);
        }
    }

    public void showSong(SongModel song) {
        mLogger.d("Start");
        textArtist.setText(song.getArtist());
        textName.setText(song.getName());

        stars.removeAllViews();
        addStars(song.getStars(), R.mipmap.image_star);
        addStars(5 - song.getStars(), R.mipmap.image_no_star);

        mMusicBackend.fetchArt(song.getArtist(), new MusicBackend.OnResultListener<Bitmap>() {
            @Override
            public void OnResult(Bitmap bitmap) {
                imageAlbum.setImageBitmap(bitmap);
            }
        });
    }

    @Override
    public void onPlaylistSelected(String playlist) {
        mLogger.d("Start");
        layoutDrawer.closeDrawer(Gravity.LEFT);
        mMusicService.playPlaylist(playlist);
    }
	

    @OnClick({R.id.button_play_pause, R.id.button_next_song})
    public void onClick(View view) {
        mLogger.d("Start");
        switch (view.getId()) {
            case R.id.button_play_pause:
                mMusicService.togglePlayPause();
                break;
            case R.id.button_next_song:
                mMusicService.skipToNextSong();
                break;
        }
    }

    @Override
    public void OnMusicStateChanged(boolean isPreparing, boolean isPlaying, SongModel song) {
        if(isPreparing) {
            layoutSong.setVisibility(View.GONE);
            progressSong.setVisibility(View.VISIBLE);
        } else {
            layoutSong.setVisibility(View.VISIBLE);
            progressSong.setVisibility(View.GONE);
        }

        if(isPlaying) {
            buttonPlayPause.setImageResource(R.mipmap.image_pause);
        } else {
            buttonPlayPause.setImageResource(R.mipmap.image_play);
        }

        if(song != null) {
            showSong(song);
        }
    }
}
