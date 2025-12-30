// src/components/visit-board.tsx
'use client';

import { useState } from 'react';
import type { Visit, VisitStatus } from '@/src/types';

interface VisitBoardProps {
  visits: Visit[];
  onRefresh: () => void;
  onShowToast?: (message: string) => void;
}

export default function VisitBoard({ visits, onRefresh, onShowToast }: VisitBoardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = {
    WAITING: visits.filter(v => v.status === 'WAITING'),
    IN_ROOM: visits.filter(v => v.status === 'IN_ROOM'),
    FINISHED: visits.filter(v => v.status === 'FINISHED'),
  };

  const updateStatus = async (id: string, status: VisitStatus) => {
    try {
      await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      onRefresh();
      onShowToast?.('✨ Statut mis à jour !');
    } catch (error) {
      console.error('Error updating status:', error);
      onShowToast?.('❌ Erreur lors de la mise à jour');
    }
  };

  const deleteVisit = async (id: string) => {
    if (!confirm('🗑️ Supprimer cette visite ?')) return;
    
    setDeletingId(id);
    try {
      await fetch(`/api/visits?id=${id}`, { method: 'DELETE' });
      onRefresh();
      onShowToast?.('🗑️ Visite supprimée');
    } catch (error) {
      console.error('Error deleting visit:', error);
      onShowToast?.('❌ Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      status: 'WAITING' as VisitStatus,
      title: 'En attente',
      icon: '⏳',
      gradient: 'from-amber-400 via-orange-400 to-red-400',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      count: grouped.WAITING.length,
    },
    {
      status: 'IN_ROOM' as VisitStatus,
      title: 'En consultation',
      icon: '🏥',
      gradient: 'from-purple-400 via-pink-400 to-rose-400',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      count: grouped.IN_ROOM.length,
    },
    {
      status: 'FINISHED' as VisitStatus,
      title: 'Terminées',
      icon: '✅',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      count: grouped.FINISHED.length,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((column, idx) => (
        <div 
          key={column.status} 
          className="flex flex-col animate-fade-in-up"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {/* Column Header */}
          <div className={`relative bg-gradient-to-r ${column.gradient} rounded-t-3xl p-5 shadow-xl overflow-hidden group`}>
            {/* Animated Background */}
            <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-0 transition-transform duration-500"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform">
                  {column.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">{column.title}</h3>
                  <p className="text-white/80 text-sm">
                    {column.count} {column.count !== 1 ? 'visites' : 'visite'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center w-12 h-12 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg">
                <span className="text-2xl font-bold text-white">{column.count}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${visits.length > 0 ? (column.count / visits.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Column Body */}
          <div className={`relative bg-gradient-to-br ${column.bgGradient} border-2 ${column.borderColor} rounded-b-3xl p-4 min-h-[500px] max-h-[700px] overflow-y-auto space-y-4 shadow-xl`}>
            {/* Empty State */}
            {grouped[column.status].length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 opacity-50">
                  <div className="text-6xl mb-4 animate-bounce-slow">{column.icon}</div>
                  <p className="text-gray-400 font-medium">Aucune visite</p>
                  <p className="text-gray-300 text-sm mt-2">Les visites apparaîtront ici</p>
                </div>
              </div>
            ) : (
              grouped[column.status].map((visit, idx) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteVisit}
                  isDeleting={deletingId === visit.id}
                  animationDelay={idx * 50}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface VisitCardProps {
  visit: Visit;
  onUpdateStatus: (id: string, status: VisitStatus) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  animationDelay: number;
}

function VisitCard({ visit, onUpdateStatus, onDelete, isDeleting, animationDelay }: VisitCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const nextStatus: Record<VisitStatus, { status: VisitStatus; label: string; icon: string; gradient: string } | null> = {
    WAITING: { 
      status: 'IN_ROOM', 
      label: 'Commencer', 
      icon: '▶️',
      gradient: 'from-purple-500 to-pink-500'
    },
    IN_ROOM: { 
      status: 'FINISHED', 
      label: 'Terminer', 
      icon: '✅',
      gradient: 'from-emerald-500 to-teal-500'
    },
    FINISHED: null,
  };

  const next = nextStatus[visit.status];

  if (isDeleting) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-scale-out">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Suppression...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 animate-fade-in-up cursor-pointer transform hover:-translate-y-1"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 -z-10"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Queue Number Badge */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <span className="text-white font-bold text-xl">{visit.queueNumber}</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
              {visit.patientName}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">{visit.patientPhone}</span>
            </div>
          </div>
        </div>
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(visit.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all transform hover:scale-110 hover:rotate-12"
          title="Supprimer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Reason */}
      {visit.reason && (
        <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-4 overflow-hidden group/reason">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 transform scale-x-0 group-hover/reason:scale-x-100 transition-transform origin-left"></div>
          <p className="relative text-sm text-gray-700 flex items-start gap-2">
            <span className="text-lg">💬</span>
            <span className="flex-1">{visit.reason}</span>
          </p>
        </div>
      )}

      {/* Time Badge */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">
          {new Date(visit.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {isHovered && (
          <span className="text-blue-500 animate-fade-in">
            • Il y a {Math.round((Date.now() - new Date(visit.createdAt).getTime()) / 60000)} min
          </span>
        )}
      </div>

      {/* Action Button */}
      {next && (
        <button
          onClick={() => onUpdateStatus(visit.id, next.status)}
          className={`relative w-full bg-gradient-to-r ${next.gradient} text-white py-3 rounded-xl font-semibold overflow-hidden group/btn transition-all hover:shadow-xl transform hover:scale-105`}
        >
          <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
          <span className="relative flex items-center justify-center gap-2">
            <span className="text-lg transform group-hover/btn:scale-125 transition-transform">
              {next.icon}
            </span>
            <span>{next.label}</span>
          </span>
        </button>
      )}
    </div>
  );
}