'use client';

import { useState, useEffect, useRef } from 'react';
import type { CreateVisitDto, PatientWithStats } from '@/src/types';
import PatientForm from './patient-form';

interface VisitFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VisitForm({ onClose, onSuccess }: VisitFormProps) {
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithStats | null>(null);
  const [showPatientList, setShowPatientList] = useState(true);
  
  const [reason, setReason] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);

  // Load patients for selection
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients based on search term - with null safety
  const filteredPatients = patients.filter(patient => {
    if (!patient) return false;
    
    const name = patient.name || '';
    const phone = patient.phone || '';
    const email = patient.email || '';
    
    const nameMatch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = phone.includes(searchTerm);
    const emailMatch = email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return nameMatch || phoneMatch || emailMatch;
  });

  const handlePatientSelect = (patient: PatientWithStats) => {
    setSelectedPatient(patient);
    setShowPatientList(false);
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setShowPatientList(true);
  };

  const handleShowPatientList = () => {
    setShowPatientList(true);
    setSearchTerm('');
  };

  const handlePatientCreated = (newPatient: any) => {
    // Ensure the new patient has all required fields
    const completePatient: PatientWithStats = {
      id: newPatient.id,
      name: newPatient.name || '',
      phone: newPatient.phone || '',
      email: newPatient.email || undefined,
      birthDate: newPatient.birthDate ? new Date(newPatient.birthDate) : undefined,
      gender: newPatient.gender || undefined,
      address: newPatient.address || undefined,
      createdAt: newPatient.createdAt ? new Date(newPatient.createdAt) : new Date(),
      updatedAt: newPatient.updatedAt ? new Date(newPatient.updatedAt) : new Date(),
      visitCount: newPatient.visitCount || 0,
      lastVisitDate: newPatient.lastVisitDate ? new Date(newPatient.lastVisitDate) : undefined
    };

    // Add the new patient to the list
    setPatients(prev => [completePatient, ...prev]);
    // Select the newly created patient
    setSelectedPatient(completePatient);
    setShowPatientForm(false);
    setShowPatientList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formRef.current) {
      formRef.current.addEventListener('submit', (e) => e.preventDefault());
    }
    
    setError('');
    
    if (!selectedPatient) {
      setError('Veuillez sélectionner un patient');
      return;
    }

    setLoading(true);

    try {
      const visitData: CreateVisitDto = {
        patientId: selectedPatient.id, // Now sending patientId instead of name/phone
        reason: reason || undefined,
      };

      console.log('Sending visit data:', visitData);

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création de la visite');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">➕ Nouvelle Visite</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un patient *
              </label>
              
              {selectedPatient && !showPatientList ? (
                <div className="space-y-3">
                  {/* Selected Patient Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedPatient.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{selectedPatient.name || 'Nom inconnu'}</p>
                          <p className="text-sm text-gray-600">{selectedPatient.phone || 'Pas de téléphone'}</p>
                          {selectedPatient.email && (
                            <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Changer de patient"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleShowPatientList}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sélectionner un autre patient
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher par nom, téléphone ou email..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Patients List */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                    {loadingPatients ? (
                      <div className="text-center py-6">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Chargement des patients...</p>
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="text-center py-6">
                        <svg className="w-8 h-8 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <p className="text-sm text-gray-500 mt-2">Aucun patient trouvé</p>
                        {searchTerm && (
                          <p className="text-xs text-gray-400 mt-1">Essayez un autre terme de recherche</p>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {patient.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{patient.name || 'Nom inconnu'}</p>
                              <p className="text-sm text-gray-600">{patient.phone || 'Pas de téléphone'}</p>
                              {patient.email && (
                                <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                              )}
                            </div>
                            <div className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {patient.visitCount || 0} visites
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create New Patient Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPatientForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Créer un nouveau patient
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Visit Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de la visite
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Ex: Consultation de routine, Contrôle, Vaccination..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPatient}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création...
                  </span>
                ) : (
                  'Créer la visite'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          onClose={() => setShowPatientForm(false)}
          onSuccess={(newPatient) => handlePatientCreated(newPatient)}
        />
      )}
    </>
  );
}