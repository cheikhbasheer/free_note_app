'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import {
  Users, Plus, Pencil, Trash2, BookOpen, ArrowLeft,
  Download, Upload, ChevronRight
} from 'lucide-react';
import type { Eleve } from '@/lib/types';

function EleveForm({
  onClose,
  initial,
  onSave,
}: {
  onClose: () => void;
  initial?: Eleve;
  onSave: (data: Omit<Eleve, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    prenom: initial?.prenom || '',
    nom: initial?.nom || '',
    sexe: initial?.sexe || '' as 'M' | 'F' | '',
    dateNaissance: initial?.dateNaissance || '',
    matricule: initial?.matricule || '',
  });

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ prenom: form.prenom, nom: form.nom, sexe: form.sexe as 'M' | 'F' | undefined, dateNaissance: form.dateNaissance || undefined, matricule: form.matricule || undefined });
    onClose();
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input
            required
            type="text"
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            required
            type="text"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
          <select
            value={form.sexe}
            onChange={(e) => setForm((f) => ({ ...f, sexe: e.target.value as 'M' | 'F' | '' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">—</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
          <input
            type="date"
            value={form.dateNaissance}
            onChange={(e) => setForm((f) => ({ ...f, dateNaissance: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Matricule (optionnel)</label>
        <input
          type="text"
          value={form.matricule}
          onChange={(e) => setForm((f) => ({ ...f, matricule: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg">
          {initial ? 'Enregistrer' : 'Ajouter l\'élève'}
        </button>
      </div>
    </form>
  );
}

export default function ClasseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { classes, addEleve, updateEleve, deleteEleve, importEleves, sessions, modeles } = useStore();
  const classe = classes.find((c) => c.id === id);

  const [showAddEleve, setShowAddEleve] = useState(false);
  const [editEleve, setEditEleve] = useState<Eleve | null>(null);
  const [deleteEleveId, setDeleteEleveId] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  if (!classe) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-gray-500">Classe introuvable.</div>
      </AppLayout>
    );
  }

  const classeSessions = sessions.filter((s) => s.classeId === id);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(Boolean).slice(1);
      const eleves = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        return { prenom: parts[0] || '', nom: parts[1] || '', sexe: (parts[2] as 'M' | 'F') || undefined };
      }).filter((e) => e.prenom || e.nom);
      importEleves(id, eleves);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportCSV = () => {
    const header = 'Prénom,Nom,Sexe,Date de naissance,Matricule';
    const rows = classe.eleves.map(
      (e) => `${e.prenom},${e.nom},${e.sexe || ''},${e.dateNaissance || ''},${e.matricule || ''}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eleves_${classe.nom}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <PageHeader
        title={classe.nom}
        subtitle={`${classe.niveau} · ${classe.anneeScolaire}${classe.enseignant ? ` · ${classe.enseignant}` : ''}`}
        breadcrumb={
          <Link href="/classes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft size={14} />
            Classes
          </Link>
        }
        action={
          <Link
            href={`/classes/${id}/notes`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            Saisir les notes
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elèves */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Élèves ({classe.eleves.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Upload size={12} />
                  CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                </label>
                {classe.eleves.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download size={12} />
                    Exporter
                  </button>
                )}
                <button
                  onClick={() => setShowAddEleve(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <Plus size={12} />
                  Ajouter
                </button>
              </div>
            </div>

            {classe.eleves.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucun élève"
                description="Ajoutez des élèves manuellement ou importez un fichier CSV (Prénom,Nom,Sexe)."
                action={
                  <button
                    onClick={() => setShowAddEleve(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
                  >
                    <Plus size={15} />
                    Ajouter un élève
                  </button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom complet</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexe</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Naissance</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matricule</th>
                      <th className="px-4 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classe.eleves.map((eleve, idx) => (
                      <tr key={eleve.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {eleve.prenom} {eleve.nom}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{eleve.sexe || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {eleve.dateNaissance
                            ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{eleve.matricule || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditEleve(eleve)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteEleveId(eleve.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">Sessions de notes</h2>
            </div>
            {classeSessions.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Aucune session créée.</p>
                <Link
                  href={`/classes/${id}/notes`}
                  className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Commencer <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {classeSessions.map((session) => {
                  const modele = modeles.find((m) => m.id === session.modeleBulletinId);
                  return (
                    <Link
                      key={session.id}
                      href={`/bulletins/${session.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{session.periode}</p>
                        <p className="text-xs text-gray-400">{modele?.nom || '—'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        session.statut === 'finalise' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {session.statut === 'finalise' ? 'Finalisé' : 'Brouillon'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={showAddEleve} onClose={() => setShowAddEleve(false)} title="Ajouter un élève">
        <EleveForm
          onClose={() => setShowAddEleve(false)}
          onSave={(data) => addEleve(id, data)}
        />
      </Modal>

      <Modal open={!!editEleve} onClose={() => setEditEleve(null)} title="Modifier l'élève">
        {editEleve && (
          <EleveForm
            initial={editEleve}
            onClose={() => setEditEleve(null)}
            onSave={(data) => updateEleve(id, editEleve.id, data)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteEleveId}
        onClose={() => setDeleteEleveId(null)}
        onConfirm={() => { if (deleteEleveId) deleteEleve(id, deleteEleveId); setDeleteEleveId(null); }}
        title="Supprimer l'élève"
        message="Voulez-vous vraiment supprimer cet élève ? Cette action est irréversible."
        confirmLabel="Supprimer"
      />
    </AppLayout>
  );
}
