'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { calculateResults, getAllMatieres, getTotalMax } from '@/lib/calculations';
import { generateId } from '@/lib/utils';
import type { NoteEleve, NoteMatiere, SessionNotes } from '@/lib/types';
import {
  ArrowLeft, Save, FileDown, Check, AlertCircle, ChevronDown,
  RefreshCw, Calculator
} from 'lucide-react';

const PERIODES = [
  '1er Trimestre', '2e Trimestre', '3e Trimestre',
  '1er Semestre', '2e Semestre',
  'Examen de fin d\'année',
  'Essai zonal 1', 'Essai zonal 2', 'Essai zonal 3',
  'Bilan de mi-parcours',
  'Autre',
];

export default function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classeId } = use(params);
  const router = useRouter();
  const { classes, modeles, sessions, addSession, updateNotes, updateSession } = useStore();
  const classe = classes.find((c) => c.id === classeId);

  const [selectedModeleId, setSelectedModeleId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [periode, setPeriode] = useState('1er Trimestre');
  const [customPeriode, setCustomPeriode] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<NoteEleve[]>([]);
  const [calculated, setCalculated] = useState<NoteEleve[]>([]);
  const [saved, setSaved] = useState(false);
  const [autoCalc, setAutoCalc] = useState(true);

  const classeSessions = sessions.filter((s) => s.classeId === classeId);
  const modele = modeles.find((m) => m.id === selectedModeleId);
  const matieres = modele ? getAllMatieres(modele) : [];

  // Load existing session
  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedModeleId(session.modeleBulletinId);
      setPeriode(session.periode);
      setNotes(session.notes);
      setSelectedSessionId(sessionId);
      setIsSetup(true);
    }
  }, [sessions]);

  // Init notes when modele or classe changes
  useEffect(() => {
    if (!modele || !classe || selectedSessionId) return;
    const initialNotes: NoteEleve[] = classe.eleves.map((eleve) => ({
      eleveId: eleve.id,
      notes: matieres.map((m) => ({ matiereId: m.id, valeur: null })),
      appreciation: '',
    }));
    setNotes(initialNotes);
  }, [selectedModeleId, classe?.id]);

  // Auto-calculate
  useEffect(() => {
    if (!modele || notes.length === 0) return;
    if (autoCalc) {
      setCalculated(calculateResults(notes, modele));
    }
  }, [notes, modele, autoCalc]);

  const handleSetup = () => {
    if (!selectedModeleId || !classe) return;
    const periodeFinal = periode === 'Autre' ? customPeriode : periode;
    if (!periodeFinal) return;

    // Init notes
    const initialNotes: NoteEleve[] = classe.eleves.map((eleve) => ({
      eleveId: eleve.id,
      notes: matieres.map((m) => ({ matiereId: m.id, valeur: null })),
      appreciation: '',
    }));
    setNotes(initialNotes);
    setIsSetup(true);
  };

  const setNoteValue = (eleveId: string, matiereId: string, value: string) => {
    const matiere = matieres.find((m) => m.id === matiereId);
    if (!matiere) return;

    const numVal = value === '' ? null : Math.min(Math.max(0, Number(value)), matiere.bareme);

    setNotes((prev) =>
      prev.map((ne) => {
        if (ne.eleveId !== eleveId) return ne;
        const notes = ne.notes.map((n) =>
          n.matiereId === matiereId ? { ...n, valeur: numVal } : n
        );
        // Ensure all matieres are present
        const matiereIds = notes.map((n) => n.matiereId);
        const missing = matieres
          .filter((m) => !matiereIds.includes(m.id))
          .map((m) => ({ matiereId: m.id, valeur: null }));
        return { ...ne, notes: [...notes, ...missing] };
      })
    );
    setSaved(false);
  };

  const setAppreciation = (eleveId: string, value: string) => {
    setNotes((prev) =>
      prev.map((ne) => (ne.eleveId === eleveId ? { ...ne, appreciation: value } : ne))
    );
    setSaved(false);
  };

  const getNote = (eleveId: string, matiereId: string): number | null => {
    const ne = notes.find((n) => n.eleveId === eleveId);
    if (!ne) return null;
    const nm = ne.notes.find((n) => n.matiereId === matiereId);
    return nm?.valeur ?? null;
  };

  const getCalculated = (eleveId: string) =>
    calculated.find((c) => c.eleveId === eleveId);

  const handleSave = () => {
    if (!modele || !classe) return;
    const periodeFinal = periode === 'Autre' ? customPeriode : periode;
    const finalNotes = calculateResults(notes, modele);

    if (selectedSessionId) {
      updateNotes(selectedSessionId, finalNotes);
      setSaved(true);
    } else {
      const sid = addSession({
        classeId,
        modeleBulletinId: selectedModeleId,
        anneeScolaire: classe.anneeScolaire,
        periode: periodeFinal,
        notes: finalNotes,
        statut: 'brouillon',
      });
      setSelectedSessionId(sid);
      setSaved(true);
    }
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFinalize = () => {
    handleSave();
    if (selectedSessionId) {
      updateSession(selectedSessionId, { statut: 'finalise' });
    }
    router.push(`/bulletins/${selectedSessionId || ''}`);
  };

  const totalMax = modele ? getTotalMax(modele) : 0;

  if (!classe) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-gray-500">Classe introuvable.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Saisie des notes – ${classe.nom}`}
        subtitle={`${classe.niveau} · ${classe.anneeScolaire}`}
        breadcrumb={
          <Link href={`/classes/${classeId}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft size={14} />
            {classe.nom}
          </Link>
        }
      />

      {/* Setup panel */}
      {!isSetup && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 max-w-2xl">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Configuration de la session</h2>

          {classeSessions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reprendre une session existante
              </label>
              <div className="space-y-2">
                {classeSessions.map((s) => {
                  const m = modeles.find((m) => m.id === s.modeleBulletinId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => loadSession(s.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.periode}</p>
                        <p className="text-xs text-gray-500">{m?.nom || '—'} · {s.notes.length} élèves</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.statut === 'finalise' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {s.statut === 'finalise' ? 'Finalisé' : 'Brouillon'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou créer une nouvelle session</span></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle de bulletin *</label>
              <select
                value={selectedModeleId}
                onChange={(e) => setSelectedModeleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Choisir un modèle...</option>
                {modeles.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
              {modeles.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  <Link href="/modeles/nouveau" className="underline">Créez d'abord un modèle de bulletin.</Link>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période *</label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {periode === 'Autre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la période *</label>
                <input
                  type="text"
                  value={customPeriode}
                  onChange={(e) => setCustomPeriode(e.target.value)}
                  placeholder="Ex : Contrôle 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSetup}
              disabled={!selectedModeleId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Commencer la saisie →
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet */}
      {isSetup && modele && (
        <>
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">{modele.nom}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-sm text-gray-600">{periode === 'Autre' ? customPeriode : periode}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">Total max : <strong>{totalMax} pts</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCalc}
                  onChange={(e) => setAutoCalc(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                <Calculator size={12} />
                Calcul auto
              </label>
              <button
                onClick={() => setCalculated(calculateResults(notes, modele))}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={12} />
                Recalculer
              </button>
              <button
                onClick={handleSave}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  saved
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                {saved ? <><Check size={12} /> Enregistré</> : <><Save size={12} /> Sauvegarder</>}
              </button>
              <button
                onClick={() => router.push(`/bulletins/${selectedSessionId}`)}
                disabled={!selectedSessionId}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <FileDown size={12} />
                Bulletins PDF
              </button>
            </div>
          </div>

          {/* Warning if no students */}
          {classe.eleves.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Aucun élève dans cette classe. <Link href={`/classes/${classeId}`} className="underline font-medium">Ajoutez des élèves</Link> avant de saisir des notes.
              </p>
            </div>
          )}

          {/* Notes table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden notes-table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  {/* Domaines row */}
                  <tr className="bg-slate-800 text-white">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold sticky left-0 bg-slate-800 z-10 w-40 min-w-40">
                      Élève
                    </th>
                    {modele.domaines.map((domaine) => {
                      const domMatieres = domaine.sousDomaines.flatMap((sd) => sd.matieres);
                      return (
                        <th
                          key={domaine.id}
                          colSpan={domMatieres.length}
                          className="px-2 py-2.5 text-center text-xs font-semibold border-l border-slate-600 truncate max-w-xs"
                        >
                          {domaine.nom}
                        </th>
                      );
                    })}
                    <th className="px-3 py-2.5 text-center text-xs font-semibold border-l border-slate-600 bg-slate-700">Total</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold bg-slate-700">Moy.</th>
                    {modele.afficherRang && <th className="px-3 py-2.5 text-center text-xs font-semibold bg-slate-700">Rang</th>}
                    <th className="px-3 py-2.5 text-center text-xs font-semibold bg-slate-700">Statut</th>
                  </tr>
                  {/* Matières row */}
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left text-xs sticky left-0 bg-gray-100 z-10 border-b border-gray-200"></th>
                    {matieres.map((m, idx) => (
                      <th
                        key={m.id}
                        className="px-1 py-2 text-center text-xs font-medium text-gray-600 border-l border-gray-200 min-w-16 max-w-24 border-b border-gray-200"
                      >
                        <div className="truncate px-1" title={m.nom}>{m.nom}</div>
                        <div className="text-gray-400 font-normal">/{m.bareme}</div>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border-l border-gray-200 border-b border-gray-200">/{totalMax}</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border-b border-gray-200">/10</th>
                    {modele.afficherRang && <th className="px-3 py-2 border-b border-gray-200"></th>}
                    <th className="px-3 py-2 border-b border-gray-200"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classe.eleves.length === 0 ? (
                    <tr>
                      <td colSpan={matieres.length + 5} className="px-4 py-8 text-center text-gray-400 text-sm">
                        Aucun élève dans cette classe.
                      </td>
                    </tr>
                  ) : (
                    classe.eleves.map((eleve, rowIdx) => {
                      const calc = getCalculated(eleve.id);
                      const isAdmis = calc?.statut === 'Admis';
                      return (
                        <tr key={eleve.id} className={`hover:bg-blue-50/30 transition-colors ${rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-3 py-2 sticky left-0 bg-white z-10 font-medium text-gray-800 text-xs border-r border-gray-100">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 text-xs w-5">{rowIdx + 1}.</span>
                              <span className="truncate max-w-32" title={`${eleve.prenom} ${eleve.nom}`}>
                                {eleve.prenom} <strong>{eleve.nom}</strong>
                              </span>
                            </div>
                          </td>
                          {matieres.map((matiere) => {
                            const val = getNote(eleve.id, matiere.id);
                            return (
                              <td key={matiere.id} className="px-1 py-1.5 border-l border-gray-100">
                                <input
                                  type="number"
                                  min={0}
                                  max={matiere.bareme}
                                  step={0.25}
                                  value={val ?? ''}
                                  onChange={(e) => setNoteValue(eleve.id, matiere.id, e.target.value)}
                                  placeholder="—"
                                  className={`w-full h-8 text-center text-sm rounded border focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                    val !== null && val !== undefined
                                      ? val < matiere.bareme * 0.5
                                        ? 'text-red-600 bg-red-50 border-red-200'
                                        : 'text-gray-800 border-gray-200'
                                      : 'border-gray-200 bg-transparent text-gray-400'
                                  }`}
                                />
                              </td>
                            );
                          })}
                          {/* Total */}
                          <td className="px-3 py-2 text-center text-sm font-bold border-l border-gray-200">
                            {calc?.total !== undefined ? calc.total : '—'}
                          </td>
                          {/* Moyenne */}
                          <td className={`px-3 py-2 text-center text-sm font-bold ${
                            calc?.moyenne !== undefined
                              ? isAdmis ? 'text-green-700' : 'text-red-600'
                              : 'text-gray-400'
                          }`}>
                            {calc?.moyenne !== undefined ? calc.moyenne.toFixed(2) : '—'}
                          </td>
                          {/* Rang */}
                          {modele.afficherRang && (
                            <td className="px-3 py-2 text-center text-sm font-semibold text-blue-700">
                              {calc?.rang ?? '—'}
                            </td>
                          )}
                          {/* Statut */}
                          <td className="px-3 py-2 text-center">
                            {calc?.statut && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isAdmis ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {calc.statut}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appréciations */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Appréciations individuelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classe.eleves.map((eleve) => (
                <div key={eleve.id} className="flex items-start gap-3">
                  <span className="text-xs font-medium text-gray-700 mt-2 min-w-32 max-w-32 truncate">
                    {eleve.prenom} {eleve.nom}
                  </span>
                  <textarea
                    value={notes.find((n) => n.eleveId === eleve.id)?.appreciation || ''}
                    onChange={(e) => setAppreciation(eleve.id, e.target.value)}
                    placeholder="Appréciation du maître..."
                    rows={2}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          {calculated.length > 0 && (
            <div className="mt-4 bg-slate-800 rounded-xl p-4 text-white">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Synthèse de la classe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Effectif', value: classe.eleves.length },
                  { label: 'Admis', value: calculated.filter((c) => c.statut === 'Admis').length, color: 'text-green-400' },
                  { label: 'Ajournés', value: calculated.filter((c) => c.statut === 'Ajourné').length, color: 'text-red-400' },
                  {
                    label: 'Moy. classe',
                    value: calculated.length > 0
                      ? (calculated.reduce((s, c) => s + (c.moyenne || 0), 0) / calculated.length).toFixed(2)
                      : '—',
                  },
                  {
                    label: 'Meilleure',
                    value: calculated.length > 0
                      ? Math.max(...calculated.map((c) => c.moyenne || 0)).toFixed(2)
                      : '—',
                    color: 'text-blue-300',
                  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save / Generate buttons */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save size={15} />
              Enregistrer brouillon
            </button>
            <button
              onClick={() => { handleSave(); if (selectedSessionId) router.push(`/bulletins/${selectedSessionId}`); else { setTimeout(() => { const s = sessions.find(s => s.classeId === classeId && s.periode === (periode === 'Autre' ? customPeriode : periode)); if(s) router.push(`/bulletins/${s.id}`); }, 200); } }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <FileDown size={15} />
              Générer les bulletins PDF
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
