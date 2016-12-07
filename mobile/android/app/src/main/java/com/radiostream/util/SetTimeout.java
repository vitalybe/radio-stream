package com.radiostream.util;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * Created by vitaly on 07/12/2016.
 */

@Singleton
public class SetTimeout {

    @Inject
    public SetTimeout() {
    }

    public Promise<Void, Exception, Void> run(int timeoutMilisecond) {
        final DeferredObject<Void, Exception, Void> deferredObject = new DeferredObject<>();

        new android.os.Handler().postDelayed(
            new Runnable() {
                public void run() {
                    deferredObject.resolve(null);
                }
            },
            timeoutMilisecond);

        return deferredObject.promise();
    }
}
