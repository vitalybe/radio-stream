package com.radiostream.ui

import android.app.PendingIntent
import android.content.Intent
import android.support.v7.app.NotificationCompat

import com.radiostream.MainActivity
import com.radiostream.R
import com.radiostream.player.PlayerService
import com.radiostream.player.Song

import javax.inject.Inject

import timber.log.Timber

class PlayerNotification @Inject
constructor(private val mPlayerService: PlayerService) {
    private val mNotificationId = 1

    fun showSongNotification(currentSong: Song) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.title, currentSong.artist)
        val showHeadsUpNotification = !mPlayerService.isBoundToAcitivity
        startWithNotificaiton(currentSong.title, currentSong.artist, showHeadsUpNotification)
    }

    fun showLoadingNotification() {
        Timber.i("function start - show loading notification")
        startWithNotificaiton("Radio Stream", "Loading...", false)
    }

    private fun startWithNotificaiton(title: String, contentText: String, isHeadsUp: Boolean) {
        Timber.i("function start")

        // Open main UI activity
        val activityIntent = Intent(mPlayerService.applicationContext, MainActivity::class.java)
        val activityPendingIntent = PendingIntent.getActivity(mPlayerService, 0, activityIntent, PendingIntent.FLAG_UPDATE_CURRENT)

        // Stop intent
        val stopIntent = Intent(mPlayerService, PlayerService::class.java)
        stopIntent.putExtra(mPlayerService.PARAM_EXIT, true)
        val stopPendingIntent = PendingIntent.getService(mPlayerService, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT)

        val mBuilder = NotificationCompat.Builder(mPlayerService.applicationContext)
        mBuilder.setSmallIcon(R.drawable.image_note)
                .setContentTitle(title)
                .setContentText(contentText)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setContentIntent(activityPendingIntent)

        if (isHeadsUp) {
            mBuilder.setVibrate(LongArray(0))
        }

        mPlayerService.startService(Intent(mPlayerService, PlayerService::class.java))
        mPlayerService.startForeground(mNotificationId, mBuilder.build())
    }


}
