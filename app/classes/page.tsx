'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Users, Plus, Archive, Trash2, ArrowRight, BookOpen, MoreVertical, School } from 'lucide-react';
import { niveauxScolaires, formatDate } from '@/lib/utils';

function ClasseForm({ onClose, initial }: { onClose: () => void; initial?: { id: string; nom: string; niveau: string; enseignant: string; anneeScolaire: string } }) {
  const { addClass, updateClasse, etablissement } = useStore();
  const [form, setForm] = useState({
    nom: initial?.nom || '',
    niveau: initial?.niveau || 'CM1',
    enseignant: initial?.enseignant || '',
    anneeScolaire: initial?.anneeScolaire || etablissement?.anneeScolaire || '2024-2025',
  });

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (initial) {
      updateClasse(initial.id, form);
    } else {
      addClass(form);
    }
    onClose();
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la classe *</label>
        <input
          type="text"
          required
          value={form.nom}
          onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
          placeholder="ex : CM2 A, 6ème B..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
        <select
          value={form.niveau}
          onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {niveauxScolaires().map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant responsable</label>
        <input
          type="text"
          value={form.enseignant}
          onChange={(e) => setForm((f) => ({ ...f, enseignant: e.target.value }))}
          placeholder="Prénom et Nom"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Année scolaire</label>
        <input
          type="text"
          value={form.anneeScolaire}
          onChange={(e) => setForm((f) => ({ ...f, anneeScolaire: e.target.value }))}
          placeholder="2024-2025"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg">
          {initial ? 'Enregistrer' : 'Créer la classe'}
        </button>
      </div>
    </form>
  );
}

export default function ClassesPage() {
  const { classes, deleteClasse, archiveClasse, sessions } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const active = classes.filter((c) => !c.archived);
  const archived = classes.filter((c) => c.archived);
  const displayed = showArchived ? archived : active;

  const sessionCount = (classeId: string) => sessions.filter((s) => s.classeId === classeId).length;

  return (
    <AppLayout>
      <PageHeader
        title="Classes & Élèves"
        subtitle="Gérez vos classes et la liste de vos élèves."
        action={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nouvelle classe
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!showArchived ? 'bg-blue-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Actives ({active.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${showArchived ? 'bg-blue-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Archivées ({archived.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={School}
          title={showArchived ? 'Aucune classe archivée' : 'Aucune classe créée'}
          description={
            showArchived
              ? 'Les classes archivées apparaîtront ici.'
              : 'Créez votre première classe pour commencer à saisir des notes.'
          }
          action={
            !showArchived ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
              >
                <Plus size={16} />
                Créer une classe
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((classe) => (
            <div key={classe.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <School size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{classe.nom}</h3>
                      <p className="text-xs text-gray-500">{classe.niveau} · {classe.anneeScolaire}</p>
                    </div>
                  </div>
                </div>

                {classe.enseignant && (
                  <p className="text-xs text-gray-500 mb-3">
                    Enseignant : {classe.enseignant}
                  </p>
                )}

                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-gray-400" />
                    {classe.eleves.length} élève{classe.eleves.length > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} className="text-gray-400" />
                    {sessionCount(classe.id)} session{sessionCount(classe.id) > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/classes/${classe.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Gérer <ArrowRight size={14} />
                  </Link>
                  <button
                    onClick={() => archiveClasse(classe.id)}
                    title={classe.archived ? 'Désarchiver' : 'Archiver'}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-300 transition-colors"
                  >
                    <Archive size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(classe.id)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Créer une classe">
        <ClasseForm onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteClasse(deleteId); setDeleteId(null); }}
        title="Supprimer la classe"
        message="Cette action est irréversible. Tous les élèves de cette classe seront supprimés. Les sessions de notes liées ne seront pas affectées."
        confirmLabel="Supprimer définitivement"
      />
    </AppLayout>
  );
}
