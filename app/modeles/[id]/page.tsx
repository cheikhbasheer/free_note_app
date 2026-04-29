'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { generateId } from '@/lib/utils';
import type { Domaine, Matiere, ModeleBulletin, SousDomaine, TypeBulletin, TemplateBulletin } from '@/lib/types';
import {
  ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp,
  GripVertical, Settings2, Eye
} from 'lucide-react';

const TYPES: { value: TypeBulletin; label: string }[] = [
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'semestriel', label: 'Semestriel' },
  { value: 'examen', label: 'Examen / Essai zonal' },
  { value: 'personnalise', label: 'Personnalisé' },
];

const TEMPLATES: { value: TemplateBulletin; label: string; desc: string }[] = [
  { value: 'classique', label: 'Classique institutionnel', desc: 'Format officiel sénégalais avec domaines et sous-domaines' },
  { value: 'moderne', label: 'Moderne sobre', desc: 'Présentation épurée avec tableaux colorés' },
  { value: 'detaille', label: 'Tableau détaillé', desc: 'Affichage complet de toutes les sous-notes' },
  { value: 'examen', label: 'Examen / Classement', desc: 'Optimisé pour les examens et le classement' },
];

interface MatiereRowProps {
  matiere: Matiere;
  onUpdate: (m: Matiere) => void;
  onDelete: () => void;
}

function MatiereRow({ matiere, onUpdate, onDelete }: MatiereRowProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
      <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
      <input
        type="text"
        value={matiere.nom}
        onChange={(e) => onUpdate({ ...matiere, nom: e.target.value })}
        placeholder="Nom de la matière"
        className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 p-0 bg-transparent"
      />
      <div className="flex items-center gap-1 flex-shrink-0">
        <label className="text-xs text-gray-400 whitespace-nowrap">Barème</label>
        <input
          type="number"
          min={0}
          max={1000}
          value={matiere.bareme}
          onChange={(e) => onUpdate({ ...matiere, bareme: Number(e.target.value) })}
          className="w-14 text-sm text-center border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <label className="text-xs text-gray-400 whitespace-nowrap">Coef.</label>
        <input
          type="number"
          min={1}
          max={10}
          step={0.5}
          value={matiere.coefficient}
          onChange={(e) => onUpdate({ ...matiere, coefficient: Number(e.target.value) })}
          className="w-12 text-sm text-center border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
      <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface SousDomaineBlockProps {
  sousDomaine: SousDomaine;
  onUpdate: (sd: SousDomaine) => void;
  onDelete: () => void;
}

function SousDomaineBlock({ sousDomaine, onUpdate, onDelete }: SousDomaineBlockProps) {
  const addMatiere = () => {
    const m: Matiere = { id: generateId(), nom: '', bareme: 20, coefficient: 1 };
    onUpdate({ ...sousDomaine, matieres: [...sousDomaine.matieres, m] });
  };

  const updateMatiere = (idx: number, m: Matiere) => {
    const matieres = [...sousDomaine.matieres];
    matieres[idx] = m;
    onUpdate({ ...sousDomaine, matieres });
  };

  const deleteMatiere = (idx: number) => {
    onUpdate({ ...sousDomaine, matieres: sousDomaine.matieres.filter((_, i) => i !== idx) });
  };

  return (
    <div className="ml-4 border-l-2 border-blue-100 pl-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={sousDomaine.nom}
          onChange={(e) => onUpdate({ ...sousDomaine, nom: e.target.value })}
          placeholder="Nom du sous-domaine"
          className="flex-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="space-y-1.5 mb-2">
        {sousDomaine.matieres.map((m, idx) => (
          <MatiereRow
            key={m.id}
            matiere={m}
            onUpdate={(updated) => updateMatiere(idx, updated)}
            onDelete={() => deleteMatiere(idx)}
          />
        ))}
      </div>

      <button
        onClick={addMatiere}
        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
      >
        <Plus size={12} />
        Ajouter une matière
      </button>
    </div>
  );
}

interface DomaineBlockProps {
  domaine: Domaine;
  onUpdate: (d: Domaine) => void;
  onDelete: () => void;
}

function DomaineBlock({ domaine, onUpdate, onDelete }: DomaineBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  const addSousDomaine = () => {
    const sd: SousDomaine = { id: generateId(), nom: '', matieres: [] };
    onUpdate({ ...domaine, sousDomaines: [...domaine.sousDomaines, sd] });
  };

  const updateSousDomaine = (idx: number, sd: SousDomaine) => {
    const sds = [...domaine.sousDomaines];
    sds[idx] = sd;
    onUpdate({ ...domaine, sousDomaines: sds });
  };

  const deleteSousDomaine = (idx: number) => {
    onUpdate({ ...domaine, sousDomaines: domaine.sousDomaines.filter((_, i) => i !== idx) });
  };

  const matiereCount = domaine.sousDomaines.reduce((s, sd) => s + sd.matieres.length, 0);

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={domaine.nom}
            onChange={(e) => onUpdate({ ...domaine, nom: e.target.value })}
            placeholder="Nom du domaine (ex : Langue française)"
            className="flex-1 font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {domaine.sousDomaines.length} SD · {matiereCount} mat.
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {!collapsed && (
        <>
          {domaine.sousDomaines.map((sd, idx) => (
            <SousDomaineBlock
              key={sd.id}
              sousDomaine={sd}
              onUpdate={(updated) => updateSousDomaine(idx, updated)}
              onDelete={() => deleteSousDomaine(idx)}
            />
          ))}
          <button
            onClick={addSousDomaine}
            className="flex items-center gap-1 mt-3 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors ml-4"
          >
            <Plus size={12} />
            Ajouter un sous-domaine
          </button>
        </>
      )}
    </div>
  );
}

const defaultModele = (): Omit<ModeleBulletin, 'id' | 'createdAt'> => ({
  nom: '',
  type: 'trimestriel',
  domaines: [],
  seuilAdmission: 5,
  afficherRang: true,
  afficherSignatures: true,
  formatPDF: 'A4_portrait',
  template: 'classique',
});

export default function ModeleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { modeles, addModele, updateModele } = useStore();
  const isNew = id === 'nouveau';
  const existing = isNew ? null : modeles.find((m) => m.id === id);

  const [form, setForm] = useState<Omit<ModeleBulletin, 'id' | 'createdAt'>>(() => {
    if (existing) {
      const { id: _id, createdAt: _c, ...rest } = existing;
      return rest;
    }
    return defaultModele();
  });

  const [saved, setSaved] = useState(false);

  const addDomaine = () => {
    const d: Domaine = { id: generateId(), nom: '', sousDomaines: [] };
    setForm((f) => ({ ...f, domaines: [...f.domaines, d] }));
  };

  const updateDomaine = (idx: number, d: Domaine) => {
    const domaines = [...form.domaines];
    domaines[idx] = d;
    setForm((f) => ({ ...f, domaines }));
  };

  const deleteDomaine = (idx: number) => {
    setForm((f) => ({ ...f, domaines: f.domaines.filter((_, i) => i !== idx) }));
  };

  const totalMax = form.domaines.flatMap((d) => d.sousDomaines.flatMap((sd) => sd.matieres))
    .reduce((s, m) => s + m.bareme, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      const newId = addModele(form);
      router.replace(`/modeles/${newId}`);
    } else if (existing) {
      updateModele(existing.id, form);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addDefaultSenegal = () => {
    setForm((f) => ({
      ...f,
      nom: f.nom || 'Bulletin sénégalais CM',
      domaines: [
        {
          id: generateId(),
          nom: 'Langue Française',
          sousDomaines: [
            {
              id: generateId(),
              nom: 'Communication orale',
              matieres: [
                { id: generateId(), nom: 'Lecture', bareme: 20, coefficient: 2 },
                { id: generateId(), nom: 'Récitation', bareme: 20, coefficient: 1 },
                { id: generateId(), nom: 'Expression orale', bareme: 20, coefficient: 1 },
              ],
            },
            {
              id: generateId(),
              nom: 'Communication écrite',
              matieres: [
                { id: generateId(), nom: 'Grammaire / Conjugaison', bareme: 20, coefficient: 2 },
                { id: generateId(), nom: 'Orthographe / Dictée', bareme: 20, coefficient: 2 },
                { id: generateId(), nom: 'Rédaction / Expression écrite', bareme: 20, coefficient: 2 },
              ],
            },
          ],
        },
        {
          id: generateId(),
          nom: 'Mathématiques',
          sousDomaines: [
            {
              id: generateId(),
              nom: 'Arithmétique et calcul',
              matieres: [
                { id: generateId(), nom: 'Calcul / Arithmétique', bareme: 20, coefficient: 3 },
                { id: generateId(), nom: 'Problèmes', bareme: 20, coefficient: 2 },
              ],
            },
            {
              id: generateId(),
              nom: 'Géométrie',
              matieres: [
                { id: generateId(), nom: 'Géométrie / Mesure', bareme: 20, coefficient: 1 },
              ],
            },
          ],
        },
        {
          id: generateId(),
          nom: 'Sciences et Technologie',
          sousDomaines: [
            {
              id: generateId(),
              nom: 'Éveil scientifique',
              matieres: [
                { id: generateId(), nom: 'Sciences', bareme: 20, coefficient: 1 },
              ],
            },
          ],
        },
        {
          id: generateId(),
          nom: 'Sciences Humaines et Sociales',
          sousDomaines: [
            {
              id: generateId(),
              nom: 'Histoire - Géographie',
              matieres: [
                { id: generateId(), nom: 'Histoire / Géographie', bareme: 20, coefficient: 1 },
                { id: generateId(), nom: 'Éducation civique', bareme: 20, coefficient: 1 },
              ],
            },
          ],
        },
        {
          id: generateId(),
          nom: 'Arts et Éducation physique',
          sousDomaines: [
            {
              id: generateId(),
              nom: 'Arts',
              matieres: [
                { id: generateId(), nom: 'Dessin / Arts plastiques', bareme: 20, coefficient: 1 },
              ],
            },
            {
              id: generateId(),
              nom: 'Éducation physique',
              matieres: [
                { id: generateId(), nom: 'EPS', bareme: 20, coefficient: 1 },
              ],
            },
          ],
        },
      ],
    }));
  };

  return (
    <AppLayout>
      <PageHeader
        title={isNew ? 'Nouveau modèle de bulletin' : `Modifier : ${form.nom || existing?.nom}`}
        subtitle="Configurez les domaines, sous-domaines, matières et barèmes."
        breadcrumb={
          <Link href="/modeles" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft size={14} />
            Modèles
          </Link>
        }
      />

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings2 size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Paramètres généraux</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du modèle *</label>
              <input
                required
                type="text"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="ex : Bulletin trimestriel CM2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TypeBulletin }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'admission (/10)</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={form.seuilAdmission}
                onChange={(e) => setForm((f) => ({ ...f, seuilAdmission: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'afficherRang', label: 'Afficher le rang' },
              { key: 'afficherSignatures', label: 'Signatures' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Template */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Template de bulletin</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.template === t.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={t.value}
                  checked={form.template === t.value}
                  onChange={() => setForm((f) => ({ ...f, template: t.value }))}
                  className="mt-0.5"
                />
                <div>
                  <p className={`text-sm font-semibold ${form.template === t.value ? 'text-blue-700' : 'text-gray-800'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Domaines */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Domaines, sous-domaines & matières</h2>
              {totalMax > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">Total max actuel : <strong>{totalMax} pts</strong></p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {form.domaines.length === 0 && (
                <button
                  type="button"
                  onClick={addDefaultSenegal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Modèle sénégalais
                </button>
              )}
              <button
                type="button"
                onClick={addDomaine}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <Plus size={12} />
                Ajouter un domaine
              </button>
            </div>
          </div>

          {form.domaines.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-sm mb-2">Aucun domaine défini.</p>
              <p className="text-xs">Cliquez sur "Ajouter un domaine" ou utilisez le modèle sénégalais.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.domaines.map((d, idx) => (
                <DomaineBlock
                  key={d.id}
                  domaine={d}
                  onUpdate={(updated) => updateDomaine(idx, updated)}
                  onDelete={() => deleteDomaine(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/modeles"
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Save size={16} />
            {saved ? '✓ Enregistré !' : isNew ? 'Créer le modèle' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
