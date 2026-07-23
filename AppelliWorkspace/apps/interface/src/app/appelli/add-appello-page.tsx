import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ApiError,
  Appello,
  CalendarDay,
  CourseYear,
  createAppello,
  ExamSession,
  getCalendar,
  getMaterieByCourseYear,
  getMyCourseYears,
  getSessions,
  Materia,
  updateAppello,
} from '../shared/api';
import SidebarLayout from '../shared/sidebar-layout';

const selectClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

const monthKeyOf = (date: string) => date.slice(0, 7); // 'YYYY-MM'

const shiftMonthKey = (key: string, delta: number) => {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

function buildWeeks(days: CalendarDay[]): (CalendarDay | null)[][] {
  const weeks: (CalendarDay | null)[][] = [];
  let currentWeek: (CalendarDay | null)[] = [];

  days.forEach((day) => {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay(); // 1..5 (lun-ven)
    const col = weekday - 1; // 0..4 (Lun..Ven)

    // Lunedì (col 0) chiude la settimana in corso e ne apre una nuova.
    if (col === 0 && currentWeek.length > 0) {
      while (currentWeek.length < 5) currentWeek.push(null);
      weeks.push(currentWeek);
      currentWeek = [];
    }
    // Riempie con celle vuote fino alla colonna giusta: gestisce sia l'inizio
    // settimana sia i "buchi" infrasettimanali (giorni festivi esclusi dal server),
    // così ogni giorno resta allineato sotto la sua colonna.
    while (currentWeek.length < col) currentWeek.push(null);
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 5) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

const AddAppelloPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editAppello = (location.state as { editAppello?: Appello } | null)?.editAppello ?? null;

  const [courseYears, setCourseYears] = useState<CourseYear[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [materie, setMaterie] = useState<Materia[]>([]);
  const [courseYearId, setCourseYearId] = useState<number | ''>(editAppello?.courseYearId ?? '');
  const [sessionId, setSessionId] = useState<number | ''>(editAppello?.examSession.id ?? '');
  const [materiaId, setMateriaId] = useState<number | ''>(editAppello?.materiaId ?? '');

  const [days, setDays] = useState<CalendarDay[] | null>(null);
  const [viewMonthKey, setViewMonthKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingCourseYears, setLoadingCourseYears] = useState(true);

  useEffect(() => {
    Promise.all([getMyCourseYears(), getSessions()])
      .then(([courseYearsData, sessionsData]) => {
        setCourseYears(courseYearsData);
        setSessions(sessionsData);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.'),
      )
      .finally(() => setLoadingCourseYears(false));
  }, []);

  // Precarica le materie dell'anno di frequenza selezionato: sono già solo quelle
  // di quel corso di laurea, per quell'anno, del docente titolare.
  useEffect(() => {
    if (courseYearId === '') {
      setMaterie([]);
      return;
    }
    getMaterieByCourseYear(courseYearId)
      .then(setMaterie)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.'),
      );
  }, [courseYearId]);

  const availableSessions = useMemo(
    () =>
      sessions.filter((session) =>
        session.courseYears?.some((year) => year.id === courseYearId),
      ),
    [sessions, courseYearId],
  );

  const loadCalendar = (sid: number, cyid: number, resetMonth: boolean) => {
    setLoadingCalendar(true);
    setError(null);
    getCalendar(sid, cyid)
      .then((res) => {
        setDays(res.days);
        if (resetMonth && res.days.length > 0) {
          setViewMonthKey(monthKeyOf(res.days[0].date));
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.'),
      )
      .finally(() => setLoadingCalendar(false));
  };


  // Carica il calendario quando si selezionano sessione e corso/anno. Se uno dei due viene deselezionato, cancella il calendario e la vista mese.
  useEffect(() => {
    if (sessionId !== '' && courseYearId !== '') {
      loadCalendar(sessionId, courseYearId, true);
    } else {
      setDays(null);
      setViewMonthKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, courseYearId]);

  // In modifica, la data che stai già occupando torna selezionabile come le altre libere
  const effectiveDays = useMemo(() => {
    if (!days) return null;
    if (!editAppello) return days;
    return days.map((day) =>
      day.appelloId === editAppello.id
        ? { date: day.date, available: true }
        : day,
    );
  }, [days, editAppello]);

  const monthBounds = useMemo(() => {
    if (!effectiveDays || effectiveDays.length === 0) return null;
    return {
      min: monthKeyOf(effectiveDays[0].date),
      max: monthKeyOf(effectiveDays[effectiveDays.length - 1].date),
    };
  }, [effectiveDays]);

  const visibleDays = useMemo(
    () => (effectiveDays ?? []).filter((day) => monthKeyOf(day.date) === viewMonthKey),
    [effectiveDays, viewMonthKey],
  );

  const canGoPrev = !!monthBounds && !!viewMonthKey && viewMonthKey > monthBounds.min;
  const canGoNext = !!monthBounds && !!viewMonthKey && viewMonthKey < monthBounds.max;

  const handleDayClick = async (day: CalendarDay) => {
    if (sessionId === '' || courseYearId === '' || !day.available) return;
    if (materiaId === '') {
      setError('Seleziona una materia prima di scegliere la data.');
      return;
    }
    setError(null);

    try {
      if (editAppello) {
        await updateAppello(editAppello.id, {
          date: day.date,
          courseYearId,
          materiaId,
          examSessionId: sessionId,
        });
        navigate('/appelli');
      } else {
        await createAppello({ date: day.date, courseYearId, materiaId, examSessionId: sessionId });
        loadCalendar(sessionId, courseYearId, false);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Errore di rete, riprova.');
    }
  };

  const weeks = buildWeeks(visibleDays);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    {
      key: 'mine',
      label: 'I miei appelli',
      active: false,
      onClick: () => navigate('/appelli', { state: { view: 'mine' } }),
    },
    {
      key: 'all',
      label: 'Tutti gli appelli',
      active: false,
      onClick: () => navigate('/appelli', { state: { view: 'all' } }),
    },
    { key: 'nuovo', label: '+ Aggiungi appello', active: true, onClick: () => undefined },
  ];

  return (
    <SidebarLayout title="Docente" navItems={navItems} onLogout={handleLogout}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {editAppello ? 'Modifica appello' : 'Aggiungi appello'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {editAppello
                ? `Stai modificando l'appello del ${editAppello.date} (${editAppello.courseYear.course?.name} — ${editAppello.courseYear.label} — ${editAppello.examSession.name}). Puoi cambiare corso, anno, sessione e/o data.`
                : 'Scegli corso/anno e sessione per vedere le date disponibili.'}
            </p>
          </div>
          {editAppello && (
            <button
              type="button"
              onClick={() => navigate('/appelli')}
              className="shrink-0 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {loadingCourseYears && (
          <p className="mt-6 text-sm text-gray-500">Caricamento corsi...</p>
        )}

        {!loadingCourseYears && courseYears.length === 0 && (
          <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Non ti è stato ancora assegnato nessun corso di laurea/anno di frequenza. Contatta la
            segreteria per farti assegnare un insegnamento.
          </p>
        )}

        {!loadingCourseYears && courseYears.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <select
              className={selectClass}
              value={courseYearId}
              onChange={(e) => {
                setCourseYearId(e.target.value ? Number(e.target.value) : '');
                setSessionId('');
                setMateriaId('');
              }}
            >
              <option value="">Corso di laurea - anno di frequenza</option>
              {courseYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.course?.name} — {year.label}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={materiaId}
              disabled={!courseYearId}
              onChange={(e) => setMateriaId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">
                {courseYearId && materie.length === 0 ? 'Nessuna materia disponibile' : 'Materia'}
              </option>
              {materie.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.name}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={sessionId}
              disabled={!courseYearId}
              onChange={(e) => setSessionId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sessione</option>
              {availableSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingCalendar && (
          <p className="mt-6 text-sm text-gray-500">Caricamento calendario...</p>
        )}

        {!loadingCalendar && days && viewMonthKey && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => canGoPrev && setViewMonthKey(shiftMonthKey(viewMonthKey, -1))}
                disabled={!canGoPrev}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Mese prec.
              </button>
              <span className="min-w-[10rem] text-center text-sm font-semibold text-gray-900">
                {monthLabel(viewMonthKey)}
              </span>
              <button
                type="button"
                onClick={() => canGoNext && setViewMonthKey(shiftMonthKey(viewMonthKey, 1))}
                disabled={!canGoNext}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mese succ. →
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-white ring-1 ring-inset ring-gray-300" /> Libera
                (clicca per prenotare)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-green-500" /> Tua
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-red-400" /> Occupata da un collega
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-100 ring-1 ring-inset ring-amber-300" />{' '}
                Festività (passa il mouse per il motivo)
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-5 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven'].map((label) => (
                  <div key={label} className="px-3 py-2 text-center">
                    {label}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-gray-100">
                {weeks.map((week, i) => (
                  <div key={i} className="grid grid-cols-5 divide-x divide-gray-100">
                    {week.map((day, j) =>
                      day ? (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => handleDayClick(day)}
                          disabled={!day.available}
                          title={
                            day.holiday
                              ? `Festività: ${day.holiday}`
                              : day.mine
                                ? 'Tuo appello'
                                : day.docente
                                  ? `Occupata da ${day.docente}`
                                  : ''
                          }
                          className={`flex h-20 flex-col items-center justify-center gap-1 text-sm transition-colors ${
                            day.mine
                              ? 'cursor-not-allowed bg-green-500 font-semibold text-white'
                              : day.holiday
                                ? 'cursor-not-allowed bg-amber-100 text-amber-800'
                                : !day.available
                                  ? 'cursor-not-allowed bg-red-100 text-red-700'
                                  : 'text-gray-700 hover:bg-indigo-50'
                          }`}
                        >
                          <span>{day.date.slice(-2)}</span>
                          {!day.available && (
                            <span className="max-w-full truncate px-1 text-[11px]">
                              {day.mine ? 'Tuo' : day.holiday ? 'Festività' : day.docente}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div key={j} className="h-20 bg-gray-50/50" />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </SidebarLayout>
  );
};

export default AddAppelloPage;
