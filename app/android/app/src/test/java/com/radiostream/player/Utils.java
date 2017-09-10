package com.radiostream.player;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.JavaOnlyMap;

import org.jdeferred.Promise;
import org.jdeferred.impl.DeferredObject;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;

import java.util.Locale;

import timber.log.Timber;

import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyString;

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
        });
    }

    public static void mockAndroidStatics() {
        PowerMockito.mockStatic(Arguments.class);
        PowerMockito.when(Arguments.createMap()).thenAnswer(new Answer<Object>() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                return new JavaOnlyMap();
            }
        });

        PowerMockito.mockStatic(android.util.Log.class);
        //noinspection WrongConstant
        PowerMockito.when(android.util.Log.println(anyInt(), anyString(), anyString())).thenAnswer(new Answer<Object>() {
            @Override
            public Object answer(InvocationOnMock invocation) throws Throwable {
                Integer priority = (Integer) invocation.getArguments()[0];
                String tag = (String) invocation.getArguments()[1];
                String msg = (String) invocation.getArguments()[2];
                System.out.println(String.format(Locale.US,"[%d] [%s] %s", priority, tag, msg));

                return null;
            }
        });
    }
}
