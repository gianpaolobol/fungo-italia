package it.fungoitalia.subscription

import com.android.billingclient.api.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.functions.Coroutine
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONObject
import java.net.URL
import java.io.ByteArrayOutputStream
import java.util.UUID
import javax.net.ssl.HttpsURLConnection
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class FungoSubscriptionModule : Module() {
  companion object { const val PRODUCT = "it.fungoitalia.premium.annual" }
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val connectionLock = Mutex()
  private val accessLock = Mutex()
  private var client: BillingClient? = null
  private var pendingPurchase: CompletableDeferred<Pair<String, List<Purchase>>>? = null
  @Volatile private var epoch = 0L
  @Volatile private var destroyed = false

  override fun definition() = ModuleDefinition {
    Name("FungoSubscription")
    Events("entitlementChanged")
    Function("isConfigured") { BuildConfig.VERIFIER_URL.isNotEmpty() }
    AsyncFunction("product") Coroutine { product() }
    AsyncFunction("currentEntitlement") Coroutine { entitlement() }
    AsyncFunction("purchase") Coroutine { purchase() }
    AsyncFunction("restore") Coroutine { entitlement().also { emit(it) } }
    OnActivityEntersForeground {
      if (BuildConfig.VERIFIER_URL.isNotEmpty()) scope.launch {
        epoch++; emit(inactive())
        try { emit(entitlement()) } catch (_: Exception) { emit(inactive()) }
      }
    }
    OnDestroy {
      destroyed = true; epoch++
      pendingPurchase?.cancel(); pendingPurchase = null
      client?.endConnection(); client = null; scope.cancel()
    }
  }
  private fun inactive(): Map<String, Any?> = mapOf("active" to false, "productId" to PRODUCT, "expiresAt" to null, "checkedAt" to PlayDates.iso(System.currentTimeMillis()))
  private fun emit(value: Map<String, Any?>) { if (!destroyed) sendEvent("entitlementChanged", value) }
  private fun check(result: BillingResult) {
    if (result.responseCode != BillingClient.BillingResponseCode.OK) throw IllegalStateException("Google Play non disponibile (${result.responseCode})")
  }
  private suspend fun billing(): BillingClient = connectionLock.withLock {
    withContext(Dispatchers.Main) {
      check(!destroyed) { "Modulo acquisti chiuso" }
      val b = client ?: BillingClient.newBuilder(requireNotNull(appContext.reactContext))
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .setListener { result, purchases ->
          epoch++; emit(inactive())
          val waiting = pendingPurchase
          if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) waiting?.complete("cancelled" to emptyList())
          else if (result.responseCode == BillingClient.BillingResponseCode.OK) waiting?.complete("purchased" to (purchases ?: emptyList()))
          else waiting?.completeExceptionally(IllegalStateException("Acquisto Google Play non completato"))
          scope.launch { try { emit(entitlement()) } catch (_: Exception) { emit(inactive()) } }
        }.build().also { client = it }
      if (!b.isReady) withTimeout(15000) {
        suspendCancellableCoroutine<Unit> { continuation ->
          b.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
              if (!continuation.isActive) return
              if (result.responseCode == BillingClient.BillingResponseCode.OK) continuation.resume(Unit)
              else continuation.resumeWithException(IllegalStateException("Connessione Google Play non riuscita"))
            }
            override fun onBillingServiceDisconnected() { /* Next request reconnects; never retains an entitlement cache. */ }
          })
        }
      }
      b
    }
  }
  private suspend fun details(): Pair<ProductDetails, ProductDetails.SubscriptionOfferDetails> {
    val b = billing()
    val params = QueryProductDetailsParams.newBuilder().setProductList(listOf(QueryProductDetailsParams.Product.newBuilder().setProductId(PRODUCT).setProductType(BillingClient.ProductType.SUBS).build())).build()
    val products = withTimeout(15000) {
      suspendCancellableCoroutine<List<ProductDetails>> { c ->
        b.queryProductDetailsAsync(params) { result, response ->
          if (c.isActive) {
            if (result.responseCode == BillingClient.BillingResponseCode.OK) c.resume(response.productDetailsList)
            else c.resumeWithException(IllegalStateException("Prezzo Google Play non disponibile"))
          }
        }
      }
    }
    val item = products.singleOrNull { it.productId == PRODUCT } ?: error("Annuale non disponibile")
    val offer = item.subscriptionOfferDetails?.singleOrNull { offer ->
      AnnualOfferPolicy.accepts(offer.basePlanId, offer.offerId, offer.pricingPhases.pricingPhaseList.map { it.billingPeriod }, offer.pricingPhases.pricingPhaseList.map { it.recurrenceMode })
    } ?: error("Piano annuale senza prova non disponibile")
    return item to offer
  }
  private suspend fun product(): Map<String, Any> {
    health()
    val (item, offer) = details()
    return mapOf("id" to PRODUCT, "displayName" to item.name, "description" to item.description,
      "localizedPrice" to offer.pricingPhases.pricingPhaseList.single().formattedPrice, "subscriptionPeriod" to mapOf("unit" to "year", "value" to 1))
  }
  private suspend fun owned(): List<Purchase> {
    val b = billing()
    return withTimeout(15000) {
      suspendCancellableCoroutine { c ->
        b.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build()) { result, purchases ->
          if (c.isActive) {
            if (result.responseCode == BillingClient.BillingResponseCode.OK) c.resume(purchases)
            else c.resumeWithException(IllegalStateException("Abbonamento Google Play non verificabile"))
          }
        }
      }
    }
  }
  private suspend fun entitlement(): Map<String, Any?> = accessLock.withLock {
    if (BuildConfig.VERIFIER_URL.isEmpty()) return@withLock inactive()
    val version = epoch
    var selected: Map<String, Any?> = inactive()
    for (purchase in owned().filter { PRODUCT in it.products && it.purchaseState == Purchase.PurchaseState.PURCHASED }) {
      val state = verify(purchase.purchaseToken)
      if (state["active"] == true && (selected["active"] != true || PlayDates.parse(state["expiresAt"] as String) > PlayDates.parse(selected["expiresAt"] as String))) selected = state
    }
    if (epoch != version || destroyed) inactive() else selected
  }
  private suspend fun purchase(): Map<String, Any?> {
    health() // Never charge when the verification service cannot be reached.
    if (entitlement()["active"] == true) error("Abbonamento già attivo")
    val (item, offer) = details() // Fresh ProductDetails, never a persistent cache.
    val deferred = CompletableDeferred<Pair<String, List<Purchase>>>()
    withContext(Dispatchers.Main) {
      check(pendingPurchase == null) { "Un acquisto è già in corso" }
      pendingPurchase = deferred
    }
    try {
      val b = billing()
      withContext(Dispatchers.Main) {
        val activity = requireNotNull(appContext.currentActivity) { "Schermata di pagamento non disponibile" }
        check(b.launchBillingFlow(activity, BillingFlowParams.newBuilder().setProductDetailsParamsList(listOf(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(item).setOfferToken(offer.offerToken).build())).build()))
      }
      val (status, purchases) = withTimeout(300000) { deferred.await() }
      val actual = if (status != "cancelled" && purchases.any { PRODUCT in it.products && it.purchaseState == Purchase.PurchaseState.PENDING }) "pending" else status
      val state = entitlement(); emit(state)
      return mapOf("status" to actual, "entitlement" to state)
    } finally { withContext(NonCancellable + Dispatchers.Main) { if (pendingPurchase === deferred) pendingPurchase = null } }
  }
  private suspend fun health() {
    check(BuildConfig.VERIFIER_URL.isNotEmpty()) { "Acquisti Android in configurazione" }
    check(request("/health", null).optBoolean("ready", false)) { "Verifica acquisti non disponibile" }
  }
  private suspend fun verify(token: String): Map<String, Any?> {
    val nonce = UUID.randomUUID().toString()
    val json = request("/verify", JSONObject().put("purchaseToken", token).put("nonce", nonce))
    check(json.optString("nonce") == nonce && json.optString("productId") == PRODUCT) { "Risposta verifica non valida" }
    val checked = PlayDates.parse(json.getString("checkedAt"))
    check(kotlin.math.abs(System.currentTimeMillis() - checked) <= 120000) { "Risposta verifica scaduta" }
    if (!json.getBoolean("active")) return inactive()
    val expires = PlayDates.parse(json.getString("expiresAt"))
    check(expires > System.currentTimeMillis()) { "Abbonamento scaduto" }
    return mapOf("active" to true, "productId" to PRODUCT, "expiresAt" to PlayDates.iso(expires), "checkedAt" to PlayDates.iso(checked))
  }
  private suspend fun request(path: String, body: JSONObject?): JSONObject = withContext(Dispatchers.IO) {
    val connection = URL(BuildConfig.VERIFIER_URL + path).openConnection() as HttpsURLConnection
    try {
      connection.instanceFollowRedirects = false; connection.connectTimeout = 10000; connection.readTimeout = 12000
      connection.setRequestProperty("Accept", "application/json"); connection.setRequestProperty("Cache-Control", "no-store")
      if (body != null) {
        connection.requestMethod = "POST"; connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
      }
      check(connection.responseCode == 200) { "Servizio di verifica non disponibile" }
      val bytes = connection.inputStream.use { stream ->
        val output = ByteArrayOutputStream(); val buffer = ByteArray(2048)
        while (true) {
          val count = stream.read(buffer); if (count < 0) break
          check(output.size() + count <= 16384) { "Risposta verifica troppo grande" }
          output.write(buffer, 0, count)
        }
        output.toByteArray()
      }
      JSONObject(String(bytes, Charsets.UTF_8))
    } finally { connection.disconnect() }
  }
}
