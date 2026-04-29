'use client';

import { use, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import BulletinClassique from '@/components/bulletins/BulletinClassique';
import { calculateResults, getAllMatieres, getStatistiques } from '@/lib/calculations';
import { buildPDFFileName } from '@/lib/utils';
import type { Eleve } from '@/lib/types';
import {
  ArrowLeft, Printer, Download, FileDown, Users, Eye, ChevronLeft,
  ChevronRight, CheckCircle2, AlertTriangle, BarChart2, Lock
} from 'lucide-react';

export default function BulletinsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { sessions, classes, modeles, etablissement, updateSession } = useStore();

  const session = sessions.find((s) => s.id === sessionId);
  const classe = session ? classes.find((c) => c.id === session.classeId) : null;
  const modele = session ? modeles.find((m) => m.id === session.modeleBulletinId) : null;

  const [currentEleveIdx, setCurrentEleveIdx] = useState(0);
  const [mode, setMode] = useState<'apercu' | 'liste'>('liste');
  const bulletinRef = useRef<HTMLDivElement>(null);

  if (!session || !classe || !modele) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-gray-500">Session introuvable.</p>
          <Link href="/historique" className="text-blue-600 underline mt-2 inline-block">
            Voir l'historique
          </Link>
        </div>
      </AppLayout>
    );
  }

  const calculatedNotes = calculateResults(session.notes, modele);
  const stats = getStatistiques(calculatedNotes);
  const matieres = getAllMatieres(modele);

  const elevesSorted = [...classe.eleves].sort((a, b) => {
    const na = calculatedNotes.find((n) => n.eleveId === a.id);
    const nb = calculatedNotes.find((n) => n.eleveId === b.id);
    return (na?.rang ?? 999) - (nb?.rang ?? 999);
  });

  const currentEleve = elevesSorted[currentEleveIdx];
  const currentNote = calculatedNotes.find((n) => n.eleveId === currentEleve?.id);

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrintCurrent = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !bulletinRef.current) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Bulletin – ${currentEleve?.prenom} ${currentEleve?.nom}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: white; }
            @page { size: A4 portrait; margin: 0; }
          </style>
        </head>
        <body>${bulletinRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const finaliserSession = () => {
    updateSession(session.id, { statut: 'finalise', notes: calculatedNotes });
  };

  const tauxAdmission = classe.eleves.length > 0
    ? Math.round((stats.admis / calculatedNotes.length) * 100)
    : 0;

  return (
    <AppLayout>
      <PageHeader
        title={`Bulletins – ${classe.nom}`}
        subtitle={`${session.periode} · ${session.anneeScolaire} · ${modele.nom}`}
        breadcrumb={
          <Link href={`/classes/${classe.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft size={14} />
            {classe.nom}
          </Link>
        }
      />

      {/* Stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Effectif', value: calculatedNotes.length, color: 'bg-slate-100 text-slate-700' },
          { label: 'Admis', value: stats.admis, color: 'bg-green-100 text-green-700' },
          { label: 'Ajournés', value: stats.ajournes, color: 'bg-red-100 text-red-700' },
          { label: 'Moy. classe', value: `${stats.moyenneClasse.toFixed(2)}/10`, color: 'bg-blue-100 text-blue-700' },
          { label: 'Taux de réussite', value: `${tauxAdmission}%`, color: 'bg-purple-100 text-purple-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-3 text-center`}>
            <p className="text-xs opacity-70 font-medium">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('liste')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'liste' ? 'bg-blue-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={14} />
            Liste classe
          </button>
          <button
            onClick={() => setMode('apercu')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'apercu' ? 'bg-blue-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye size={14} />
            Aperçu bulletin
          </button>
        </div>
        <div className="flex items-center gap-2">
          {session.statut !== 'finalise' && (
            <button
              onClick={finaliserSession}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              <Lock size={14} />
              Finaliser la session
            </button>
          )}
          {session.statut === 'finalise' && (
            <span className="inline-flex items-center gap-1 text-sm text-blue-700 font-medium px-3 py-1.5 bg-blue-50 rounded-lg">
              <CheckCircle2 size={14} />
              Session finalisée
            </span>
          )}
          <button
            onClick={handlePrintAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Printer size={15} />
            Imprimer tous
          </button>
        </div>
      </div>

      {/* Mode: liste des résultats */}
      {mode === 'liste' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden no-print">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Classement par ordre de mérite
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Rang</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                  {matieres.map((m) => (
                    <th key={m.id} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-14 max-w-20">
                      <span className="truncate block" title={m.nom}>{m.nom.substring(0, 8)}{m.nom.length > 8 ? '.' : ''}</span>
                      <span className="font-normal text-gray-400">/{m.bareme}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Moyenne</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aperçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {elevesSorted.map((eleve, idx) => {
                  const note = calculatedNotes.find((n) => n.eleveId === eleve.id);
                  const isAdmis = note?.statut === 'Admis';
                  return (
                    <tr key={eleve.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          note?.rang === 1 ? 'bg-yellow-100 text-yellow-700' :
                          note?.rang === 2 ? 'bg-gray-200 text-gray-700' :
                          note?.rang === 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {note?.rang ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {eleve.prenom} {eleve.nom.toUpperCase()}
                      </td>
                      {matieres.map((m) => {
                        const nm = note?.notes.find((n) => n.matiereId === m.id);
                        const val = nm?.valeur;
                        return (
                          <td key={m.id} className={`px-2 py-3 text-center text-sm ${
                            val !== null && val !== undefined && val < m.bareme * 0.5 ? 'text-red-600 font-semibold' : 'text-gray-700'
                          }`}>
                            {val !== null && val !== undefined ? val : '—'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-gray-800">
                        {note?.total ?? '—'}
                      </td>
                      <td className={`px-4 py-3 text-center font-bold ${isAdmis ? 'text-green-700' : 'text-red-600'}`}>
                        {note?.moyenne?.toFixed(2) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isAdmis ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {note?.statut ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { setCurrentEleveIdx(idx); setMode('apercu'); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mx-auto"
                        >
                          <Eye size={12} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode: aperçu bulletin individuel */}
      {mode === 'apercu' && currentEleve && currentNote && (
        <div className="no-print">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <button
              onClick={() => setCurrentEleveIdx((i) => Math.max(0, i - 1))}
              disabled={currentEleveIdx === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Précédent
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {currentEleve.prenom} {currentEleve.nom.toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">
                {currentEleveIdx + 1} / {elevesSorted.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintCurrent}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <Printer size={14} />
                Imprimer
              </button>
              <button
                onClick={() => setCurrentEleveIdx((i) => Math.min(elevesSorted.length - 1, i + 1))}
                disabled={currentEleveIdx === elevesSorted.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Bulletin preview */}
          <div className="flex justify-center">
            <div
              ref={bulletinRef}
              className="shadow-2xl"
              style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
            >
              <BulletinClassique
                etablissement={etablissement}
                classe={classe}
                eleve={currentEleve}
                modele={modele}
                noteEleve={currentNote}
                periode={session.periode}
                anneeScolaire={session.anneeScolaire}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print area: all bulletins */}
      <div className="print-only">
        {elevesSorted.map((eleve) => {
          const note = calculatedNotes.find((n) => n.eleveId === eleve.id);
          if (!note) return null;
          return (
            <BulletinClassique
              key={eleve.id}
              etablissement={etablissement}
              classe={classe}
              eleve={eleve}
              modele={modele}
              noteEleve={note}
              periode={session.periode}
              anneeScolaire={session.anneeScolaire}
            />
          );
        })}
      </div>
    </AppLayout>
  );
}
