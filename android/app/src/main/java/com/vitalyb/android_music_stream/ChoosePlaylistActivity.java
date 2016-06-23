package com.vitalyb.android_music_stream;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.splunk.mint.Mint;

public class ChoosePlaylistActivity extends AppCompatActivity implements PlaylistsFragment.OnPlaylistSelectedListener {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_choose_playlist);

        Mint.initAndStartSession(ChoosePlaylistActivity.this, "02acab8e");
    }

    @Override
    public void onPlaylistSelected(String playlistName) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra(MainActivity.INTENT_PARAM_PLAYLIST, playlistName);
        startActivity(intent);
    }

}
