// app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { getSessionFromRequest } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const type = searchParams.get('type') || 'visits'; // Default to visits if not specified
    
    if (type === 'patients') {
      return exportPatients();
    } else {
      return exportVisits(date);
    }
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function exportVisits(date: string) {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const visits = await prisma.visit.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      patient: true,
    },
    orderBy: { queueNumber: 'asc' },
  });

  // Generate CSV for visits
  const csvHeader = 'N° File,Patient,Téléphone,Email,Statut,Raison,Heure,Date\n';
  const csvRows = visits.map(visit => {
    const status = visit.status === 'WAITING' ? 'En attente' : 
                   visit.status === 'IN_ROOM' ? 'En consultation' : 'Terminé';
    const patient = visit.patient;
    const visitDate = new Date(visit.createdAt);
    
    return [
      visit.queueNumber,
      patient?.name || visit.patientName || '',
      patient?.phone || visit.patientPhone || '',
      patient?.email || '',
      status,
      visit.reason || '',
      visitDate.toLocaleTimeString('fr-FR'),
      visitDate.toLocaleDateString('fr-FR'),
    ].map(field => `"${String(field || '')}"`).join(',');
  }).join('\n');

  const csv = csvHeader + csvRows;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="visites-${date}.csv"`,
    },
  });
}

async function exportPatients() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          visits: true,
        },
      },
      visits: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      },
    },
  });

  // Generate CSV for patients
  const csvHeader = 'Nom,Téléphone,Email,Date de naissance,Genre,Adresse,Nombre de visites,Dernière visite,Date d\'inscription\n';
  
  const csvRows = patients.map(patient => {
    const lastVisit = patient.visits[0];
    const birthDate = patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('fr-FR') : '';
    const lastVisitDate = lastVisit ? new Date(lastVisit.createdAt).toLocaleDateString('fr-FR') : '';
    const createdAt = new Date(patient.createdAt).toLocaleDateString('fr-FR');
    
    return [
      patient.name,
      patient.phone,
      patient.email || '',
      birthDate,
      patient.gender || '',
      patient.address || '',
      patient._count.visits,
      lastVisitDate,
      createdAt,
    ].map(field => `"${String(field || '')}"`).join(',');
  }).join('\n');

  const csv = csvHeader + csvRows;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="patients.csv"',
    },
  });
}