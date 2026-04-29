'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { generateId, fileToBase64 } from '@/lib/utils';
import { Save, Upload, X, School, ImageIcon } from 'lucide-react';

export default function EtablissementPage() {
  const { etablissement, setEtablissement } = useStore();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nom: etablissement?.nom || '',
    pays: etablissement?.pays || 'Sénégal',
    academie: etablissement?.academie || '',
    ia: etablissement?.ia || '',
    ief: etablissement?.ief || '',
    anneeScolaire: etablissement?.anneeScolaire || '2024-2025',
    logo: etablissement?.logo || '',
    signatureEnseignant: etablissement?.signatureEnseignant || '',
    signatureDirecteur: etablissement?.signatureDirecteur || '',
    cachet: etablissement?.cachet || '',
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const sigEnsRef = useRef<HTMLInputElement>(null);
  const sigDirRef = useRef<HTMLInputElement>(null);
  const cachetRef = useRef<HTMLInputElement>(null);

  const handleImage = async (field: keyof typeof form, file: File | undefined) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm((f) => ({ ...f, [field]: b64 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEtablissement({ id: etablissement?.id || generateId(), ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearImage = (field: keyof typeof form) =>
    setForm((f) => ({ ...f, [field]: '' }));

  const ImageField = ({
    field,
    label,
    inputRef,
  }: {
    field: 'logo' | 'signatureEnseignant' | 'signatureDirecteur' | 'cachet';
    label: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {form[field] ? (
        <div className="relative inline-block">
          <img
            src={form[field]}
            alt={label}
            className="h-16 object-contain border border-gray-200 rounded-lg p-1 bg-white"
          />
          <button
            type="button"
            onClick={() => clearImage(field)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Upload size={14} />
          Télécharger une image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImage(field, e.target.files?.[0])}
      />
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Paramètres de l'établissement"
        subtitle="Ces informations apparaîtront sur tous vos bulletins."
        action={
          saved ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              ✓ Enregistré
            </span>
          ) : undefined
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Informations générales */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <School size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Informations générales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="ex : École Primaire Élémentaire de Dakar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={form.pays}
                onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année scolaire
              </label>
              <input
                type="text"
                value={form.anneeScolaire}
                onChange={(e) => setForm((f) => ({ ...f, anneeScolaire: e.target.value }))}
                placeholder="ex : 2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Académie / Région
              </label>
              <input
                type="text"
                value={form.academie}
                onChange={(e) => setForm((f) => ({ ...f, academie: e.target.value }))}
                placeholder="ex : Académie de Dakar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IA (Inspection d'Académie)
              </label>
              <input
                type="text"
                value={form.ia}
                onChange={(e) => setForm((f) => ({ ...f, ia: e.target.value }))}
                placeholder="ex : IA de Dakar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IEF (Inspection de l'Éducation et de la Formation)
              </label>
              <input
                type="text"
                value={form.ief}
                onChange={(e) => setForm((f) => ({ ...f, ief: e.target.value }))}
                placeholder="ex : IEF Dakar-Plateau"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Identité visuelle */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Identité visuelle & Signatures</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ImageField field="logo" label="Logo de l'établissement" inputRef={logoRef} />
            <ImageField field="signatureEnseignant" label="Signature de l'enseignant" inputRef={sigEnsRef} />
            <ImageField field="signatureDirecteur" label="Signature du directeur" inputRef={sigDirRef} />
            <ImageField field="cachet" label="Cachet (optionnel)" inputRef={cachetRef} />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Formats acceptés : PNG, JPG, SVG. Taille recommandée : 300×150 px ou moins.
          </p>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save size={16} />
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
