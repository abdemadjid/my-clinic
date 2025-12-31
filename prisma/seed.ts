import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse order due to foreign key constraints)
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.visit.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.admin.deleteMany({
    where: { email: 'admin@clinic.com' }
  });

  // Create hashed password
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('📝 Mot de passe hashé créé');

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@clinic.com',
      password: hashedPassword,
      name: 'Admin Principal',
    },
  });

  console.log('✅ Admin créé avec succès:');
  console.log('   Email:', admin.email);
  console.log('   Nom:', admin.name);
  console.log('');

  // Create test patients
  console.log('👥 Création des patients de test...');
  
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Ahmed Benali',
        phone: '0555123456',
        email: 'ahmed.benali@example.com',
        birthDate: new Date('1985-05-15'),
        gender: 'male',
        address: '123 Rue des Orangers, Casablanca',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Fatima Zahra',
        phone: '0666789012',
        email: 'fatima.zahra@example.com',
        birthDate: new Date('1990-08-22'),
        gender: 'female',
        address: '456 Avenue Mohammed V, Rabat',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Karim El Fassi',
        phone: '0777901234',
        email: 'karim.elfassi@example.com',
        birthDate: new Date('1978-11-30'),
        gender: 'male',
        address: '789 Boulevard Hassan II, Marrakech',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Samira Bennis',
        phone: '0666234567',
        email: null,
        birthDate: new Date('1995-03-10'),
        gender: 'female',
        address: null,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Youssef Alaoui',
        phone: '0555890123',
        email: 'youssef.alaoui@example.com',
        birthDate: null,
        gender: 'male',
        address: '321 Rue du Commerce, Tanger',
      },
    }),
  ]);

  console.log(`✅ ${patients.length} patients créés avec succès`);

  // Create test visits
  console.log('📋 Création des visites de test...');
  
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const visits = await Promise.all([
    // Visites pour Ahmed Benali (patient 1)
    prisma.visit.create({
      data: {
        queueNumber: 1,
        patientId: patients[0].id,
        patientName: patients[0].name,
        patientPhone: patients[0].phone,
        status: 'FINISHED',
        reason: 'Consultation de routine',
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    }),
    prisma.visit.create({
      data: {
        queueNumber: 1,
        patientId: patients[0].id,
        patientName: patients[0].name,
        patientPhone: patients[0].phone,
        status: 'WAITING',
        reason: 'Suivi mensuel',
        createdAt: today,
      },
    }),

    // Visites pour Fatima Zahra (patient 2)
    prisma.visit.create({
      data: {
        queueNumber: 2,
        patientId: patients[1].id,
        patientName: patients[1].name,
        patientPhone: patients[1].phone,
        status: 'IN_ROOM',
        reason: 'Contrôle prénatal',
        createdAt: today,
      },
    }),
    prisma.visit.create({
      data: {
        queueNumber: 1,
        patientId: patients[1].id,
        patientName: patients[1].name,
        patientPhone: patients[1].phone,
        status: 'FINISHED',
        reason: 'Première consultation',
        createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
    }),

    // Visite pour Karim El Fassi (patient 3)
    prisma.visit.create({
      data: {
        queueNumber: 3,
        patientId: patients[2].id,
        patientName: patients[2].name,
        patientPhone: patients[2].phone,
        status: 'WAITING',
        reason: 'Douleurs abdominales',
        createdAt: new Date(today.getTime() + 30 * 60000), // 30 minutes later
      },
    }),

    // Visite pour Samira Bennis (patient 4)
    prisma.visit.create({
      data: {
        queueNumber: 4,
        patientId: patients[3].id,
        patientName: patients[3].name,
        patientPhone: patients[3].phone,
        status: 'WAITING',
        reason: 'Vaccination',
        createdAt: new Date(today.getTime() + 45 * 60000), // 45 minutes later
      },
    }),

    // Visite pour Youssef Alaoui (patient 5)
    prisma.visit.create({
      data: {
        queueNumber: 5,
        patientId: patients[4].id,
        patientName: patients[4].name,
        patientPhone: patients[4].phone,
        status: 'WAITING',
        reason: 'Bilan annuel',
        createdAt: new Date(today.getTime() + 60 * 60000), // 60 minutes later
      },
    }),
  ]);

  console.log(`✅ ${visits.length} visites créées avec succès`);

  // Create some patients without visits (for testing)
  const patientsWithoutVisits = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Laila Chraibi',
        phone: '0666345678',
        email: 'laila.chraibi@example.com',
        birthDate: new Date('1988-12-05'),
        gender: 'female',
        address: '654 Rue Atlas, Fès',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Mohamed Tazi',
        phone: '0555678901',
        email: null,
        birthDate: null,
        gender: 'male',
        address: '987 Avenue Al Massira, Agadir',
      },
    }),
  ]);

  console.log(`✅ ${patientsWithoutVisits.length} patients sans visites créés`);

  console.log('');
  console.log('📊 Statistiques de la base de données:');
  console.log(`   - Admins: 1`);
  console.log(`   - Patients: ${patients.length + patientsWithoutVisits.length}`);
  console.log(`   - Patients avec visites: ${patients.length}`);
  console.log(`   - Patients sans visites: ${patientsWithoutVisits.length}`);
  console.log(`   - Visites totales: ${visits.length}`);
  console.log(`   - Visites aujourd'hui: ${visits.filter(v => {
    const visitDate = new Date(v.createdAt);
    return visitDate.toDateString() === today.toDateString();
  }).length}`);
  console.log('');
  console.log('🔑 Identifiants de connexion:');
  console.log('   Email: admin@clinic.com');
  console.log('   Mot de passe: admin123');
  console.log('');
  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });