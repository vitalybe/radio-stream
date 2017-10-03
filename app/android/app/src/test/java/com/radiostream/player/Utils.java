package com.radiostream.player;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;

import java.util.Locale;

import timber.log.Timber;

/**
 * Created by vitaly on 23/11/2016.
 */

public class Utils {
    public static <D> Promise<D, Exception, Void> resolvedPromise(D result) {
        return new DeferredObject<D, Exception, Void>().resolve(result).promise();
    }

    public static <D> Promise<D, Exception, Void> rejectedPromise(Exception error) {
        return new DeferredObject<D, Exception, Void>().reject(error).promise();
    }

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

//    public static void mockAndroidStatics() {
//        PowerMockito.mockStatic(Arguments.class);
//        PowerMockito.when(Arguments.createMap()).thenAnswer(new Answer<Object>() {
//            @Override
//            public Object answer(InvocationOnMock invocation) throws Throwable {
//                return new JavaOnlyMap();
//            }
//        });
//
//        PowerMockito.mockStatic(android.util.Log.class);
//        //noinspection WrongConstant
//        PowerMockito.when(android.util.Log.println(anyInt(), anyString(), anyString())).thenAnswer(new Answer<Object>() {
//            @Override
//            public Object answer(InvocationOnMock invocation) throws Throwable {
//                Integer priority = (Integer) invocation.getArguments()[0];
//                String tag = (String) invocation.getArguments()[1];
//                String msg = (String) invocation.getArguments()[2];
//                System.out.println(String.format(Locale.US,"[%d] [%s] %s", priority, tag, msg));
//
//                return null;
//            }
//        });
//    }
}
