// src/components/patient-board.tsx
'use client';

import { useState } from 'react';
import type { Patient, PatientWithStats } from '@/src/types';

interface PatientBoardProps {
  patients: PatientWithStats[];
  onRefresh: () => void;
  onShowToast?: (message: string) => void;
  onEditPatient?: (patient: Patient) => void;
}

export default function PatientBoard({ patients, onRefresh, onShowToast, onEditPatient }: PatientBoardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'withVisits' | 'newToday'>('all');

  // Filter patients based on search and filter criteria
  const filteredPatients = patients.filter(patient => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Additional filters
    if (selectedFilter === 'withVisits') {
      return matchesSearch && (patient.visitCount || 0) > 0;
    }
    if (selectedFilter === 'newToday') {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && patient.createdAt.toString().startsWith(today);
    }
    return matchesSearch;
  });

  // Group patients by first letter for alphabetical sections
  const groupedByLetter = filteredPatients.reduce((acc, patient) => {
    const firstLetter = patient.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(patient);
    return acc;
  }, {} as Record<string, PatientWithStats[]>);

  // Sort alphabetically
  const sortedLetters = Object.keys(groupedByLetter).sort();

  const deletePatient = async (id: string) => {
    if (!confirm('🗑️ Supprimer ce patient et toutes ses visites ?')) return;
    
    setDeletingId(id);
    try {
      await fetch(`/api/patients?id=${id}`, { method: 'DELETE' });
      onRefresh();
      onShowToast?.('🗑️ Patient et visites associées supprimés');
    } catch (error) {
      console.error('Error deleting patient:', error);
      onShowToast?.('❌ Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: patients.length,
    withVisits: patients.filter(p => (p.visitCount || 0) > 0).length,
    newToday: patients.filter(p => {
      const today = new Date().toISOString().split('T')[0];
      return p.createdAt.toString().startsWith(today);
    }).length,
    avgVisits: patients.length > 0 
      ? (patients.reduce((sum, p) => sum + (p.visitCount || 0), 0) / patients.length).toFixed(1)
      : '0'
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Patients total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Avec visites</p>
              <p className="text-2xl font-bold mt-1">{stats.withVisits}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Nouveaux aujourd'hui</p>
              <p className="text-2xl font-bold mt-1">{stats.newToday}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🆕</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Moy. visites</p>
              <p className="text-2xl font-bold mt-1">{stats.avgVisits}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un patient par nom, téléphone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${selectedFilter === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedFilter('withVisits')}
              className={`px-4 py-2 rounded-xl transition-all ${selectedFilter === 'withVisits' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Avec visites
            </button>
            <button
              onClick={() => setSelectedFilter('newToday')}
              className={`px-4 py-2 rounded-xl transition-all ${selectedFilter === 'newToday' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Nouveaux
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        {sortedLetters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-20">👤</div>
            <p className="text-gray-500 text-lg">Aucun patient trouvé</p>
            <p className="text-gray-400 mt-2">Modifiez vos critères de recherche</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedLetters.map((letter, letterIdx) => (
              <div key={letter} className="animate-fade-in-up" style={{ animationDelay: `${letterIdx * 50}ms` }}>
                {/* Letter Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{letter}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {letter} <span className="text-gray-500 text-sm font-normal">({groupedByLetter[letter].length} patient{groupedByLetter[letter].length !== 1 ? 's' : ''})</span>
                    </h3>
                  </div>
                </div>

                {/* Patients in this letter */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {groupedByLetter[letter].map((patient, idx) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onDelete={deletePatient}
                      onEdit={onEditPatient}
                      isDeleting={deletingId === patient.id}
                      animationDelay={idx * 30}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PatientCardProps {
  patient: PatientWithStats;
  onDelete: (id: string) => void;
  onEdit?: (patient: Patient) => void;
  isDeleting: boolean;
  animationDelay: number;
}

function PatientCard({ patient, onDelete, onEdit, isDeleting, animationDelay }: PatientCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isDeleting) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-scale-out border-2 border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Suppression...</p>
        </div>
      </div>
    );
  }

  // Calculate patient age if birthDate exists
  const age = patient.birthDate ? 
    Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
    : null;

  return (
    <div 
      className="group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 animate-fade-in-up cursor-pointer transform hover:-translate-y-1"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit?.(patient)}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 -z-10"></div>

      {/* Header with Actions */}
      <div className="flex items-start justify-between mb-4">
        {/* Patient Avatar and Info */}
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <span className="text-white text-2xl">
                {patient.name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {patient.name}
              </h4>
              {age && (
                <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-2 py-1 rounded-full">
                  {age} ans
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">{patient.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(patient);
            }}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all transform hover:scale-110"
            title="Modifier"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(patient.id);
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all transform hover:scale-110"
            title="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-3">
        {/* Email */}
        {patient.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{patient.email}</span>
          </div>
        )}

        {/* Address */}
        {patient.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="flex-1 line-clamp-2">{patient.address}</span>
          </div>
        )}

        {/* Visit Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patient.visitCount || 0}</div>
              <div className="text-xs text-gray-500">Visites</div>
            </div>
            {patient.lastVisitDate && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {new Date(patient.lastVisitDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </div>
                <div className="text-xs text-gray-500">Dernière</div>
              </div>
            )}
          </div>

          {/* Gender Indicator */}
          {patient.gender && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              patient.gender.toLowerCase() === 'male' 
                ? 'bg-blue-100 text-blue-600'
                : patient.gender.toLowerCase() === 'female'
                ? 'bg-pink-100 text-pink-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {patient.gender === 'male' ? '♂ Homme' : patient.gender === 'female' ? '♀ Femme' : patient.gender}
            </div>
          )}
        </div>

        {/* Creation Date */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Inscrit le {new Date(patient.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}