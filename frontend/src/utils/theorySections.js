/**
 * Группирует плоские theory_blocks в мини-главы: абзацы (concept/principle/example),
 * затем коллауты (tip/warning). Новая глава начинается после коллаутов, когда снова идёт абзац.
 */
export function groupTheoryBlocks(blocks = []) {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];

  const sections = [];
  let current = { title: null, paragraphs: [], callouts: [] };

  function flush() {
    if (current.paragraphs.length === 0 && current.callouts.length === 0) return;
    sections.push({
      title: current.title,
      paragraphs: [...current.paragraphs],
      callouts: [...current.callouts],
    });
    current = { title: null, paragraphs: [], callouts: [] };
  }

  for (const block of blocks) {
    const t = block.type;
    if (t === 'tip' || t === 'warning') {
      current.callouts.push({ kind: t, text: block.text });
    } else {
      if (current.callouts.length > 0) flush();
      current.paragraphs.push({ type: t, text: block.text });
    }
  }
  flush();
  return sections;
}

export function getTheorySectionsFromLesson(meta) {
  const snap = meta?.atomic_snapshot;
  if (snap?.theory_sections?.length) return snap.theory_sections;
  if (snap?.theory_blocks?.length) return groupTheoryBlocks(snap.theory_blocks);
  return [];
}

export function getPitfalls(meta) {
  const mistakes = meta?.atomic_snapshot?.common_mistakes ?? meta?.common_mistakes ?? [];
  const tip = meta?.atomic_snapshot?.pro_tip ?? meta?.pro_tip ?? null;
  const list = Array.isArray(mistakes) ? mistakes.filter((m) => typeof m === 'string' && m.trim()) : [];
  const tipStr = tip != null && String(tip).trim() ? String(tip).trim() : null;
  return { mistakes: list, tip: tipStr };
}

export function paragraphPrefix(type) {
  if (type === 'example') return '📖 ';
  return '';
}
