package com.vitalyb.android_music_stream;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.testfairy.TestFairy;

public class ChoosePlaylistActivity extends AppCompatActivity implements PlaylistsFragment.OnPlaylistSelectedListener {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_choose_playlist);

        TestFairy.begin(this, "764a3f516e3fdab9f742b8aaf02f2058bd95890c");
    }

    @Override
    public void onPlaylistSelected(String playlistName) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra(MainActivity.INTENT_PARAM_PLAYLIST, playlistName);
        startActivity(intent);
    }

}
