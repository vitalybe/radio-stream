package com.vitalyb.android_music_stream;

import android.util.Log;
/**
 * @author eefret
 * Created by Christopher T. Herrera (eefret) on 4/22/2014 [12:41 AM]
 * Wrapper class for android Logging utility will select a tag automatically from class, method and line number executed.
 */

public class Logger {
    //TODO Create a detail Enum to define the log detail level.
    //TODO Create a method that halt every log possible based on the development mode Ex: (PRODUCTION, DEVELOPMENT, DEBUG) that can manage what can be and can't be logged
    //======================================================================================
    //ENUMS
    //======================================================================================

    /**
     * <strong>LoggerDepth Enum</strong> <br/>
     * <ul>
     <li>ACTUAL_METHOD(4) </li>
     <li>LOGGER_METHOD(3) </li>
     <li>STACK_TRACE_METHOD(1)</li>
     <li>JVM_METHOD(0)</li>
     <ul/>
     */
    public enum LOGGER_DEPTH{
        ACTUAL_METHOD(4),
        LOGGER_METHOD(3),
        STACK_TRACE_METHOD(1),
        JVM_METHOD(0);

        private final int value;
        private LOGGER_DEPTH(final int newValue){
            value = newValue;
        }
        public int getValue(){
            return value;
        }
    }

    //======================================================================================
    //CONSTANTS
    //======================================================================================
    private static final String personalTAG = "Logger";

    //======================================================================================
    //FIELDS
    //======================================================================================
    private StringBuilder sb;

    //======================================================================================
    //CONSTRUCTORS
    //======================================================================================
    /**
     * private Constructor
     * The Perfect Singleton Pattern as Joshua Bosch Explained at his Effective Java Reloaded talk at Google I/O 2008
     */
    private Logger(){
        if(LoggerLoader.instance != null){
            Log.e(personalTAG,"Error: Logger already instantiated");
            throw new IllegalStateException("Already Instantiated");
        }else{

            this.sb = new StringBuilder(255);
        }
    }

    //======================================================================================
    //METHODS
    //======================================================================================
    /**
     * getLogger Method
     * The Perfect Singleton Pattern as Joshua Bosch Explained at his Effective Java Reloaded talk at Google I/O 2008
     * @return Logger (This instance)
     */
    public static Logger getLogger(){
        return LoggerLoader.instance;
    }

    /**
     * Method that creates the tag automatically
     * @param depth (Defines the depth of the Logging)
     * @return
     */
    private String getTag(LOGGER_DEPTH depth){
        try{
            String className = Thread.currentThread().getStackTrace()[depth.getValue()].getClassName();
            sb.append(className.substring(className.lastIndexOf(".")+1));
            sb.append("[");
            sb.append(Thread.currentThread().getStackTrace()[depth.getValue()].getMethodName());
            sb.append("] - ");
            sb.append(Thread.currentThread().getStackTrace()[depth.getValue()].getLineNumber());
            return sb.toString();
        }catch (Exception ex){
            ex.printStackTrace();
            Log.d(personalTAG, ex.getMessage());
        }finally{
            sb.setLength(0);
        }
        return null;
    }

    /**
     * Simple d Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void d(String msg){
        try {
            Log.d(getTag(LOGGER_DEPTH.ACTUAL_METHOD), msg);
        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * d Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void d(String msg, LOGGER_DEPTH depth){
        try {
            Log.d(getTag(depth), msg);
        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * d Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void d(String msg, Throwable t, LOGGER_DEPTH depth){
        try{
            Log.d(getTag(depth),msg,t);
        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * Simple e Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void e(String msg){
        try{
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD),msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * e Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void e(String msg, LOGGER_DEPTH depth){
        try{
            Log.e(getTag(depth),msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * e Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void e(String msg, Throwable t, LOGGER_DEPTH depth){
        try{
            Log.e(getTag(depth),msg,t);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * Simple w Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void w(String msg){
        try {
            Log.w(getTag(LOGGER_DEPTH.ACTUAL_METHOD), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * w Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void w(String msg, LOGGER_DEPTH depth){
        try{
            Log.w(getTag(depth), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * w Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void w(String msg, Throwable t, LOGGER_DEPTH depth){
        try{
            Log.w(getTag(depth), msg, t);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * Simple v Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void v(String msg){
        try{
            Log.v(getTag(LOGGER_DEPTH.ACTUAL_METHOD), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * v Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void v(String msg, LOGGER_DEPTH depth){
        try{
            Log.v(getTag(depth), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * v Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void v(String msg, Throwable t, LOGGER_DEPTH depth){
        try{
            Log.v(getTag(depth), msg, t);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * Simple i Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void i(String msg){
        try{
            Log.i(getTag(LOGGER_DEPTH.ACTUAL_METHOD), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * i Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void i(String msg, LOGGER_DEPTH depth){
        try{
            Log.i(getTag(depth), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * i Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void i(String msg, Throwable t, LOGGER_DEPTH depth){
        try {
            Log.i(getTag(depth), msg, t);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * Simple wtf Method will log in default depth ACTUAL_METHOD
     * @param msg
     */
    public void wtf(String msg){
        try{
            Log.wtf(getTag(LOGGER_DEPTH.ACTUAL_METHOD), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * wtf Method that takes LOGGER_DEPTH as the second parameter, will log custom depth level
     * @see com.motube.app.util.Logger.LOGGER_DEPTH
     * @param msg
     * @param depth
     */
    public void wtf(String msg, LOGGER_DEPTH depth){
        try{
            Log.wtf(getTag(depth), msg);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }

    /**
     * wtf Method with Throwable that takes LOGGER_DEPTH as the third parameter, will log custom depth level
     * @param msg
     * @param t
     * @param depth
     */
    public void wtf(String msg, Throwable t, LOGGER_DEPTH depth){
        try{
            Log.wtf(getTag(depth), msg, t);

        }catch (Exception exception){
            Log.e(getTag(LOGGER_DEPTH.ACTUAL_METHOD), "Logger failed, exception: "+exception.getMessage());
        }
    }


    //======================================================================================
    //INNER CLASSES
    //======================================================================================

    /**
     * Logger Loader Class
     * The Perfect Singleton Pattern as Joshua Bosch Explained at his Effective Java Reloaded talk at Google I/O 2008
     */
    private static class LoggerLoader {
        private static final Logger instance = new Logger();
    }
}