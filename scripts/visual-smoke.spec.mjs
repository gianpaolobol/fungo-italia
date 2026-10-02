import { test, expect } from "@playwright/test";

const viewports = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x812", width: 375, height: 812 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];

const headers = {
  "oai-authenticated-user-id": "visual-smoke-user",
  "oai-authenticated-user-email": "visual-smoke@example.test",
  "oai-authenticated-user-full-name": "Visual%20Smoke",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
};

async function horizontalOverflow(page) {
  return page.evaluate(() =>
    Math.max(
      0,
      document.documentElement.scrollWidth - window.innerWidth,
      document.body.scrollWidth - window.innerWidth,
    ),
  );
}

for (const viewport of viewports) {
  test(`visual smoke ${viewport.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      extraHTTPHeaders: headers,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.goto("http://127.0.0.1:8787/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Fungo Italia").first()).toBeVisible();
    await expect(page.getByRole("tab", { name: "Atlante" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    const atlasTab = page.getByRole("tab", { name: "Atlante" });
    await atlasTab.click();
    await expect(atlasTab).toHaveAttribute("data-state", "active", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Nomi comprensibili, rigore scientifico" })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    const openButton = page.getByRole("button", { name: "Apri scheda" }).first();
    await expect(openButton).toBeVisible({ timeout: 15000 });
    await openButton.click();
    await expect(page.getByRole("button", { name: /Torna ai risultati|Torna al genere|Torna al gruppo/ })).toBeVisible();
    await expect(page.getByText("Scheda rapida scientifica", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "3 caratteri principali + 1 differenziante" })).toBeVisible();
    await expect(page.getByText(/scientific-baseline-1\.0/)).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.screenshot({ path: `artifacts/visual-smoke/${viewport.name}.png`, fullPage: true });
    await context.close();
  });
}


test("observation submission persists and stays private between users", async ({ browser }) => {
  const owner = await browser.newContext({ extraHTTPHeaders: { ...headers, "oai-authenticated-user-id": "evidence-owner", "oai-authenticated-user-email": "owner@example.test" } });
  const other = await browser.newContext({ extraHTTPHeaders: { ...headers, "oai-authenticated-user-id": "evidence-other", "oai-authenticated-user-email": "other@example.test" } });
  const anonymous = await browser.newContext();
  const base = "http://127.0.0.1:8787";
  const evidence = {
    description: "Esemplare osservato sotto faggio; base intera fotografata, identificazione da verificare.",
    observedAt: new Date(Date.now() - 86400000).toISOString(),
    latitude: "42.8912345", longitude: "11.6323456",
    photos: { name: "evidence.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY1cAAAAASUVORK5CYII=", "base64") },
  };
  try {
    const created = await owner.request.post(base + "/api/observations", { multipart: evidence });
    expect(created.status(), await created.text()).toBe(201);
    const observation = await created.json();
    expect(observation.status).toBe("pending");
    const ownHistory = await owner.request.get(base + "/api/observations");
    expect(ownHistory.status(), await ownHistory.text()).toBe(200);
    expect(ownHistory.headers()["cache-control"]).toContain("no-store");
    expect(await ownHistory.text()).toContain(observation.id);
    const otherHistory = await other.request.get(base + "/api/observations");
    expect(otherHistory.status(), await otherHistory.text()).toBe(200);
    expect(await otherHistory.text()).not.toContain(observation.id);
    expect(await otherHistory.text()).not.toContain("42.8912345");
    expect((await anonymous.request.get(base + "/api/observations")).status()).toBe(401);
    expect((await owner.request.get(base + "/api/admin/observations")).status()).toBe(403);
    const missingLocation = { ...evidence };
    delete missingLocation.latitude; delete missingLocation.longitude;
    const invalid = await owner.request.post(base + "/api/observations", { multipart: missingLocation });
    expect(invalid.status(), await invalid.text()).toBe(400);
  } finally {
    await owner.close(); await other.close(); await anonymous.close();
  }
});


test("independent documentary review protects photos, scope and concurrent decisions", async ({ browser }) => {
  const base = "http://127.0.0.1:8787";
  const contexts = {};
  for (const name of ["author", "assigned", "outside"]) {
    contexts[name] = await browser.newContext({ extraHTTPHeaders: { ...headers, "oai-authenticated-user-id": "ci-review-" + name, "oai-authenticated-user-email": "review-" + name + "@example.test" }, viewport: { width: 320, height: 568 } });
  }
  try {
    const created = await contexts.author.request.post(base + "/api/observations", { multipart: {
      description: "CI: materiale simulato per verificare il percorso di revisione, senza determinazione scientifica.",
      observedAt: new Date(Date.now() - 86400000).toISOString(), latitude: "42.8912345", longitude: "11.6323456",
      photos: { name: "ci-evidence.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY1cAAAAASUVORK5CYII=", "base64") },
    }});
    expect(created.status(), await created.text()).toBe(201);
    const observation = await created.json();
    const queueResponse = await contexts.assigned.request.get(base + "/api/admin/observations");
    expect(queueResponse.status(), await queueResponse.text()).toBe(200);
    const queue = await queueResponse.json();
    const row = queue.observations.find(item => item.id === observation.id);
    expect(row).toBeTruthy();
    expect(row.reviewVersion).toBe(0);
    expect(JSON.stringify(row)).not.toContain("42.8912345");
    const ownQueue = await contexts.author.request.get(base + "/api/admin/observations");
    expect(await ownQueue.text()).not.toContain(observation.id);
    const outsideQueue = await contexts.outside.request.get(base + "/api/admin/observations");
    expect(outsideQueue.status()).toBe(200);
    expect(await outsideQueue.text()).not.toContain(observation.id);
    const photoUrl = base + row.photos[0].url;
    const photo = await contexts.assigned.request.get(photoUrl);
    expect(photo.status()).toBe(200);
    expect(photo.headers()["content-type"]).toBe("image/png");
    expect(photo.headers()["cache-control"]).toContain("no-store");
    expect((await contexts.author.request.get(photoUrl)).status()).toBe(200);
    expect((await contexts.outside.request.get(photoUrl)).status()).toBe(404);
    const decision = { observationId: observation.id, outcome: "needsEvidence", notes: "CI: richiedere una fotografia nitida della base e dell’imenoforo.", expectedReviewVersion: 0 };
    expect((await contexts.author.request.post(base + "/api/admin/observations", { data: decision })).status()).toBe(404);
    expect((await contexts.outside.request.post(base + "/api/admin/observations", { data: decision })).status()).toBe(404);
    const reviewed = await contexts.assigned.request.post(base + "/api/admin/observations", { data: decision });
    expect(reviewed.status(), await reviewed.text()).toBe(200);
    expect((await reviewed.json()).status).toBe("needsEvidence");
    expect((await contexts.assigned.request.post(base + "/api/admin/observations", { data: decision })).status()).toBe(409);
    const updatedQueue = await (await contexts.assigned.request.get(base + "/api/admin/observations")).json();
    const updated = updatedQueue.observations.find(item => item.id === observation.id);
    expect(updated.reviewVersion).toBeGreaterThan(0);
    const documented = await contexts.assigned.request.post(base + "/api/admin/observations", { data: { ...decision, outcome: "documented", acceptedTaxonId: updatedQueue.taxa[0].id, expectedReviewVersion: updated.reviewVersion, notes: "CI: simulazione tecnica della registrazione documentale; nessuna diagnosi o autorizzazione al consumo." } });
    expect(documented.status(), await documented.text()).toBe(200);
    expect((await documented.json()).status).toBe("reviewed");
    const finalQueue = await contexts.assigned.request.get(base + "/api/admin/observations");
    expect(await finalQueue.text()).not.toContain(observation.id);
    const history = await contexts.author.request.get(base + "/api/observations");
    expect(await history.text()).toContain("reviewed");
    expect(await history.text()).toContain("nessuna diagnosi");
    const page = await contexts.assigned.newPage();
    await page.goto(base + "/admin/observations");
    await expect(page.getByRole("heading", { name: "Revisioni delle osservazioni" })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  } finally { for (const context of Object.values(contexts)) await context.close(); }
});

const readinessOrigin="http://127.0.0.1:8787";
async function readinessContext(browser,userId="readiness-student"){
 return browser.newContext({viewport:{width:375,height:812},extraHTTPHeaders:{...headers,"oai-authenticated-user-id":userId},reducedMotion:"reduce",serviceWorkers:"allow"});
}
test("student navigates 148 cards with tap and continuous scrolling",async({browser})=>{
 const context=await readinessContext(browser),page=await context.newPage();
 await page.goto(readinessOrigin+"/?tab=schede",{waitUntil:"domcontentloaded"});
 const panel=page.getByRole("tabpanel").filter({has:page.getByRole("heading",{name:"Schede per studio e confronto",exact:true})});
 const cards=panel.locator("button").filter({has:page.locator("h2")});
 await expect(cards).toHaveCount(148);await cards.first().click();
 const nav=page.getByRole("navigation",{name:"Navigazione delle schede"});
 await expect(nav.getByRole("status")).toHaveText("1 di 148");
 await expect(nav.getByRole("button",{name:/Scheda precedente/})).toBeDisabled();
 await nav.getByRole("button",{name:/Scheda successiva/}).click();await expect(nav.getByRole("status")).toHaveText("2 di 148");
 await nav.getByRole("button",{name:/Scheda precedente/}).click();await expect(nav.getByRole("status")).toHaveText("1 di 148");
 await expect(page.getByRole("region",{name:"Limiti del riconoscimento"})).toBeVisible();
 await nav.getByRole("button",{name:"Torna all’elenco"}).click();
 await page.getByRole("button",{name:"Studio con scrolling",exact:true}).click();
 await expect(panel.locator("article.scroll-mt-24")).toHaveCount(12);
 await page.getByRole("button",{name:"Continua lo studio · altre 12 schede",exact:true}).click();
 await expect(panel.locator("article.scroll-mt-24")).toHaveCount(24);
 expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);await context.close();
});
test("study self assessment persists separately per account",async({browser})=>{
 const context=await readinessContext(browser,"readiness-learning-user"),page=await context.newPage();
 await page.goto(readinessOrigin+"/studio",{waitUntil:"domcontentloaded"});
 await expect(page.getByTestId("learning-storage-status")).toContainText("Progresso locale caricato");
 await page.getByText("Glossario per questa lettura",{exact:true}).click();
 await expect(page.getByText(/Definizioni editoriali introduttive/)).toBeVisible();
 await page.getByRole("button",{name:"Ho dubbi: aggiungi al ripasso",exact:true}).click();
 await expect(page.getByTestId("learning-feedback")).toContainText("Argomento aggiunto al ripasso");
 await expect(page.getByTestId("learning-feedback")).toContainText("Fonte del confronto:");
 await page.getByRole("button",{name:"Segna argomento studiato",exact:true}).click();
 await expect(page.getByTestId("learning-counts")).toHaveText("1 argomenti studiati · 1 da ripassare");
 await page.reload({waitUntil:"domcontentloaded"});await expect(page.getByTestId("learning-counts")).toHaveText("1 argomenti studiati · 1 da ripassare");
 await page.getByLabel("Solo argomenti da ripassare").check();
 await page.getByLabel("Appunti dell’esercizio (solo per questa sessione)").fill("Ho confrontato i livelli richiesti con la pagina citata e discuterò le confusioni con il docente.");
 await page.getByRole("button",{name:"Ho confrontato: obiettivo chiaro",exact:true}).click();
 await expect(page.getByTestId("learning-counts")).toHaveText("1 argomenti studiati · 0 da ripassare");
 await expect(page.getByTestId("learning-feedback")).toContainText("Autoverifica registrata");
 await context.setExtraHTTPHeaders({...headers,"oai-authenticated-user-id":"readiness-other-account"});
 await page.reload({waitUntil:"domcontentloaded"});await expect(page.getByTestId("learning-counts")).toHaveText("0 argomenti studiati · 0 da ripassare");await context.close();
});
test("public reader opens in a fresh offline page without private caches",async({browser})=>{
 test.setTimeout(120000);
 const context=await readinessContext(browser,"readiness-offline-user"),page=await context.newPage();
 await page.goto(readinessOrigin+"/?tab=schede",{waitUntil:"domcontentloaded"});
 const library=page.locator('section[aria-label="Studio offline"]');
 await library.getByRole("button",{name:"Scarica pacchetto offline",exact:true}).click();
 await expect(library.getByRole("status")).toContainText("Pacchetto pronto: 148 schede",{timeout:105000});
 await page.goto(readinessOrigin+"/offline-reader.html",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#selection option")).toHaveCount(148);await page.locator("#next").click();
 const id=await page.locator("#selection").inputValue(),name=await page.locator("#card h2").innerText();
 await page.getByRole("button",{name:"Salva nei preferiti",exact:true}).click();
 await expect(page.getByRole("button",{name:"Rimuovi dai preferiti",exact:true})).toBeVisible();
 await page.close();await context.setOffline(true);
 const offline=await context.newPage();await offline.goto(readinessOrigin+"/offline-reader.html",{waitUntil:"domcontentloaded"});
 await expect(offline.locator("#card h2")).toHaveText(name);await expect(offline.locator("#selection")).toHaveValue(id);
 await offline.getByLabel("Solo preferiti").check();await expect(offline.locator("#selection option")).toHaveCount(1);
 await offline.getByRole("button",{name:"Riprendi ultima scheda",exact:true}).click();
 await expect(offline.getByLabel("Solo preferiti")).not.toBeChecked();await expect(offline.locator("#selection option")).toHaveCount(148);await expect(offline.locator("#selection")).toHaveValue(id);
 const paths=await offline.evaluate(async()=>{const paths=[];for(const name of await caches.keys()){const cache=await caches.open(name);for(const request of await cache.keys())paths.push(new URL(request.url).pathname);}return paths;});
 expect(paths).toContain("/offline-reader.html");expect(paths.filter(path=>path==="/"||/^\/(api|studio|admin|signin-with-chatgpt|signout-with-chatgpt|callback)(\/|$)/.test(path))).toEqual([]);
 expect(await horizontalOverflow(offline)).toBeLessThanOrEqual(1);await context.close();
});
test("study remains usable when local storage is denied",async({browser})=>{
 const context=await readinessContext(browser,"readiness-no-storage");
 await context.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException("Storage denied","SecurityError");};Storage.prototype.setItem=function(){throw new DOMException("Storage denied","SecurityError");};});
 const page=await context.newPage();await page.goto(readinessOrigin+"/studio",{waitUntil:"domcontentloaded"});
 await expect(page.getByTestId("learning-storage-status")).toContainText("Archivio del browser non disponibile");
 await page.getByRole("button",{name:"Ho dubbi: aggiungi al ripasso",exact:true}).click();
 await expect(page.getByTestId("learning-storage-status")).toContainText("Salvataggio non disponibile");
 await expect(page.getByTestId("learning-counts")).toHaveText("0 argomenti studiati · 1 da ripassare");
 await page.getByRole("button",{name:"Argomento successivo",exact:true}).click();await expect(page.getByTestId("learning-source")).toBeVisible();await context.close();
});
