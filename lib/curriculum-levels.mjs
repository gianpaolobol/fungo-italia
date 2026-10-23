export function curriculumItemsForLevel(taxa, level = 'minimum') {
  var allowed = level === 'minimum' ? ['minimum'] : level === 'desirable' ? ['minimum', 'desirable'] : ['minimum', 'desirable', 'advanced'];
  return taxa.filter(t => allowed.includes(t.curriculum?.level || 'minimum'));
}
