export interface Etablissement {
  id: string;
  nom: string;
  pays: string;
  academie: string;
  ia: string;
  ief: string;
  anneeScolaire: string;
  logo?: string; // base64
  signatureEnseignant?: string; // base64
  signatureDirecteur?: string; // base64
  cachet?: string; // base64
}

export type TypeBulletin = 'trimestriel' | 'semestriel' | 'examen' | 'personnalise';
export type TemplateBulletin = 'classique' | 'moderne' | 'detaille' | 'examen';

export interface SousNote {
  id: string;
  nom: string;
  bareme: number;
}

export interface Matiere {
  id: string;
  nom: string;
  bareme: number;
  coefficient: number;
  sousNotes?: SousNote[];
}

export interface SousDomaine {
  id: string;
  nom: string;
  matieres: Matiere[];
}

export interface Domaine {
  id: string;
  nom: string;
  sousDomaines: SousDomaine[];
}

export interface ModeleBulletin {
  id: string;
  nom: string;
  type: TypeBulletin;
  domaines: Domaine[];
  seuilAdmission: number;
  afficherRang: boolean;
  afficherSignatures: boolean;
  formatPDF: 'A4_portrait' | 'A4_paysage';
  template: TemplateBulletin;
  createdAt: string;
}

export interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  dateNaissance?: string;
  sexe?: 'M' | 'F';
  matricule?: string;
}

export interface AnneeScolaire {
  libelle: string;
  active: boolean;
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  enseignant: string;
  anneeScolaire: string;
  eleves: Eleve[];
  archived: boolean;
  createdAt: string;
}

export interface NoteMatiere {
  matiereId: string;
  valeur: number | null;
  sousNotes?: Record<string, number | null>;
}

export interface NoteEleve {
  eleveId: string;
  notes: NoteMatiere[];
  appreciation?: string;
  total?: number;
  totalMax?: number;
  moyenne?: number;
  rang?: number;
  statut?: 'Admis' | 'Ajourné';
}

export interface SessionNotes {
  id: string;
  classeId: string;
  modeleBulletinId: string;
  anneeScolaire: string;
  periode: string;
  dateCreation: string;
  dateModification: string;
  notes: NoteEleve[];
  statut: 'brouillon' | 'finalise';
}

export interface ResultatEleve {
  eleve: Eleve;
  noteEleve: NoteEleve;
}
