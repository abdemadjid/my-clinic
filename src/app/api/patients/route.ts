// app/api/patients/route.ts - UPDATED GET method
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { getSessionFromRequest } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            visits: true, // This adds visit count
          },
        },
        // Optional: include last visit for date
        visits: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        },
      },
    });

    // Transform patients to include visitCount and lastVisitDate
    const patientsWithStats = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      visitCount: patient._count.visits, // Add visit count
      lastVisitDate: patient.visits[0]?.createdAt, // Add last visit date
    }));

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = await prisma.patient.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const withVisits = patients.filter(p => p._count.visits > 0).length;

    return NextResponse.json({ 
      patients: patientsWithStats,
      total: patients.length,
      stats: {
        total: patients.length,
        newToday,
        withVisits,
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST, PATCH, DELETE methods remain the same...
export async function POST(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, birthDate, gender, address } = body;

    // Check if patient with phone already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { phone },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Un patient avec ce numéro de téléphone existe déjà' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        phone,
        email,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
        address,
      },
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await request.json();

    // If phone is being updated, check if it's already taken
    if (updateData.phone) {
      const existingPatient = await prisma.patient.findFirst({
        where: {
          phone: updateData.phone,
          NOT: { id },
        },
      });

      if (existingPatient) {
        return NextResponse.json(
          { error: 'Un patient avec ce numéro de téléphone existe déjà' },
          { status: 400 }
        );
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.patient.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}