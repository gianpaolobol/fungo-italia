package it.fungoitalia.subscription;
import java.util.List;
public final class AnnualOfferPolicy {
  private AnnualOfferPolicy() {}
  public static boolean accepts(String basePlanId, String offerId, List<String> periods, List<Integer> modes) {
    return "annual".equals(basePlanId) && offerId == null && periods.size() == 1 && modes.size() == 1
      && "P1Y".equals(periods.get(0)) && Integer.valueOf(1).equals(modes.get(0));
  }
}
