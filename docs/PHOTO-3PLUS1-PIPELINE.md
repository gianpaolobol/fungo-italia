# Popolamento fotografico 3+1

## Regola di pubblicazione

Una fotografia entra in una scheda dell'Atlante solo quando:
1. appartiene a un'osservazione privata;
2. è stata selezionata tra gli scatti più informativi;
3. il taxon associato ha tre caratteri diagnostici compilati;
4. è presente il carattere di conferma;
5. la revisione è valida;
6. la fotografia è marcata `approved`.

Le coordinate precise non sono mai incluse nell'export pubblico. Restano nello storage privato del dispositivo e sono leggibili soltanto secondo la policy proprietario/admin.

## Flusso iPhone

`Foto iOS → indice metadata → cluster temporali → ranking scatti → GPS/EXIF candidati → coda 3+1 → revisione → approvazione foto → scheda Atlante`.

Il riconoscimento Visual Look Up mostrato dall'app Foto di Apple non è trattato come dato leggibile automaticamente finché non esiste un'API pubblica supportata che lo esponga.

## Stato

La pipeline software è predisposta. Il popolamento con fotografie reali richiede l'esecuzione della build fisica iOS e il consenso dell'utente alla libreria Foto.
