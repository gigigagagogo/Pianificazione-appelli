import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Course, CourseYear, ExamSession, Materia } from '@server/exams-planning';
import { User, UserRole } from '@server/users';

const DEMO_PASSWORD = 'Password123!';

interface UserSeed {
  name: string;
  surname: string;
  email: string;
}

// Docente Marino non riceve nessun corso assegnato: serve a verificare lo
// stato "nessun corso assegnato" nella pagina di inserimento appelli.
const DOCENTI: UserSeed[] = [
  { name: 'Mario', surname: 'Rossi', email: 'mario.rossi@unibs.it' },
  { name: 'Laura', surname: 'Bianchi', email: 'laura.bianchi@unibs.it' },
  { name: 'Giuseppe', surname: 'Verdi', email: 'giuseppe.verdi@unibs.it' },
  { name: 'Anna', surname: 'Ferrari', email: 'anna.ferrari@unibs.it' },
  { name: 'Marco', surname: 'Colombo', email: 'marco.colombo@unibs.it' },
  { name: 'Chiara', surname: 'Ricci', email: 'chiara.ricci@unibs.it' },
  { name: 'Luca', surname: 'Marino', email: 'luca.marino@unibs.it' },
];

const SEGRETERIA: UserSeed = {
  name: 'Sofia',
  surname: 'Segretari',
  email: 'segreteria@unibs.it',
};

interface CourseSeed {
  code: string;
  name: string;
  years: { yearNumber: number; label: string; docenteEmail?: string }[];
}

const COURSES: CourseSeed[] = [
  {
    code: 'INFTL',
    name: 'Ingegneria Informatica Triennale',
    years: [
      { yearNumber: 1, label: 'INFTL-I', docenteEmail: 'mario.rossi@unibs.it' },
      { yearNumber: 2, label: 'INFTL-II', docenteEmail: 'laura.bianchi@unibs.it' },
    ],
  },
  {
    code: 'INFLM',
    name: 'Ingegneria Informatica Magistrale',
    years: [{ yearNumber: 1, label: 'INFLM-I', docenteEmail: 'giuseppe.verdi@unibs.it' }],
  },
  {
    code: 'MATTL',
    name: 'Matematica Triennale',
    years: [{ yearNumber: 1, label: 'MATTL-I', docenteEmail: 'anna.ferrari@unibs.it' }],
  },
  {
    code: 'ECOTL',
    name: 'Economia Aziendale Triennale',
    years: [{ yearNumber: 1, label: 'ECOTL-I', docenteEmail: 'marco.colombo@unibs.it' }],
  },
  {
    code: 'GIUTL',
    name: 'Giurisprudenza Triennale',
    // Volutamente senza docente: mostra lo stato "Non assegnato" in Segreteria.
    years: [{ yearNumber: 1, label: 'GIUTL-I' }],
  },
  {
    code: 'FISTL',
    name: 'Fisica Triennale',
    years: [{ yearNumber: 1, label: 'FISTL-I', docenteEmail: 'chiara.ricci@unibs.it' }],
  },
];

// Materie per anno di frequenza (chiave = label del CourseYear). Ogni anno è già legato
// a corso + docente, quindi queste sono le materie di quel prof per quel corso/anno.
const MATERIE_BY_YEAR: Record<string, string[]> = {
  'INFTL-I': ['Analisi Matematica 1', 'Programmazione 1', 'Fondamenti di Informatica'],
  'INFTL-II': ['Basi di Dati', 'Reti di Calcolatori', 'Sistemi Operativi'],
  'INFLM-I': ['Machine Learning', 'Ingegneria del Software Avanzata'],
  'MATTL-I': ['Algebra Lineare', 'Analisi Matematica 1'],
  'ECOTL-I': ['Economia Politica', 'Ragioneria Generale'],
  'FISTL-I': ['Fisica Generale 1', 'Meccanica Razionale'],
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function seedDemoData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env['PGHOST'] || 'localhost',
    port: Number(process.env['PGPORT']) || 5432,
    username: process.env['PGUSER'] || 'appelli',
    password: process.env['PGPASSWORD'] || 'appelli',
    database: process.env['PGDATABASE'] || 'appelli',
    entities: [Course, CourseYear, ExamSession, User, Materia],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to database, seeding demo data...');

  const courseRepo = dataSource.getRepository(Course);
  const yearRepo = dataSource.getRepository(CourseYear);
  const sessionRepo = dataSource.getRepository(ExamSession);
  const userRepo = dataSource.getRepository(User);
  const materiaRepo = dataSource.getRepository(Materia);

  // --- Utenti: docenti + segreteria ---
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userByEmail = new Map<string, User>();

  for (const u of [...DOCENTI, SEGRETERIA]) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          name: u.name,
          surname: u.surname,
          email: u.email,
          password: hashedPassword,
          role: u === SEGRETERIA ? UserRole.SEGRETERIA : UserRole.DOCENTE,
        }),
      );
      console.log(`Utente creato: ${u.name} ${u.surname} (${u.email})`);
    } else {
      console.log(`Utente già presente: ${u.name} ${u.surname} (${u.email})`);
    }
    userByEmail.set(u.email, user);
  }

  const allCreatedYears: CourseYear[] = [];

  for (const c of COURSES) {
    let course = await courseRepo.findOne({ where: { code: c.code } });
    if (!course) {
      course = await courseRepo.save(courseRepo.create({ code: c.code, name: c.name }));
      console.log(`Corso creato: ${c.name}`);
    } else {
      console.log(`Corso già presente: ${c.name}`);
    }

    for (const y of c.years) {
      const docenteId = y.docenteEmail ? userByEmail.get(y.docenteEmail)?.id : undefined;

      let year = await yearRepo.findOne({ where: { label: y.label } });
      if (!year) {
        year = await yearRepo.save(
          yearRepo.create({
            courseId: course.id,
            yearNumber: y.yearNumber,
            label: y.label,
            docenteId,
          }),
        );
        console.log(`  Anno creato: ${y.label}${docenteId ? ' (docente assegnato)' : ''}`);
      } else if (docenteId && year.docenteId !== docenteId) {
        year.docenteId = docenteId;
        year = await yearRepo.save(year);
        console.log(`  Anno già presente, docente assegnato ora: ${y.label}`);
      } else {
        console.log(`  Anno già presente: ${y.label}`);
      }
      allCreatedYears.push(year);
    }
  }

  // --- Materie per ogni anno di frequenza ---
  for (const year of allCreatedYears) {
    const materie = MATERIE_BY_YEAR[year.label] ?? [];
    for (const name of materie) {
      const existing = await materiaRepo.findOne({
        where: { name, courseYearId: year.id },
      });
      if (!existing) {
        await materiaRepo.save(materiaRepo.create({ name, courseYearId: year.id }));
        console.log(`  Materia creata: ${name} (${year.label})`);
      }
    }
  }

  const now = new Date();

  const sessionsToSeed: {
    name: string;
    sessionStartDate: string;
    sessionEndDate: string;
    submissionStartDate: Date;
    submissionEndDate: Date;
    courseYearLabels: string[];
  }[] = [
    {
      name: 'Sessione invernale 2025/26 (conclusa)',
      sessionStartDate: toDateString(addDays(now, -120)),
      sessionEndDate: toDateString(addDays(now, -90)),
      submissionStartDate: addDays(now, -130),
      submissionEndDate: addDays(now, -100),
      courseYearLabels: ['INFTL-I', 'MATTL-I'],
    },
    {
      name: 'Sessione estiva 2026 (attiva)',
      sessionStartDate: toDateString(addDays(now, -5)),
      sessionEndDate: toDateString(addDays(now, 20)),
      submissionStartDate: addDays(now, -10),
      submissionEndDate: addDays(now, 15),
      courseYearLabels: ['INFTL-I', 'INFTL-II', 'INFLM-I', 'ECOTL-I', 'FISTL-I'],
    },
    {
      name: 'Sessione straordinaria primavera 2026 (attiva)',
      sessionStartDate: toDateString(addDays(now, -2)),
      sessionEndDate: toDateString(addDays(now, 10)),
      submissionStartDate: addDays(now, -5),
      submissionEndDate: addDays(now, 8),
      courseYearLabels: ['GIUTL-I', 'MATTL-I'],
    },
    {
      name: 'Sessione autunnale 2026 (futura)',
      sessionStartDate: toDateString(addDays(now, 40)),
      sessionEndDate: toDateString(addDays(now, 60)),
      submissionStartDate: addDays(now, 30),
      submissionEndDate: addDays(now, 55),
      courseYearLabels: ['INFLM-I', 'ECOTL-I'],
    },
    {
      name: 'Sessione invernale 2026/27 (futura)',
      sessionStartDate: toDateString(addDays(now, 150)),
      sessionEndDate: toDateString(addDays(now, 180)),
      submissionStartDate: addDays(now, 140),
      submissionEndDate: addDays(now, 175),
      courseYearLabels: [
        'INFTL-I',
        'INFTL-II',
        'GIUTL-I',
        'MATTL-I',
        'INFLM-I',
        'ECOTL-I',
        'FISTL-I',
      ],
    },
  ];

  for (const s of sessionsToSeed) {
    const existing = await sessionRepo.findOne({ where: { name: s.name } });
    if (existing) {
      console.log(`Sessione già presente: ${s.name}`);
      continue;
    }

    const years = allCreatedYears.filter((y) => s.courseYearLabels.includes(y.label));

    const session = sessionRepo.create({
      name: s.name,
      sessionStartDate: s.sessionStartDate,
      sessionEndDate: s.sessionEndDate,
      submissionStartDate: s.submissionStartDate,
      submissionEndDate: s.submissionEndDate,
      courseYears: years,
    });
    await sessionRepo.save(session);
    console.log(`Sessione creata: ${s.name}`);
  }

  console.log('Seed completato.');
  console.log('');
  console.log(`Password per tutti gli utenti creati dal seed: ${DEMO_PASSWORD}`);
  console.log(`Segreteria: ${SEGRETERIA.email}`);
  console.log(`Docenti: ${DOCENTI.map((d) => d.email).join(', ')}`);
  await dataSource.destroy();
}

seedDemoData().catch((err) => {
  console.error('Errore durante il seed:', err);
  process.exit(1);
});
