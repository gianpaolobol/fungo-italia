# Pilota docenti-studenti: perimetro approvato e vincolo gratuito

Il 31 ottobre 2026 il titolare ha approvato in conversazione un corso, un docente,
due gruppi, massimo 30 studenti e quattro settimane, subordinando spazio ed email
a servizi gratuiti. Ha poi chiesto di risolvere la continuità del piano gratuito
come task esplicito e di procedere su un ramo dedicato.

Specifica funzionale: `2026-10-30-courses-groups-materials-design.md` (PR144).
Questo addendum prevale dove restringe il pilot: 20 MB/PDF, 1 GB materiali attivi,
nessun acquisto o passaggio automatico a pagamento. PDF dinamici per gruppo;
destinatari dei test congelati, revoche correnti; corsi indipendenti da StoreKit.
Un tentativo online, 1–15 casi genere/genere+specie, correzione server e rilascio
docente. La banca scientifica non si amplia. Nessuna modifica alle beta attuali.

## Continuità: requisito bloccante P0-CONTINUITY

Controllo esterno al progetto Supabase ogni sei ore, con lettura effettiva dal
database, timeout, ritentativi limitati ed errori visibili. Stato conservato fuori
dal database monitorato; riepilogo settimanale e allarme per guasti persistenti,
deduplicazione. Controllo separato di freschezza del monitor e procedura di
riattivazione/restore. Non affermare che un ping impedisce certamente la pausa:
il provider non garantisce tale comportamento sul piano Free.

Il task non è chiuso finché mancano deployment gratuito, credenziali dedicate,
prova reale del percorso DB, avvisi ricevuti, prova guasto/recupero e osservazione
di almeno otto giorni. Rilasci e platea restano bloccati se la continuità non è
qualificata. Nessun invio reale o servizio a consumo attivato da questo documento.

## Configurazione candidata

Supabase Free (identità/database); Backblaze B2 (10 GB gratuiti, archivio privato)
tramite Cloudflare per download; Brevo Free (300 email/giorno); Workers Free per
monitor esterno e consegna privata. Versioni e backup contano nelle quote.
Questa combinazione richiede verifica negli account reali, inclusa disponibilità
regione, quote condivise, autorizzazioni e comportamento senza pagamento.

## Sequenza di incrementi

1. Continuità esterna e fondazione autorizzazioni corsi/materiali, testabili senza
   alterare app, dati scientifici o pipeline esistenti.
2. Inviti, upload/scansione e prima consultazione PDF app+pannello.
3. Editor, runner remoto, correzione, consegne e risultati.
4. Push, backup/restore, qualifica dispositivi e pilot reale.

L'incremento 1 non equivale al pilot completo. Gli incrementi seguenti e il
deployment richiedono configurazione dei servizi, non un'autorizzazione economica
implicita. Nessuna promessa di disponibilità garantita sul piano gratuito.

## Integrazione differita con app in evoluzione (richiesta del titolare)

L'app attuale riceverà altre correzioni. Il modulo corsi espone contratti
versionati e non incorpora copie di App.tsx, PhotoExam, billing o storico locale.
Prima dell'integrazione si acquisisce lo SHA scelto dal titolare, si aggiorna il
ramo con merge/rebase selettivo e si verificano navigazione, demo/StoreKit, dati
locali e compatibilità API. Mai ripristinare file vecchi per integrare il modulo.
Modifiche scientifiche, librerie native e distribuzione rimangono gate separati.
