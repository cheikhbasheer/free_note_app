import type { Domaine, Matiere, ModeleBulletin, NoteEleve } from './types';

export function getAllMatieres(modele: ModeleBulletin): Matiere[] {
  const matieres: Matiere[] = [];
  for (const domaine of modele.domaines) {
    for (const sousDomaine of domaine.sousDomaines) {
      matieres.push(...sousDomaine.matieres);
    }
  }
  return matieres;
}

export function getTotalMax(modele: ModeleBulletin): number {
  return getAllMatieres(modele).reduce((sum, m) => sum + m.bareme, 0);
}

export function calculateNoteTotal(noteEleve: NoteEleve, matieres: Matiere[]): number {
  let total = 0;
  for (const matiere of matieres) {
    const nm = noteEleve.notes.find((n) => n.matiereId === matiere.id);
    if (nm && nm.valeur !== null && nm.valeur !== undefined) {
      total += nm.valeur;
    }
  }
  return total;
}

export function calculateMoyenne(total: number, totalMax: number): number {
  if (totalMax === 0) return 0;
  return Math.round((total / totalMax) * 10 * 100) / 100;
}

export function calculateResults(notes: NoteEleve[], modele: ModeleBulletin): NoteEleve[] {
  const matieres = getAllMatieres(modele);
  const totalMax = getTotalMax(modele);

  const withTotals = notes.map((ne) => {
    const total = calculateNoteTotal(ne, matieres);
    const moyenne = calculateMoyenne(total, totalMax);
    return {
      ...ne,
      total,
      totalMax,
      moyenne,
      statut: (moyenne >= modele.seuilAdmission ? 'Admis' : 'Ajourné') as 'Admis' | 'Ajourné',
    };
  });

  // Sort by total descending for ranking
  const sorted = [...withTotals].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));

  // Assign ranks with ex æquo
  const ranksMap = new Map<string, number>();
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total === sorted[i - 1].total) {
      ranksMap.set(sorted[i].eleveId, ranksMap.get(sorted[i - 1].eleveId)!);
    } else {
      ranksMap.set(sorted[i].eleveId, currentRank);
    }
    currentRank++;
  }

  return withTotals.map((ne) => ({
    ...ne,
    rang: ranksMap.get(ne.eleveId),
  }));
}

export function formatMoyenne(moyenne: number | undefined): string {
  if (moyenne === undefined || moyenne === null) return '-';
  return moyenne.toFixed(2);
}

export function formatNote(valeur: number | null | undefined, bareme: number): string {
  if (valeur === null || valeur === undefined) return '-';
  return `${valeur}/${bareme}`;
}

export function getMatieresByDomaine(domaines: Domaine[]): Record<string, Matiere[]> {
  const result: Record<string, Matiere[]> = {};
  for (const domaine of domaines) {
    result[domaine.id] = [];
    for (const sd of domaine.sousDomaines) {
      result[domaine.id].push(...sd.matieres);
    }
  }
  return result;
}

export function getStatistiques(notes: NoteEleve[]) {
  const withMoyenne = notes.filter((n) => n.moyenne !== undefined);
  if (withMoyenne.length === 0) {
    return { moyenneClasse: 0, admis: 0, ajournes: 0, meilleureMoyenne: 0, moyenneMin: 0 };
  }
  const moyennes = withMoyenne.map((n) => n.moyenne!);
  const admis = notes.filter((n) => n.statut === 'Admis').length;
  return {
    moyenneClasse: Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 100) / 100,
    admis,
    ajournes: notes.length - admis,
    meilleureMoyenne: Math.max(...moyennes),
    moyenneMin: Math.min(...moyennes),
  };
}
