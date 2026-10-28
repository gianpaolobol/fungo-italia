package it.fungoitalia.subscription;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
/** Canonical server UTC timestamps without java.time, supporting Android API24. */
public final class PlayDates {
  private PlayDates() {}
  private static SimpleDateFormat format() {
    var value=new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",Locale.US);
    value.setTimeZone(TimeZone.getTimeZone("UTC")); value.setLenient(false); return value;
  }
  public static String iso(long time) { return format().format(new Date(time)); }
  public static long parse(String value) {
    if(value==null || !value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z")) throw new IllegalArgumentException("Invalid server timestamp");
    var position=new ParsePosition(0); var date=format().parse(value,position);
    if(date==null || position.getIndex()!=value.length()) throw new IllegalArgumentException("Invalid server timestamp");
    return date.getTime();
  }
}
