package com.radiostream.player;

import java.util.Locale;

import timber.log.Timber;

/**
 * Created by vitaly on 23/11/2016.
 */

public class Utils {

    public static void initTestLogging() {
        Timber.uprootAll();
        Timber.plant(new Timber.DebugTree() {
            @Override
            protected String createStackElementTag(StackTraceElement element) {
                return String.format("%s:%s",
                    super.createStackElementTag(element),
                    element.getMethodName()
                );
            }

            @Override
            protected void log(int priority, String tag, String message, Throwable t) {
                System.out.println(String.format(Locale.US,"[%d] [%s] %s", priority, tag, message));
            }
        });
    }

}
