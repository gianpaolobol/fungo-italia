import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gradeResponse} from '../web/public/exam-core.js';
import * as ui from '../web/public/exam-ui.js';
const c={id:'oreades',name:'Marasmius oreades',acceptedNames:['Marasmius oreades'],category:'free',detailKind:null};
test('correct identification and wrong edibility have separate colors and a correction',()=>{
 const r={answer:{name:c.name,category:'toxic',choices:{}},grade:gradeResponse(c,{name:c.name,category:'toxic'},[c])};
 assert.equal(r.grade.name,true);assert.equal(r.grade.category,false);
 assert.equal(typeof ui.answerFeedbackHtml,'function');
 const html=ui.answerFeedbackHtml(c,r,[c]);
 assert.match(html,/color:#166534[^>]*><strong>Nome/);
 assert.match(html,/color:#b91c1c[^>]*><strong>Commestibilità/);
 assert.match(html,/Risposta corretta:<\/strong> libera/);
});
