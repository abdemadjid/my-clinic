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
    const date = searchParams.get('date');
    
    let where = {};
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where = {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { queueNumber: 'asc' },
      ],
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// app/api/visits/route.ts - POST method
export async function POST(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, reason } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'L\'identifiant du patient est requis' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Get next queue number for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastVisit = await prisma.visit.findFirst({
      where: { createdAt: { gte: today } },
      orderBy: { queueNumber: 'desc' },
    });

    const queueNumber = (lastVisit?.queueNumber || 0) + 1;

    // Create visit with patient reference
    const visit = await prisma.visit.create({
      data: {
        queueNumber,
        patientId: patient.id,
        patientName: patient.name, // Denormalized for easier queries
        patientPhone: patient.phone, // Denormalized for easier queries
        reason,
        status: 'WAITING',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating visit:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Erreur de contrainte unique' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id, status, patientName, patientPhone, patientEmail, reason } = await request.json();

    const dataToUpdate: any = {};

    if (status !== undefined) {
      dataToUpdate.status = status;
    }

    if (reason !== undefined) {
      dataToUpdate.reason = reason;
    }

    // If patient details are being updated
    if (patientName !== undefined || patientPhone !== undefined || patientEmail !== undefined) {
      // Get current visit to find patient
      const currentVisit = await prisma.visit.findUnique({
        where: { id },
        include: { patient: true }
      });

      if (currentVisit?.patient) {
        // Update patient details
        const patientUpdateData: any = {};
        if (patientName !== undefined) patientUpdateData.name = patientName;
        if (patientPhone !== undefined) patientUpdateData.phone = patientPhone;
        if (patientEmail !== undefined) patientUpdateData.email = patientEmail;

        await prisma.patient.update({
          where: { id: currentVisit.patient.id },
          data: patientUpdateData,
        });

        // Update denormalized fields in visit
        if (patientName !== undefined) dataToUpdate.patientName = patientName;
        if (patientPhone !== undefined) dataToUpdate.patientPhone = patientPhone;
      }
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: dataToUpdate,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ visit });
  } catch (error: any) {
    console.error('Error updating visit:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé par un autre patient' },
        { status: 400 }
      );
    }
    
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

    await prisma.visit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}