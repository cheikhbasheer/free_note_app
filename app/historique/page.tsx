'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { History, BookOpen, Trash2, FileDown, Eye, Search, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { calculateResults, getStatistiques } from '@/lib/calculations';

export default function HistoriquePage() {
  const { sessions, classes, modeles, deleteSession } = useStore();
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime()
  );

  const filtered = sorted.filter((s) => {
    const classe = classes.find((c) => c.id === s.classeId);
    const modele = modeles.find((m) => m.id === s.modeleBulletinId);
    const matchSearch =
      !search ||
      s.periode.toLowerCase().includes(search.toLowerCase()) ||
      classe?.nom.toLowerCase().includes(search.toLowerCase()) ||
      modele?.nom.toLowerCase().includes(search.toLowerCase());
    const matchClasse = !filterClasse || s.classeId === filterClasse;
    const matchStatut = !filterStatut || s.statut === filterStatut;
    return matchSearch && matchClasse && matchStatut;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Historique des sessions"
        subtitle="Retrouvez et réexportez toutes vos sessions de notes passées."
      />

      {/* Filters */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 text-sm border-0 focus:outline-none bg-transparent"
            />
          </div>
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="finalise">Finalisé</option>
          </select>
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucune session enregistrée"
          description="Les sessions de notes que vous créez apparaîtront ici. Commencez par saisir des notes dans une classe."
          action={
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
            >
              <BookOpen size={15} />
              Aller aux classes
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search size={24} className="mx-auto mb-2" />
          <p className="text-sm">Aucun résultat pour votre recherche.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const classe = classes.find((c) => c.id === session.classeId);
            const modele = modeles.find((m) => m.id === session.modeleBulletinId);
            const calc = modele ? calculateResults(session.notes, modele) : session.notes;
            const stats = getStatistiques(calc);
            const tauxAdmission = calc.length > 0 ? Math.round((stats.admis / calc.length) * 100) : 0;

            return (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    session.statut === 'finalise' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    <BookOpen size={18} className={session.statut === 'finalise' ? 'text-blue-600' : 'text-yellow-600'} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {classe?.nom || '—'} · {session.periode}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        session.statut === 'finalise'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {session.statut === 'finalise' ? 'Finalisé' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {modele?.nom || '—'} · {session.anneeScolaire}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-5 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Élèves</p>
                      <p className="text-sm font-bold text-gray-800">{session.notes.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Moy. classe</p>
                      <p className="text-sm font-bold text-blue-700">{stats.moyenneClasse.toFixed(2)}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Réussite</p>
                      <p className={`text-sm font-bold ${tauxAdmission >= 50 ? 'text-green-700' : 'text-red-600'}`}>
                        {tauxAdmission}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Modifié</p>
                      <p className="text-xs text-gray-500">{formatDate(session.dateModification)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/classes/${session.classeId}/notes`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier les notes"
                    >
                      <BookOpen size={15} />
                    </Link>
                    <Link
                      href={`/bulletins/${session.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      Bulletins
                    </Link>
                    <button
                      onClick={() => setDeleteId(session.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteSession(deleteId); setDeleteId(null); }}
        title="Supprimer la session"
        message="Cette session de notes sera supprimée définitivement. Cette action est irréversible."
        confirmLabel="Supprimer"
      />
    </AppLayout>
  );
}
