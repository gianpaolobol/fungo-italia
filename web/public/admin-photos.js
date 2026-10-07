import { createAdminPhotoClient, prepareAdminPhoto, encryptAdminKey, decryptAdminKey } from './admin-photo-core.js';

const views = [['lateral', 'Laterale'], ['top', 'Sopra'], ['underside', 'Sotto']];
const taxa = new Map();
let client = null, active = false, busy = false, operation = null, photo = null, target = null, returnFocus = null;
const header = document.getElementById('admin-edit');
const dialog = document.createElement('dialog');
dialog.className = 'admin-photo-dialog';
dialog.setAttribute('aria-labelledby', 'admin-photo-title');
document.body.append(dialog);
const make = (tag, text, attrs = {}) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
function reportError(error, phase) { window.dispatchEvent(new CustomEvent('fungo:admin-error', { detail: { phase, name: error.name, message: error.message, status: error.status } })); }
function notice(text, bad = false) {
  const box = dialog.querySelector('[data-admin-status]');
  if (box) { box.textContent = text; box.classList.toggle('admin-photo-error', bad); }
}
function clearPhoto() {
  if (photo?.preview?.startsWith('blob:')) URL.revokeObjectURL(photo.preview);
  photo = null;
}
function closeDialog() {
  operation?.abort();
  clearPhoto();
  target = null;
  if (dialog.open) dialog.close();
  dialog.replaceChildren();
  if (returnFocus?.isConnected) returnFocus.focus();
  else document.querySelector('#detail[open] #close')?.focus();
}
function leave() {
  operation?.abort();
  operation = null;
  client?.dispose();
  client = null;
  active = false;
  busy = false;
  closeDialog();
  document.querySelectorAll('[data-admin-photo-control]').forEach(node => node.remove());
  if (header) { header.textContent = 'Modifica immagini'; header.setAttribute('aria-pressed', 'false'); }
  document.documentElement.classList.remove('admin-photo-active');
}
function show() {
  returnFocus = document.activeElement;
  dialog.showModal();
}
function formBase(title) {
  dialog.replaceChildren();
  const form = make('form');
  form.append(make('h2', title, { id: 'admin-photo-title' }));
  const status = make('p', '', { role: 'status', 'aria-live': 'polite', 'data-admin-status': '' });
  status.className = 'admin-photo-status';
  form.append(status);
  dialog.append(form);
  return form;
}
function field(form, label, input) {
  const wrap = make('label', label);
  wrap.className = 'admin-photo-field';
  wrap.append(input);
  form.append(wrap);
  return input;
}
function actions(form, submitLabel) {
  const row = make('div');
  row.className = 'admin-photo-actions';
  const cancel = make('button', 'Annulla', { type: 'button' });
  cancel.addEventListener('click', closeDialog);
  const submit = make('button', submitLabel, { type: 'submit' });
  row.append(cancel, submit);
  form.append(row);
  return submit;
}
function updateControls() {
  document.querySelectorAll('[data-admin-photo-control]').forEach(node => node.remove());
  if (!active) return;
  document.querySelectorAll('[data-reference-taxon]').forEach(gallery => {
    const taxon = taxa.get(gallery.dataset.referenceTaxon);
    if (!taxon) return;
    const figures = [...gallery.querySelectorAll('figure')];
    let row;
    views.forEach(([view, label], index) => {
      const button = make('button', 'Modifica ' + label.toLowerCase(), {
        type: 'button', 'data-admin-photo-control': '', 'data-admin-view': view, 'data-action': 'admin-photo-edit', 'data-view': view,
        'aria-label': 'Modifica foto ' + label.toLowerCase() + ' di ' + taxon.scientificName
      });
      button.className = 'admin-photo-change';
      button.disabled = busy;
      button.addEventListener('click', () => editPhoto(taxon, view, label));
      const figure = figures.find(node => node.dataset.referenceView === view);
      if (figure) figure.append(button);
      else {
        if (!row) {
          row = make('div', '', { 'data-admin-photo-control': '' });
          row.className = 'admin-photo-missing-controls';
          gallery.append(row);
        }
        row.append(button);
      }
    });
  });
}
function login() {
  if (dialog.open) return;
  const form = formBase('Modifica immagini');
  form.querySelector('[data-admin-status]').id = 'admin-login-error';
  let vault = null;
  try { vault = JSON.parse(localStorage.getItem('fungo-italia:admin-key:v1') || 'null'); } catch {}
  let secret, unlock, remember, password, confirm;
  if (vault) {
    unlock = field(form, 'Password amministratore',
      make('input', '', { id: 'admin-password-unlock', type: 'password', required: '', autocomplete: 'off', 'aria-label': 'Password amministratore' }));
    const reconnect = make('button', 'Collega di nuovo GitHub', { type: 'button' });
    reconnect.addEventListener('click', () => {
      try { localStorage.removeItem('fungo-italia:admin-key:v1'); } catch {}
      closeDialog(); login();
    });
    form.append(reconnect);
  } else {
    secret = field(form, 'Chiave amministratore GitHub',
      make('input', '', { id: 'admin-login-key', type: 'password', required: '', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', 'aria-label': 'Chiave amministratore GitHub' }));
    const help = make('p', 'Seleziona solo fungo-italia; Contents: lettura e scrittura. La chiave resta in memoria durante la sessione.');
    help.className = 'admin-photo-help';
    help.append(document.createTextNode(' '), make('a', 'Crea la chiave su GitHub', { href: 'https://github.com/settings/personal-access-tokens/new?name=Fungo%20Italia%20Foto&target_name=gianpaolobol&contents=write&expires_in=30', target: '_blank', rel: 'noopener noreferrer' }));
    form.append(help);
    remember = make('input', '', { id: 'admin-password-save', type: 'checkbox' });
    const saveLabel = make('label');
    saveLabel.className = 'admin-photo-rights';
    saveLabel.append(remember, document.createTextNode(' Usa una password su questo dispositivo'));
    form.append(saveLabel);
    password = field(form, 'Crea password (almeno 12 caratteri)',
      make('input', '', { id: 'admin-password-create', type: 'password', minlength: '12', autocomplete: 'new-password', disabled: '' }));
    confirm = field(form, 'Ripeti password',
      make('input', '', { id: 'admin-password-confirm', type: 'password', minlength: '12', autocomplete: 'new-password', disabled: '' }));
    password.parentElement.hidden = confirm.parentElement.hidden = true;
    remember.addEventListener('change', () => {
      password.parentElement.hidden = confirm.parentElement.hidden = !remember.checked;
      password.disabled = confirm.disabled = !remember.checked;
      password.required = confirm.required = remember.checked;
    });
  }
  const submit = actions(form, 'Accedi');
  submit.id = 'admin-login-submit';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    if (remember?.checked && password.value !== confirm.value) {
      notice('Le password non coincidono.', true); return;
    }
    busy = true;
    submit.disabled = true;
    const pending = new AbortController();
    operation = pending;
    let candidate = null;
    let key = '';
    try {
      notice('Verifica accesso…');
      key = vault ? await decryptAdminKey(vault, unlock.value) : secret.value.trim();
      candidate = createAdminPhotoClient(key);
      await candidate.authenticate({ signal: pending.signal });
      if (pending.signal.aborted || !form.isConnected) { candidate.dispose(); return; }
      if (remember?.checked) {
        const encrypted = await encryptAdminKey(key, password.value);
        if (pending.signal.aborted || !form.isConnected) { candidate.dispose(); return; }
        try { localStorage.setItem('fungo-italia:admin-key:v1', JSON.stringify(encrypted)); }
        catch { throw new Error('vault-storage'); }
      }
      client = candidate;
      active = true;
      busy = false;
      if (header) { header.textContent = 'Esci da modifica'; header.setAttribute('aria-pressed', 'true'); }
      document.documentElement.classList.add('admin-photo-active');
      closeDialog();
      updateControls();
    } catch (error) {
      reportError(error, 'login');
      candidate?.dispose();
      if (error.name !== 'AbortError') notice(vault ? 'Password o accesso GitHub non validi. Riprova o collega di nuovo GitHub.' : 'Accesso non riuscito. Verifica la chiave e i permessi sul repository.', true);
    } finally {
      key = '';
      if (secret) secret.value = '';
      if (unlock) unlock.value = '';
      if (password) password.value = '';
      if (confirm) confirm.value = '';
      busy = false;
      submit.disabled = false;
    }
  });
  show();
  (unlock || secret).focus();
}
function editPhoto(taxon, view, label) {
  if (!active || busy || dialog.open) return;
  target = { taxon, view };
  const form = formBase('Foto ' + label.toLowerCase() + ' · ' + taxon.scientificName);
  form.querySelector('[data-admin-status]').id = 'admin-photo-error';
  const picker = field(form, 'Scegli dalla libreria fotografica',
    make('input', '', { id: 'admin-photo-input', type: 'file', accept: 'image/*', required: '', 'aria-label': 'Scegli dalla libreria fotografica' }));
  const preview = make('img', '', { id: 'admin-photo-preview', alt: 'Anteprima della foto selezionata' });
  preview.className = 'admin-photo-preview';
  preview.hidden = true;
  form.append(preview);
  const subject = field(form, 'Specie raffigurata',
    make('input', '', { type: 'text', required: '', maxlength: '160', 'aria-label': 'Specie raffigurata' }));
  subject.value = taxon.referenceImages?.find(item => item.view === view)?.subjectTaxon || (taxon.scientificName.length <= 160 ? taxon.scientificName : taxon.scientificName.split(' ')[0]);
  const attribution = field(form, 'Autore della foto',
    make('input', '', { type: 'text', required: '', maxlength: '160', 'aria-label': 'Autore della foto' }));
  attribution.value = 'Gianpaolo Franceschini';
  const rights = make('label');
  rights.className = 'admin-photo-rights';
  const consent = make('input', '', { id: 'admin-photo-rights', type: 'checkbox', required: '', 'aria-label': 'Autorizzo la pubblicazione della foto' });
  rights.append(consent, document.createTextNode(' Ho il diritto di pubblicare questa foto e ne autorizzo la pubblicazione nell’atlante pubblico.'));
  form.append(rights);
  const submit = actions(form, 'Salva foto');
  submit.id = 'admin-photo-save';
  form.querySelector('button[type=button]').id = 'admin-photo-cancel';
  submit.disabled = true;
  let selection = 0;
  picker.addEventListener('change', async () => {
    const thisSelection = ++selection;
    operation?.abort();
    operation = new AbortController();
    clearPhoto();
    preview.removeAttribute('src');
    preview.hidden = true;
    submit.disabled = true;
    const preparation = operation;
    const file = picker.files?.[0];
    if (!file) return;
    try {
      notice('Preparazione foto…');
      const prepared = await prepareAdminPhoto(file, { signal: preparation.signal });
      if (thisSelection !== selection || preparation.signal.aborted || !active || !dialog.open || !form.isConnected) {
        if (prepared.preview?.startsWith('blob:')) URL.revokeObjectURL(prepared.preview);
        return;
      }
      photo = prepared;
      preview.src = prepared.preview;
      preview.hidden = false;
      submit.disabled = false;
      notice('Verrà sostituita solo la vista ' + label.toLowerCase() + '.');
    } catch (error) {
      if (error.name !== 'AbortError') notice('Foto non utilizzabile. Scegli un’immagine JPEG, PNG o un altro formato leggibile da Safari.', true);
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!active || busy || !photo || !target) return;
    busy = true;
    operation = new AbortController();
    const pending = operation, selectedPhoto = photo;
    [...form.elements].forEach(input => { if (input.id !== 'admin-photo-cancel') input.disabled = true; });
    updateControls();
    const currentClient = client;
    const { taxon: currentTaxon, view: currentView } = target;
    try {
      const result = await currentClient.savePhoto({
        taxon: { id: currentTaxon.id, scientificName: currentTaxon.scientificName, rank: currentTaxon.rank, kind: currentTaxon.kind },
        view: currentView, photo: selectedPhoto, subjectTaxon: subject.value.trim(),
        attribution: attribution.value.trim(), rightsConfirmed: consent.checked
      }, { signal: pending.signal, onStage: () => notice('Salvataggio su GitHub…') });
      if (!active || currentClient !== client || pending.signal.aborted || !form.isConnected) return;
      const detail = { taxonId: currentTaxon.id, view: currentView, asset: result.asset, commitSha: result.commitSha, photo: { bytes: selectedPhoto.bytes, width: selectedPhoto.width, height: selectedPhoto.height, sha: selectedPhoto.sha } };
      window.dispatchEvent(new CustomEvent('fungo:admin-photo-saved', { detail }));
      busy = false;
      closeDialog();
      updateControls();
      const status = document.getElementById('admin-photo-publication-status') || make('p', '', { id: 'admin-photo-publication-status', role: 'status' });
      status.className = 'admin-photo-publication-status';
      status.textContent = 'Foto salvata su GitHub. La pubblicazione del sito è in corso.';
      const host = document.querySelector('#detail[open] .dialog-body') || document.getElementById('main');
      if (!status.isConnected) host?.prepend(status);
    } catch (error) {
      reportError(error, 'save');
      if (error.name === 'AbortError') return;
      if (error.status === 401 || error.status === 403) {
        leave();
        login();
        notice('Sessione terminata. Verifica la chiave e accedi di nuovo.', true);
      } else notice('Salvataggio non riuscito. Nessuna conferma di pubblicazione: riprova.', true);
    } finally {
      busy = false;
      [...form.elements].forEach(input => { input.disabled = false; });
      updateControls();
    }
  });
  show();
  picker.focus();
}
header?.addEventListener('click', () => active ? leave() : login());
dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
window.addEventListener('fungo:atlas-ready', event => {
  const records = Array.isArray(event.detail) ? event.detail : event.detail?.taxa;
  if (Array.isArray(records)) records.forEach(taxon => taxa.set(taxon.id, taxon));
  updateControls();
});
window.addEventListener('fungo:atlas-render', updateControls);
window.addEventListener('pagehide', leave);
window.addEventListener('pageshow', event => { if (event.persisted) leave(); });

window.dispatchEvent(new CustomEvent('fungo:request-atlas'));
