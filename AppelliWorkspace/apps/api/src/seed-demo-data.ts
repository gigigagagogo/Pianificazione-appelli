import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Course, CourseYear, ExamSession } from '@server/exams-planning';

interface CourseSeed {
  code: string;
  name: string;
  years: { yearNumber: number; label: string }[];
}

const COURSES: CourseSeed[] = [
  {
    code: 'INFTL',
    name: 'Ingegneria Informatica Triennale',
    years: [{ yearNumber: 1, label: 'INFTL-I' }],
  },
  {
    code: 'INFLM',
    name: 'Ingegneria Informatica Magistrale',
    years: [{ yearNumber: 1, label: 'INFLM-I' }],
  },
  {
    code: 'MATTL',
    name: 'Matematica Triennale',
    years: [{ yearNumber: 1, label: 'MATTL-I' }],
  },
  {
    code: 'ECOTL',
    name: 'Economia Aziendale Triennale',
    years: [{ yearNumber: 1, label: 'ECOTL-I' }],
  },
  {
    code: 'GIUTL',
    name: 'Giurisprudenza Triennale',
    years: [{ yearNumber: 1, label: 'GIUTL-I' }],
  },
];

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
    entities: [Course, CourseYear, ExamSession],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to database, seeding demo data...');

  const courseRepo = dataSource.getRepository(Course);
  const yearRepo = dataSource.getRepository(CourseYear);
  const sessionRepo = dataSource.getRepository(ExamSession);

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
      let year = await yearRepo.findOne({ where: { label: y.label } });
      if (!year) {
        year = await yearRepo.save(
          yearRepo.create({ courseId: course.id, yearNumber: y.yearNumber, label: y.label }),
        );
        console.log(`  Anno creato: ${y.label}`);
      } else {
        console.log(`  Anno già presente: ${y.label}`);
      }
      allCreatedYears.push(year);
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
      courseYearLabels: ['INFTL-I', 'INFLM-I', 'ECOTL-I'],
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
      courseYearLabels: ['INFTL-I', 'GIUTL-I', 'MATTL-I', 'INFLM-I', 'ECOTL-I'],
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
  await dataSource.destroy();
}

seedDemoData().catch((err) => {
  console.error('Errore durante il seed:', err);
  process.exit(1);
});