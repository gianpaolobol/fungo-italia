var fields = [['characters', 'Caratteri della scheda', 'characters'], ['habitat', 'Habitat riportato', 'habitat'], ['sporePrint', 'Sporata riportata', 'studyProfile.sporePrint.label'], ['odor', 'Odore riportato', 'studyProfile.odor'], ['curriculumObjective', 'Obiettivo richiesto dal programma', 'curriculumObjective']];
var foodLabels = {
  free: 'Commestibile',
  conditional: 'Commestibile dopo trattamenti',
  discouraged: 'Sconsigliato',
  'no-food-value': 'Privo di valore alimentare',
  inedible: 'Non commestibile',
  toxic: 'Tossico',
  deadly: 'Tossico potenzialmente mortale',
  mixed: 'Giudizio variabile: distinguere i taxa'
};
var guideId = 'S2-guida-ragionata-commestibilita-2021';
var value = (taxon, field) => field === 'characters' ? taxon.characters?.join('\n') : field === 'habitat' ? taxon.habitat?.join('\n') : field === 'sporePrint' ? taxon.studyProfile?.sporePrint?.label : field === 'odor' ? taxon.studyProfile?.odor : taxon.curriculumObjective;
var hash = text => {
  var h = 2166136261;
  for (var ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};
function foodQuestions(taxon) {
  var food = taxon.studyProfile?.edibility,
    evidence = (taxon.edibilityEvidence || []).filter(e => e.sourceId === guideId && Number.isInteger(e.page) && e.page > 0 && e.page <= 182);
  if (!foodLabels[food?.category] || !evidence.length) return [];
  var provenance = (field, answer) => ({
    taxonId: taxon.id,
    canonicalField: field,
    contentHash: String(hash(answer)),
    sourceIds: [guideId],
    guidePages: [...new Set(evidence.map(e => e.page))],
    reviewScope: 'canonical-study-material'
  });
  var category = {
    id: 'edibility',
    title: 'Commestibilità / tossicità — secondo la scheda «' + taxon.scientificName + '»',
    multiple: false,
    options: Object.entries(foodLabels).map(([id, label]) => ({
      id,
      label
    })),
    correct: [food.category],
    provenance: provenance('studyProfile.edibility.category', food.category)
  };
  var result = [category];
  // Ask only documented prescriptions and only the syndrome of a toxic/deadly taxon.
  var _loop = function (id) {
    if (!answer) return 1; // continue
    var options = [{
      id: 'documented',
      label: answer
    }, {
      id: 'absent',
      label: 'Nessuna ' + (id === 'syndrome' ? 'sindrome indicata' : 'prescrizione di trattamento') + ' nella scheda'
    }, {
      id: 'universal',
      label: id === 'syndrome' ? 'La stessa sindrome per tutte le specie del genere' : 'Il solo congelamento sostituisce i trattamenti richiesti'
    }];
    result.push({
      id,
      title: title + ' — secondo la scheda «' + taxon.scientificName + '»',
      multiple: false,
      options: options.sort((a, b) => hash(taxon.id + id + a.id) - hash(taxon.id + id + b.id)),
      correct: ['documented'],
      provenance: provenance(field, answer)
    });
  };
  for (var [id, title, field, answer] of [['preparation', 'Trattamenti richiesti', 'studyProfile.edibility.precautions', food.category === 'conditional' && food.precautions?.length ? food.precautions.join('\n') : null], ['syndrome', 'Sindrome riportata', 'studyProfile.edibility.syndrome.label', ['toxic', 'deadly'].includes(food.category) ? food.syndrome?.label : null]]) {
    if (_loop(id)) continue;
  }
  return result;
}
export function buildCurriculumBank(minimum, extended, photo) {
  var taxa = [...minimum, ...extended],
    photographic = new Set(photo.map(t => t.id)),
    minimumIds = new Set(minimum.map(t => t.id));
  var scope = t => t.curriculum?.level ? t.curriculum.level === 'minimum' ? 'minimum' : 'extended' : minimumIds.has(t.id) ? 'minimum' : 'extended';
  var makePool = rows => new Map(fields.map(([field]) => [field, [...new Set(rows.map(t => value(t, field)).filter(v => typeof v === 'string' && v.trim()))].map(label => ({
    label,
    id: String(hash(field + label))
  }))]));
  var minimumPool = makePool(taxa.filter(t => scope(t) === 'minimum')),
    extendedPool = makePool(taxa);
  return taxa.filter(t => !photographic.has(t.id)).map(t => {
    var pool = scope(t) === 'minimum' ? minimumPool : extendedPool;
    var questions = fields.flatMap(([field, title, canonicalField]) => {
      var answer = value(t, field);
      if (typeof answer !== 'string' || !answer.trim()) return [];
      var alternatives = pool.get(field).filter(o => o.label !== answer).map(o => ({
        ...o,
        order: hash(t.id + field + o.id)
      })).sort((a, b) => a.order - b.order).slice(0, 3);
      if (alternatives.length < 2) return [];
      var options = [{
        id: String(hash(field + answer)),
        label: answer
      }, ...alternatives.map(({
        id,
        label
      }) => ({
        id,
        label
      }))].sort((a, b) => hash(t.id + a.id) - hash(t.id + b.id));
      return [{
        id: field,
        title: title + ' — secondo la scheda «' + t.scientificName + '»',
        multiple: false,
        options,
        correct: options.filter(o => o.label === answer).map(o => o.id),
        provenance: {
          taxonId: t.id,
          canonicalField,
          contentHash: String(hash(answer)),
          sourceIds: field === 'curriculumObjective' ? [t.curriculum.documentId] : [...new Set((t.sources || []).filter(s => s.fields?.includes(field)).map(s => s.sourceId))],
          ...(field === 'curriculumObjective' ? {
            sourcePages: [t.curriculum.sourcePage]
          } : {}),
          reviewScope: 'canonical-study-material'
        }
      }];
    });
    questions.push(...foodQuestions(t));
    if (!questions.length) throw Error('Nessuna domanda documentabile per ' + t.id);
    var coursePhotos = (t.courseImages || []).map(({
      src,
      view,
      credit,
      subjectTaxon,
      sourceId,
      caseId
    }) => ({
      src,
      view,
      credit,
      subjectTaxon,
      sourceId,
      caseId
    }));
    return {
      id: t.id,
      name: t.scientificName,
      acceptedNames: [t.scientificName],
      category: '',
      detailKind: 'curriculum',
      questionKind: 'profile',
      scope: scope(t),
      preparation: [],
      syndrome: null,
      photos: [],
      ...(coursePhotos.length ? {
        coursePhotos
      } : {}),
      questions
    };
  });
}
