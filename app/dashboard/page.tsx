'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/ui/StatCard';
import { Users, FileText, BookOpen, History, Plus, ArrowRight, GraduationCap, School } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { etablissement, classes, modeles, sessions } = useStore();

  const activeClasses = classes.filter((c) => !c.archived);
  const totalEleves = activeClasses.reduce((s, c) => s + c.eleves.length, 0);
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
      >
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <GraduationCap size={200} className="absolute -right-10 -top-10 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">
            {etablissement?.nom || 'Mon établissement'}
          </p>
          <h1 className="text-2xl font-bold mb-1">Tableau de bord</h1>
          <p className="text-blue-200 text-sm">
            {etablissement?.anneeScolaire
              ? `Année scolaire ${etablissement.anneeScolaire}`
              : 'Bienvenue sur BulletinPro – Configurez votre établissement pour commencer.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Classes actives" value={activeClasses.length} icon={School} color="blue" />
        <StatCard label="Élèves inscrits" value={totalEleves} icon={Users} color="green" />
        <StatCard label="Modèles de bulletins" value={modeles.length} icon={FileText} color="amber" />
        <StatCard label="Sessions de notes" value={sessions.length} icon={BookOpen} color="purple" />
      </div>

      {/* Quick actions + Recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <Link
                href="/classes"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 group transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <Plus size={16} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  Créer une classe
                </span>
              </Link>
              <Link
                href="/modeles"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 group transition-colors"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">
                  Créer un modèle
                </span>
              </Link>
              <Link
                href="/classes"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 group transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <BookOpen size={16} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Saisir des notes
                </span>
              </Link>
              <Link
                href="/historique"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 group transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                  <History size={16} className="text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                  Voir l'historique
                </span>
              </Link>
            </div>
          </div>

          {/* Setup prompt if no etablissement */}
          {!etablissement?.nom && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Configuration initiale</p>
              <p className="text-xs text-amber-700 mb-3">
                Configurez les informations de votre établissement pour personnaliser vos bulletins.
              </p>
              <Link
                href="/etablissement"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
              >
                Configurer <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Sessions récentes</h2>
              <Link
                href="/historique"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <BookOpen size={32} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Aucune session de notes créée.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Sélectionnez une classe pour commencer la saisie.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentSessions.map((session) => {
                  const classe = classes.find((c) => c.id === session.classeId);
                  const modele = modeles.find((m) => m.id === session.modeleBulletinId);
                  return (
                    <Link
                      key={session.id}
                      href={`/bulletins/${session.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {classe?.nom || '—'} · {session.periode}
                        </p>
                        <p className="text-xs text-gray-400">
                          {modele?.nom} · {formatDate(session.dateModification)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          session.statut === 'finalise'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
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
    </AppLayout>
  );
}
