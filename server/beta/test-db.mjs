import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function testDb(path=':memory:'){
 const sqlite=new DatabaseSync(path);
 sqlite.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const db={prepare(sql){let args=[];return{bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args)??null;},async all(){return{results:sqlite.prepare(sql).all(...args)};},async run(){return{meta:sqlite.prepare(sql).run(...args)};}};},close(){sqlite.close();},sqlite};
 return db;
}
