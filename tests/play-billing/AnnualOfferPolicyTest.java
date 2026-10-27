import java.util.List;
// Runnable on the build host as well as Android: catches accidental trials/monthly offers.
public class AnnualOfferPolicyTest {
  public static void main(String[] args) throws Exception {
    Class<?> cls;
    try { cls=Class.forName("it.fungoitalia.subscription.AnnualOfferPolicy"); }
    catch(ClassNotFoundException missing) { throw new AssertionError("Annual offer policy is missing"); }
    var method=cls.getMethod("accepts",String.class,String.class,List.class,List.class);
    Object[][] cases={
      {"annual",null,List.of("P1Y"),List.of(1),true},
      {"monthly",null,List.of("P1M"),List.of(1),false},
      {"annual","free-trial",List.of("P7D","P1Y"),List.of(2,1),false},
      {"annual",null,List.of("P1Y"),List.of(3),false},
      {"annual",null,List.of("P1M"),List.of(1),false},
      {"annual",null,List.of(),List.of(),false}
    };
    for(Object[] c:cases) if(!method.invoke(null,c[0],c[1],c[2],c[3]).equals(c[4])) throw new AssertionError("Wrong annual eligibility: "+java.util.Arrays.toString(c));
    var dates=Class.forName("it.fungoitalia.subscription.PlayDates");
    var parse=dates.getMethod("parse",String.class); var iso=dates.getMethod("iso",long.class);
    String stamp="2027-10-27T00:00:00.123Z";
    if(!iso.invoke(null,parse.invoke(null,stamp)).equals(stamp))throw new AssertionError("UTC roundtrip failed");
    for(String invalid:List.of("2027-02-30T00:00:00.000Z","2027-10-27T00:00:00Z","2027-10-27T00:00:00.000Ztrailing")) {
      try { parse.invoke(null,invalid); throw new AssertionError("Invalid date accepted"); }
      catch(java.lang.reflect.InvocationTargetException expected) { if(!(expected.getCause() instanceof IllegalArgumentException))throw expected; }
    }
    System.out.println("6 annual offer cases and 4 strict UTC cases PASS");
  }
}
