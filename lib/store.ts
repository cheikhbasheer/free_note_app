'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Etablissement,
  Classe,
  Eleve,
  ModeleBulletin,
  SessionNotes,
  NoteEleve,
} from './types';
import { generateId, currentISODate } from './utils';

interface AppStore {
  etablissement: Etablissement | null;
  classes: Classe[];
  modeles: ModeleBulletin[];
  sessions: SessionNotes[];

  // Établissement
  setEtablissement: (e: Etablissement) => void;

  // Classes
  addClass: (c: Omit<Classe, 'id' | 'createdAt' | 'eleves' | 'archived'>) => string;
  updateClasse: (id: string, updates: Partial<Classe>) => void;
  deleteClasse: (id: string) => void;
  archiveClasse: (id: string) => void;

  // Élèves
  addEleve: (classeId: string, eleve: Omit<Eleve, 'id'>) => void;
  updateEleve: (classeId: string, eleveId: string, updates: Partial<Eleve>) => void;
  deleteEleve: (classeId: string, eleveId: string) => void;
  importEleves: (classeId: string, eleves: Omit<Eleve, 'id'>[]) => void;

  // Modèles
  addModele: (m: Omit<ModeleBulletin, 'id' | 'createdAt'>) => string;
  updateModele: (id: string, updates: Partial<ModeleBulletin>) => void;
  deleteModele: (id: string) => void;
  duplicateModele: (id: string) => string;

  // Sessions de notes
  addSession: (s: Omit<SessionNotes, 'id' | 'dateCreation' | 'dateModification'>) => string;
  updateSession: (id: string, updates: Partial<SessionNotes>) => void;
  deleteSession: (id: string) => void;
  updateNotes: (sessionId: string, notes: NoteEleve[]) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      etablissement: null,
      classes: [],
      modeles: [],
      sessions: [],

      setEtablissement: (e) => set({ etablissement: e }),

      addClass: (data) => {
        const id = generateId();
        const classe: Classe = {
          ...data,
          id,
          eleves: [],
          archived: false,
          createdAt: currentISODate(),
        };
        set((s) => ({ classes: [...s.classes, classe] }));
        return id;
      },

      updateClasse: (id, updates) =>
        set((s) => ({
          classes: s.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteClasse: (id) =>
        set((s) => ({ classes: s.classes.filter((c) => c.id !== id) })),

      archiveClasse: (id) =>
        set((s) => ({
          classes: s.classes.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
        })),

      addEleve: (classeId, eleve) => {
        const newEleve: Eleve = { ...eleve, id: generateId() };
        set((s) => ({
          classes: s.classes.map((c) =>
            c.id === classeId ? { ...c, eleves: [...c.eleves, newEleve] } : c
          ),
        }));
      },

      updateEleve: (classeId, eleveId, updates) =>
        set((s) => ({
          classes: s.classes.map((c) =>
            c.id === classeId
              ? { ...c, eleves: c.eleves.map((e) => (e.id === eleveId ? { ...e, ...updates } : e)) }
              : c
          ),
        })),

      deleteEleve: (classeId, eleveId) =>
        set((s) => ({
          classes: s.classes.map((c) =>
            c.id === classeId ? { ...c, eleves: c.eleves.filter((e) => e.id !== eleveId) } : c
          ),
        })),

      importEleves: (classeId, eleves) => {
        const newEleves: Eleve[] = eleves.map((e) => ({ ...e, id: generateId() }));
        set((s) => ({
          classes: s.classes.map((c) =>
            c.id === classeId ? { ...c, eleves: [...c.eleves, ...newEleves] } : c
          ),
        }));
      },

      addModele: (data) => {
        const id = generateId();
        const modele: ModeleBulletin = { ...data, id, createdAt: currentISODate() };
        set((s) => ({ modeles: [...s.modeles, modele] }));
        return id;
      },

      updateModele: (id, updates) =>
        set((s) => ({
          modeles: s.modeles.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteModele: (id) =>
        set((s) => ({ modeles: s.modeles.filter((m) => m.id !== id) })),

      duplicateModele: (id) => {
        const src = get().modeles.find((m) => m.id === id);
        if (!src) return '';
        const newId = generateId();
        const copy: ModeleBulletin = {
          ...src,
          id: newId,
          nom: `${src.nom} (copie)`,
          createdAt: currentISODate(),
        };
        set((s) => ({ modeles: [...s.modeles, copy] }));
        return newId;
      },

      addSession: (data) => {
        const id = generateId();
        const now = currentISODate();
        const session: SessionNotes = {
          ...data,
          id,
          dateCreation: now,
          dateModification: now,
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return id;
      },

      updateSession: (id, updates) =>
        set((s) => ({
          sessions: s.sessions.map((s2) =>
            s2.id === id ? { ...s2, ...updates, dateModification: currentISODate() } : s2
          ),
        })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),

      updateNotes: (sessionId, notes) =>
        set((s) => ({
          sessions: s.sessions.map((s2) =>
            s2.id === sessionId
              ? { ...s2, notes, dateModification: currentISODate() }
              : s2
          ),
        })),
    }),
    {
      name: 'bulletins-app-storage',
    }
  )
);

// Helpers
export const getClasse = (id: string) => useStore.getState().classes.find((c) => c.id === id);
export const getModele = (id: string) => useStore.getState().modeles.find((m) => m.id === id);
export const getSession = (id: string) => useStore.getState().sessions.find((s) => s.id === id);
