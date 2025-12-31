'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VisitBoard from '@/src/components/visit-board';
import VisitForm from '@/src/components/visit-form';
import PatientBoard from '@/src/components/patient-board'; // Changed from PatientList
import PatientForm from '@/src/components/patient-form';
import type { Visit, Patient } from '@/src/types';

export default function DashboardPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isPatientsView, setIsPatientsView] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientStats, setPatientStats] = useState({
    total: 0,
    newToday: 0,
    hasVisits: 0
  });

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadVisits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/visits?date=${selectedDate}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (error) {
      console.error('Error loading visits:', error);
      showToast('❌ Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      const res = await fetch('/api/patients');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setPatients(data.patients || []);
      
      // Calculate patient statistics
      if (data.patients) {
        const today = new Date().toISOString().split('T')[0];
        const newToday = data.patients.filter((p: Patient) => 
          new Date(p.createdAt).toISOString().split('T')[0] === today
        ).length;
        
        const hasVisits = data.patients.filter((p: any) => 
          p.visitCount && p.visitCount > 0
        ).length;
        
        setPatientStats({
          total: data.patients.length,
          newToday,
          hasVisits
        });
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      showToast('❌ Erreur lors du chargement des patients');
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    if (isPatientsView) {
      loadPatients();
      const interval = setInterval(loadPatients, 1500000);
      return () => clearInterval(interval);
    } else {
      loadVisits();
      const interval = setInterval(loadVisits, 1000000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, isPatientsView]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
  };

const handleExport = async () => {
  const exportType = isPatientsView ? 'patients' : 'visits';
  const url = isPatientsView 
    ? `/api/export?type=patients`
    : `/api/export?date=${selectedDate}&type=visits`;
  
  window.open(url, '_blank');
  showToast(`📥 Export ${exportType} en cours...`);
};

  const handleViewToggle = () => {
    setIsPatientsView(!isPatientsView);
    showToast(isPatientsView ? '📋 Vue visites' : '👥 Vue patients');
  };

  const stats = {
    total: visits.length,
    waiting: visits.filter(v => v.status === 'WAITING').length,
    inRoom: visits.filter(v => v.status === 'IN_ROOM').length,
    finished: visits.filter(v => v.status === 'FINISHED').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.finished / stats.total) * 100) : 0;

  if (loading && !isPatientsView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des visites...</p>
        </div>
      </div>
    );
  }

  if (patientsLoading && isPatientsView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ClinicQueue
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isPatientsView ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                  {isPatientsView ? 'Vue patients en direct' : 'Tableau de bord en direct'}
                  {isPatientsView && ` • ${patientStats.total} patients`}
                  {!isPatientsView && ` • ${visits.length} visites`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* View Toggle Button */}
              <button
                onClick={handleViewToggle}
                className={`relative group px-4 py-2.5 rounded-xl font-medium overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${
                  isPatientsView 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300'
                }`}
              >
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <span className="relative flex items-center gap-2">
                  {isPatientsView ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Vue visites
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Vue patients
                    </>
                  )}
                </span>
              </button>

              {/* Date Picker - Only show for visits view */}
              {!isPatientsView && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity"></div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="relative px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                  />
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="relative group px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium overflow-hidden transition-all hover:shadow-lg hover:scale-105"
              >
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </span>
              </button>

              {/* New Visit/Patient Button */}
              <button
                onClick={() => setShowForm(true)}
                className="relative group px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold overflow-hidden transition-all hover:shadow-2xl hover:scale-105"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {isPatientsView ? 'Nouveau Patient' : 'Nouvelle Visite'}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all hover:scale-110"
                title="Déconnexion"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conditional Rendering based on view */}
      {isPatientsView ? (
        /* Patients Overview Content */
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Patient Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Patients totaux</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{patientStats.total}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Nouveaux aujourd'hui</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">+{patientStats.newToday}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Avec visites</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{patientStats.hasVisits}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Board - Changed from PatientList */}
          <PatientBoard 
            patients={patients} 
            loading={patientsLoading}
            onRefresh={loadPatients}
            onShowToast={showToast}
          />
        </div>
      ) : (
        /* Visits Overview Content */
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Visit Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total visites</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">En attente</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.waiting}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">En consultation</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.inRoom}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Terminées</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-emerald-600">{stats.finished}</p>
                    <span className="text-sm text-gray-500">({completionRate}%)</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visit Board */}
          <VisitBoard visits={visits} onRefresh={loadVisits} onShowToast={showToast} />
        </div>
      )}

      {/* Form Modal - Conditional rendering for VisitForm or PatientForm */}
      {showForm && (
        isPatientsView ? (
          <PatientForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadPatients();
              showToast('✅ Patient créé avec succès !');
            }}
          />
        ) : (
          <VisitForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadVisits();
              showToast('✅ Visite créée avec succès !');
            }}
          />
        )
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{notificationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}