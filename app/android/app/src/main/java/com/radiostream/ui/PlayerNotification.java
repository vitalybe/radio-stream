package com.radiostream.ui;

import android.app.PendingIntent;
import android.content.Intent;
import android.support.v7.app.NotificationCompat;

import com.radiostream.MainActivity;
import com.radiostream.R;
import com.radiostream.player.PlayerService;
import com.radiostream.player.Song;

import javax.inject.Inject;

import timber.log.Timber;

public class PlayerNotification {

    private PlayerService mPlayerService;
    private final int mNotificationId = 1;

    @Inject
    public PlayerNotification(PlayerService playerService) {
        mPlayerService = playerService;
    }

    public void showSongNotification(Song currentSong) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.getTitle(), currentSong.getArtist());
        boolean showHeadsUpNotification = !mPlayerService.isBoundToAcitivity();
        startWithNotificaiton(currentSong.getTitle(), currentSong.getArtist(), showHeadsUpNotification);
    }

    public void showLoadingNotification() {
        Timber.i("function start - show loading notification");
        startWithNotificaiton("Radio Stream", "Loading...", false);
    }

    private void startWithNotificaiton(String title, String contentText, boolean isHeadsUp) {
        Timber.i("function start");

        // Open main UI activity
        Intent activityIntent = new Intent(mPlayerService.getApplicationContext(), MainActivity.class);
        PendingIntent activityPendingIntent = PendingIntent.getActivity(mPlayerService, 0, activityIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Stop intent
        Intent stopIntent = new Intent(mPlayerService, PlayerService.class);
        stopIntent.putExtra(mPlayerService.getPARAM_EXIT(), true);
        PendingIntent stopPendingIntent = PendingIntent.getService(mPlayerService, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(mPlayerService.getApplicationContext());
        mBuilder.setSmallIcon(R.drawable.image_note)
            .setContentTitle(title)
            .setContentText(contentText)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setContentIntent(activityPendingIntent);

        if (isHeadsUp) {
            mBuilder.setVibrate(new long[0]);
        }

        mPlayerService.startService(new Intent(mPlayerService, PlayerService.class));
        mPlayerService.startForeground(mNotificationId, mBuilder.build());
    }


}
