import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function currentISODate(): string {
  return new Date().toISOString();
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .toUpperCase();
}

export function buildPDFFileName(nom: string, prenom: string, periode: string, annee: string): string {
  return `${sanitizeFileName(nom)}_${sanitizeFileName(prenom)}_BULLETIN_${sanitizeFileName(periode)}_${sanitizeFileName(annee)}.pdf`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    trimestriel: 'Trimestriel',
    semestriel: 'Semestriel',
    examen: 'Examen',
    personnalise: 'Personnalisé',
  };
  return labels[type] || type;
}

export function getTemplateLabel(template: string): string {
  const labels: Record<string, string> = {
    classique: 'Classique institutionnel',
    moderne: 'Moderne sobre',
    detaille: 'Tableau détaillé',
    examen: 'Examen / Classement',
  };
  return labels[template] || template;
}

export function ordinalFr(n: number): string {
  if (n === 1) return '1er';
  return `${n}e`;
}

export function niveauxScolaires(): string[] {
  return [
    'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    '2nde', '1ère', 'Terminale',
    'Préscolaire',
    'Autre',
  ];
}
