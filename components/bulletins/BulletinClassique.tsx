'use client';

import type { Etablissement, Classe, Eleve, ModeleBulletin, NoteEleve } from '@/lib/types';
import { getAllMatieres, getTotalMax } from '@/lib/calculations';

interface BulletinClassiqueProps {
  etablissement: Etablissement | null;
  classe: Classe;
  eleve: Eleve;
  modele: ModeleBulletin;
  noteEleve: NoteEleve;
  periode: string;
  anneeScolaire: string;
}

export default function BulletinClassique({
  etablissement,
  classe,
  eleve,
  modele,
  noteEleve,
  periode,
  anneeScolaire,
}: BulletinClassiqueProps) {
  const matieres = getAllMatieres(modele);
  const totalMax = getTotalMax(modele);

  const getNote = (matiereId: string): number | null => {
    const nm = noteEleve.notes.find((n) => n.matiereId === matiereId);
    return nm?.valeur ?? null;
  };

  const formatNote = (val: number | null, bareme: number) => {
    if (val === null || val === undefined) return '—';
    return `${val}/${bareme}`;
  };

  return (
    <div
      className="bulletin-a4 bg-white text-black"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 14mm',
        fontFamily: 'Times New Roman, serif',
        fontSize: '10pt',
        boxSizing: 'border-box',
      }}
    >
      {/* Header République */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6mm', borderBottom: '2px solid #1e3a5f', paddingBottom: '4mm' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontWeight: 'bold', fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {etablissement?.pays || 'République du Sénégal'}
          </p>
          <p style={{ fontSize: '8pt', marginTop: '2px' }}>
            {etablissement?.academie || 'Ministère de l\'Éducation Nationale'}
          </p>
          {etablissement?.ia && <p style={{ fontSize: '8pt' }}>{etablissement.ia}</p>}
          {etablissement?.ief && <p style={{ fontSize: '8pt' }}>{etablissement.ief}</p>}
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', width: '60px', flexShrink: 0 }}>
          {etablissement?.logo ? (
            <img src={etablissement.logo} alt="Logo" style={{ maxWidth: '50px', maxHeight: '50px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '50px', height: '50px', border: '1px dashed #ccc', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7pt', color: '#999' }}>
              Logo
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontWeight: 'bold', fontSize: '12pt', color: '#1e3a5f' }}>BULLETIN SCOLAIRE</p>
          <p style={{ fontSize: '9pt', marginTop: '2px', color: '#1e3a5f' }}>{periode.toUpperCase()}</p>
          <p style={{ fontSize: '8pt', marginTop: '4px' }}>Année scolaire : <strong>{anneeScolaire}</strong></p>
        </div>
      </div>

      {/* Infos établissement et élève */}
      <div style={{ display: 'flex', gap: '8mm', marginBottom: '5mm' }}>
        <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '4px', padding: '4mm', fontSize: '9pt' }}>
          <p style={{ fontWeight: 'bold', fontSize: '9pt', marginBottom: '3px', color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: '2px' }}>
            ÉTABLISSEMENT
          </p>
          <p><strong>{etablissement?.nom || '—'}</strong></p>
          {classe.enseignant && <p style={{ marginTop: '2px' }}>Enseignant(e) : {classe.enseignant}</p>}
        </div>
        <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '4px', padding: '4mm', fontSize: '9pt' }}>
          <p style={{ fontWeight: 'bold', fontSize: '9pt', marginBottom: '3px', color: '#1e3a5f', borderBottom: '1px solid #e5e7eb', paddingBottom: '2px' }}>
            ÉLÈVE
          </p>
          <p><strong>Prénom :</strong> {eleve.prenom}</p>
          <p><strong>Nom :</strong> {eleve.nom.toUpperCase()}</p>
          <p><strong>Classe :</strong> {classe.nom} ({classe.niveau})</p>
          {eleve.matricule && <p><strong>Matricule :</strong> {eleve.matricule}</p>}
        </div>
      </div>

      {/* Résultats summary */}
      <div style={{ display: 'flex', gap: '4mm', marginBottom: '5mm' }}>
        {[
          { label: 'Total obtenu', value: `${noteEleve.total ?? '—'} / ${totalMax}` },
          { label: 'Moyenne', value: `${noteEleve.moyenne?.toFixed(2) ?? '—'} / 10` },
          ...(modele.afficherRang ? [{ label: 'Rang', value: noteEleve.rang ? `${noteEleve.rang}e` : '—' }] : []),
          { label: 'Décision', value: noteEleve.statut ?? '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              flex: 1,
              border: '1px solid #1e3a5f',
              borderRadius: '4px',
              padding: '3mm',
              textAlign: 'center',
              background: label === 'Décision'
                ? noteEleve.statut === 'Admis' ? '#dcfce7' : '#fee2e2'
                : '#f8fafc',
            }}
          >
            <p style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#1e3a5f' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Notes table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '5mm' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>Domaine / Matière</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', width: '60px' }}>Note</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', width: '60px' }}>Barème</th>
            <th style={{ padding: '4px 6px', textAlign: 'center', width: '40px' }}>Coef.</th>
          </tr>
        </thead>
        <tbody>
          {modele.domaines.map((domaine, di) => (
            <>
              {/* Domaine header */}
              <tr key={`d-${domaine.id}`} style={{ backgroundColor: '#e0e7ef' }}>
                <td
                  colSpan={4}
                  style={{ padding: '3px 8px', fontWeight: 'bold', fontSize: '9pt', color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.3px' }}
                >
                  {domaine.nom}
                </td>
              </tr>
              {domaine.sousDomaines.map((sd) => (
                <>
                  {sd.nom && (
                    <tr key={`sd-${sd.id}`} style={{ backgroundColor: '#f1f5f9' }}>
                      <td
                        colSpan={4}
                        style={{ padding: '2px 12px', fontStyle: 'italic', fontSize: '8.5pt', color: '#475569' }}
                      >
                        {sd.nom}
                      </td>
                    </tr>
                  )}
                  {sd.matieres.map((matiere, mi) => {
                    const val = getNote(matiere.id);
                    const isLow = val !== null && val < matiere.bareme * 0.5;
                    return (
                      <tr key={matiere.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: mi % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '3px 16px' }}>{matiere.nom}</td>
                        <td
                          style={{
                            padding: '3px 6px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: isLow ? '#dc2626' : '#1e3a5f',
                          }}
                        >
                          {val !== null ? val : '—'}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6b7280' }}>
                          {matiere.bareme}
                        </td>
                        <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6b7280' }}>
                          {matiere.coefficient}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#1e3a5f', color: 'white', fontWeight: 'bold' }}>
            <td style={{ padding: '4px 8px' }}>TOTAL</td>
            <td style={{ padding: '4px 6px', textAlign: 'center' }}>{noteEleve.total ?? '—'}</td>
            <td style={{ padding: '4px 6px', textAlign: 'center' }}>{totalMax}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Appréciation */}
      <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4mm', marginBottom: '8mm', minHeight: '18mm' }}>
        <p style={{ fontWeight: 'bold', fontSize: '9pt', color: '#1e3a5f', marginBottom: '3px' }}>
          Appréciation du maître :
        </p>
        <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#374151' }}>
          {noteEleve.appreciation || ''}
        </p>
      </div>

      {/* Signatures */}
      {modele.afficherSignatures && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5mm' }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <p style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '10mm' }}>
              Signature du maître
            </p>
            {etablissement?.signatureEnseignant ? (
              <img src={etablissement.signatureEnseignant} alt="Signature enseignant" style={{ maxHeight: '20mm', maxWidth: '60mm', objectFit: 'contain' }} />
            ) : (
              <div style={{ borderBottom: '1px solid #374151', width: '80%', margin: '0 auto' }} />
            )}
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <p style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '10mm' }}>
              Signature du directeur
            </p>
            {etablissement?.signatureDirecteur ? (
              <img src={etablissement.signatureDirecteur} alt="Signature directeur" style={{ maxHeight: '20mm', maxWidth: '60mm', objectFit: 'contain' }} />
            ) : (
              <div style={{ borderBottom: '1px solid #374151', width: '80%', margin: '0 auto' }} />
            )}
          </div>
        </div>
      )}

      {/* Cachet */}
      {etablissement?.cachet && (
        <div style={{ position: 'absolute', bottom: '15mm', right: '15mm' }}>
          <img src={etablissement.cachet} alt="Cachet" style={{ maxHeight: '25mm', maxWidth: '40mm', objectFit: 'contain', opacity: 0.8 }} />
        </div>
      )}
    </div>
  );
}
