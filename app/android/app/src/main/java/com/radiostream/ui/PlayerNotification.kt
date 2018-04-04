package com.radiostream.ui

import android.app.PendingIntent
import android.content.Intent
import android.support.v7.app.NotificationCompat

import com.radiostream.MainActivity
import com.radiostream.R
import com.radiostream.javascript.bridge.PlayerEventsEmitter
import com.radiostream.player.Player
import com.radiostream.player.PlayerService
import com.radiostream.player.Song

import javax.inject.Inject

import timber.log.Timber

class PlayerNotification @Inject
constructor(playerEventsEmitter: PlayerEventsEmitter, private val mPlayerService: PlayerService) {

    private val mNotificationId = 1
    private var previousLoading = false;
    private var previousSong: Song? = null

    init {
        Timber.i("function start")
        playerEventsEmitter.subscribePlayerChanges { player -> onPlayerChanged(player) }
    }

    private fun onPlayerChanged(player: Player) {
        Timber.i("function start")
        if (player.isLoading && !previousLoading) {
            Timber.i("player is loading")
            previousLoading = player.isLoading
            showLoadingNotification()
        } else if (player.currentSong != null && player.currentSong != previousSong) {
            Timber.i("song changed")
            previousSong = player.currentSong
            showSongNotification(player.currentSong!!)
        } else {
            Timber.i("nothing to show")
        }
    }

    private fun showSongNotification(currentSong: Song) {
        Timber.i("function start - show song notification for: %s - %s", currentSong.title, currentSong.artist)
        val showHeadsUpNotification = !mPlayerService.isBoundToAcitivity
        startWithNotificaiton(currentSong.title, currentSong.artist, showHeadsUpNotification)
    }

    private fun showLoadingNotification() {
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
