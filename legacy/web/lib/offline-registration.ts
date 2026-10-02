export async function prepareOfflineReader(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) throw new Error("Questo browser non supporta il lettore offline.");
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Il lettore offline non è disponibile. Controlla la connessione e riprova.")), 15000);
    navigator.serviceWorker.ready.then(registration => { window.clearTimeout(timeout); resolve(registration); }, error => { window.clearTimeout(timeout); reject(error); });
  });
}
export async function cachePackageImages(registration: ServiceWorkerRegistration, images: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const worker = registration.active;
    if (!worker) { reject(new Error("Lettore offline non ancora attivo. Riprova.")); return; }
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => { channel.port1.close(); reject(new Error("Download non completato. Riprova con una connessione stabile.")); }, 90000);
    channel.port1.onmessage = event => {
      window.clearTimeout(timeout); channel.port1.close();
      const value: unknown = event.data;
      if (!value || typeof value !== "object") { reject(new Error("Risposta del lettore offline non valida.")); return; }
      const packet = value as Record<string, unknown>;
      if (!packet.ok) reject(new Error("Immagini non scaricate. Il pacchetto precedente è conservato."));
      else if (Array.isArray(packet.cached) && packet.cached.every((path: unknown) => typeof path === "string" && images.includes(path))) resolve(packet.cached as string[]);
      else reject(new Error("Risposta del lettore offline non valida."));
    };
    worker.postMessage({ type: "CACHE_STUDY_IMAGES", images }, [channel.port2]);
  });
}
