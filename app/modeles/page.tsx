'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FileText, Plus, Pencil, Trash2, Copy, ArrowRight, BookOpen } from 'lucide-react';
import { getTypeLabel, getTemplateLabel, formatDate } from '@/lib/utils';
import { getAllMatieres } from '@/lib/calculations';

export default function ModelesPage() {
  const { modeles, deleteModele, duplicateModele } = useStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const typeColors: Record<string, string> = {
    trimestriel: 'bg-blue-100 text-blue-700',
    semestriel: 'bg-green-100 text-green-700',
    examen: 'bg-purple-100 text-purple-700',
    personnalise: 'bg-gray-100 text-gray-700',
  };

  return (
    <AppLayout>
      <PageHeader
        title="Modèles de bulletins"
        subtitle="Créez et configurez vos modèles de bulletins scolaires."
        action={
          <Link
            href="/modeles/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nouveau modèle
          </Link>
        }
      />

      {modeles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun modèle de bulletin"
          description="Créez un modèle pour définir les matières, barèmes, et le format de vos bulletins."
          action={
            <Link
              href="/modeles/nouveau"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
            >
              <Plus size={15} />
              Créer un modèle
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeles.map((modele) => {
            const matieres = getAllMatieres(modele);
            return (
              <div key={modele.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <FileText size={18} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{modele.nom}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(modele.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[modele.type]}`}>
                      {getTypeLabel(modele.type)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {getTemplateLabel(modele.template)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{modele.domaines.length} domaine{modele.domaines.length > 1 ? 's' : ''} · {matieres.length} matière{matieres.length > 1 ? 's' : ''}</p>
                    <p>Seuil d'admission : {modele.seuilAdmission}/10</p>
                    {matieres.length > 0 && (
                      <p>Total max : {matieres.reduce((s, m) => s + m.bareme, 0)} pts</p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    href={`/modeles/${modele.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Pencil size={12} />
                    Modifier
                  </Link>
                  <button
                    onClick={() => duplicateModele(modele.id)}
                    title="Dupliquer"
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(modele.id)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteModele(deleteId); setDeleteId(null); }}
        title="Supprimer le modèle"
        message="Ce modèle sera supprimé définitivement. Les sessions de notes existantes utilisant ce modèle ne seront pas affectées."
        confirmLabel="Supprimer"
      />
    </AppLayout>
  );
}
