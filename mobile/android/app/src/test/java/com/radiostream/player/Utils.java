package com.radiostream.player;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

/**
 * Created by vitaly on 23/11/2016.
 */

public class Utils {
    public static <D> Promise<D, Exception, Void> resolvedPromise(D result) {
        return new DeferredObject<D, Exception, Void>().resolve(result).promise();
    }

}
