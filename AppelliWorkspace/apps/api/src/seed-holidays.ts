import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Holiday } from '@server/exams-planning';

const FIXED_ITALIAN_HOLIDAYS: { month: number; day: number; description: string }[] = [
  { month: 1, day: 1, description: 'Capodanno' },
  { month: 1, day: 6, description: 'Epifania' },
  { month: 4, day: 25, description: 'Festa della Liberazione' },
  { month: 5, day: 1, description: 'Festa dei Lavoratori' },
  { month: 6, day: 2, description: 'Festa della Repubblica' },
  { month: 8, day: 15, description: 'Ferragosto' },
  { month: 11, day: 1, description: 'Ognissanti' },
  { month: 12, day: 8, description: 'Immacolata Concezione' },
  { month: 12, day: 25, description: 'Natale' },
  { month: 12, day: 26, description: 'Santo Stefano' },
];

async function seedHolidays() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env['PGHOST'] || 'localhost',
    port: Number(process.env['PGPORT']) || 5432,
    username: process.env['PGUSER'] || 'appelli',
    password: process.env['PGPASSWORD'] || 'appelli',
    database: process.env['PGDATABASE'] || 'appelli',
    entities: [Holiday],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to database, seeding holidays...');

  const repo = dataSource.getRepository(Holiday);
  const currentYear = new Date().getFullYear();
  const yearsToSeed = [currentYear, currentYear + 1];

  let inserted = 0;
  let skipped = 0;

  for (const year of yearsToSeed) {
    for (const h of FIXED_ITALIAN_HOLIDAYS) {
      const date = `${year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
      const existing = await repo.findOne({ where: { date } });
      if (existing) {
        skipped++;
        continue;
      }
      await repo.save(repo.create({ date, description: h.description }));
      inserted++;
    }
  }

  console.log(`Done. Inserted ${inserted} holidays, skipped ${skipped} already present.`);
  await dataSource.destroy();
}

seedHolidays().catch((err) => {
  console.error('Error seeding holidays:', err);
  process.exit(1);
});