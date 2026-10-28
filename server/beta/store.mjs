const DAY=86400000;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
export async function hashSecret(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
function randomToken(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
const iso=ms=>ms===null?null:new Date(ms).toISOString();
function publicGrant(r,now){return{id:r.id,email:r.email,createdAt:iso(r.created_at),activatedAt:iso(r.activated_at),expiresAt:iso(r.expires_at),inviteExpiresAt:iso(r.invite_expires_at),version:r.version,status:r.revoked_at!==null?'revoked':r.expires_at!==null&&r.expires_at<=now?'expired':r.activated_at===null?'invited':'active'};}
export function createBetaStore({db,clock=Date.now}){
 const one=(sql,...args)=>db.prepare(sql).bind(...args).first();
 const run=(sql,...args)=>db.prepare(sql).bind(...args).run();
 const status=(r,now)=>r&&r.revoked_at===null&&r.expires_at>now?{active:true,grantId:r.id,expiresAt:iso(r.expires_at),serverNow:iso(now),maxAgeSeconds:60}:{active:false,expiresAt:null,serverNow:iso(now),maxAgeSeconds:0};
 return{
  async invite({email}){
   if(typeof email!=='string'||email.length>254||/[\r\n\x00-\x1f\x7f]/.test(email))throw Error('Email non valida');
   email=email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Email non valida');
   const now=clock(),token=randomToken(),hash=await hashSecret(token),id=crypto.randomUUID();
   const r=await one(`INSERT INTO beta_grants(id,email,invite_hash,invite_expires_at,created_at,updated_at)
    VALUES(?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET invite_hash=excluded.invite_hash,invite_expires_at=excluded.invite_expires_at,session_hash=NULL,revoked_at=NULL,updated_at=excluded.updated_at,version=beta_grants.version+1
    WHERE beta_grants.expires_at IS NULL OR beta_grants.expires_at>excluded.updated_at RETURNING *`,id,email,hash,now+7*DAY,now,now);
   if(!r)throw Error('Beta scaduta: impostare prima una nuova scadenza');
   return{...publicGrant(r,now),inviteToken:token};
  },
  async redeem({inviteToken}){
   if(typeof inviteToken!=='string'||!TOKEN.test(inviteToken))throw Error('Invito non valido o scaduto');
   const now=clock(),token=randomToken(),ih=await hashSecret(inviteToken),sh=await hashSecret(token);
   const r=await one(`UPDATE beta_grants SET invite_hash=NULL,invite_expires_at=NULL,session_hash=?,activated_at=COALESCE(activated_at,?),expires_at=COALESCE(expires_at,?),updated_at=?,version=version+1
    WHERE invite_hash=? AND invite_expires_at>? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>?) RETURNING *`,sh,now,now+90*DAY,now,ih,now,now);
   if(!r)throw Error('Invito non valido o scaduto');return{...status(r,now),sessionToken:token};
  },
  async check({sessionToken}){
   const now=clock();if(typeof sessionToken!=='string'||!TOKEN.test(sessionToken))return status(null,now);
   return status(await one('SELECT id,expires_at,revoked_at FROM beta_grants WHERE session_hash=?',await hashSecret(sessionToken)),now);
  },
  async logout({sessionToken}){if(typeof sessionToken==='string'&&TOKEN.test(sessionToken))await run('UPDATE beta_grants SET session_hash=NULL,updated_at=?,version=version+1 WHERE session_hash=?',clock(),await hashSecret(sessionToken));return{ok:true};},
  async list({cursor='',limit=50}={}){
   if(typeof cursor!=='string'||cursor.length>100||!Number.isInteger(limit)||limit<1||limit>100)throw Error('Paginazione non valida');
   const rows=(await db.prepare('SELECT * FROM beta_grants WHERE id>? ORDER BY id LIMIT ?').bind(cursor,limit+1).all()).results;
   return{items:rows.slice(0,limit).map(r=>publicGrant(r,clock())),cursor:rows.length>limit?rows[limit-1].id:null};
  },
  async revoke({grantId,expectedVersion}){
   const now=clock();const r=await one('UPDATE beta_grants SET revoked_at=?,session_hash=NULL,invite_hash=NULL,invite_expires_at=NULL,updated_at=?,version=version+1 WHERE id=? AND version=? RETURNING *',now,now,grantId,expectedVersion);
   if(!r)throw Error('Conflitto: aggiorna la lista');return publicGrant(r,now);
  },
  async extend({grantId,expiresAt,expectedVersion}){
   const now=clock(),expiry=Date.parse(expiresAt);if(typeof expiresAt!=='string'||!Number.isFinite(expiry)||expiry<=now)throw Error('Scadenza non valida');
   // A changed date does not cancel a revocation: reactivation needs a new explicit invite.
   const r=await one('UPDATE beta_grants SET expires_at=?,updated_at=?,version=version+1 WHERE id=? AND version=? RETURNING *',expiry,now,grantId,expectedVersion);
   if(!r)throw Error('Conflitto: aggiorna la lista');return publicGrant(r,now);
  },
  async revokeAll(){const now=clock();await run('UPDATE beta_grants SET revoked_at=?,session_hash=NULL,invite_hash=NULL,invite_expires_at=NULL,updated_at=?,version=version+1 WHERE revoked_at IS NULL',now,now);return{ok:true};},
  async takeRate(key,limit){
   const window=Math.floor(clock()/60000),id=await hashSecret(key);
   const r=await one('INSERT INTO beta_rates(id,window,hits) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET window=excluded.window,hits=CASE WHEN beta_rates.window=excluded.window THEN beta_rates.hits+1 ELSE 1 END RETURNING hits',id,window);
   return r.hits<=limit;
  },
 };
}
