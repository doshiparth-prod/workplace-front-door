import type { Counselor, Message, Opportunity, Referral } from "@/lib/types";

// Sample service area (Southwestern CT). Sample data only.
export const TOWNS = [
  "Bridgeport", "Stamford", "Norwalk", "Greenwich", "Fairfield", "Stratford",
  "Milford", "Shelton", "Trumbull", "Westport", "Darien", "New Canaan",
  "Wilton", "Weston", "Easton", "Monroe", "Ansonia", "Derby", "Seymour", "Oxford",
];

const BPT = ["Bridgeport", "Stratford", "Fairfield", "Trumbull", "Monroe", "Easton", "Milford"];
export const COUNSELORS: Counselor[] = [
  { id: "c1", name: "Ms. Denise Johnson", office: "American Job Center – Bridgeport", towns: BPT, languages: ["en"] },
  { id: "c5", name: "Ms. Lucía Morales", office: "American Job Center – Bridgeport", towns: BPT, languages: ["en", "es"] },
  { id: "c2", name: "Mr. Carlos Rivera", office: "American Job Center – Stamford", towns: ["Stamford", "Greenwich", "Darien", "New Canaan"], languages: ["en", "es"] },
  { id: "c3", name: "Ms. Aisha Patel", office: "American Job Center – Norwalk", towns: ["Norwalk", "Westport", "Wilton", "Weston"], languages: ["en"] },
  { id: "c6", name: "Mr. Andrés Gómez", office: "American Job Center – Norwalk", towns: ["Norwalk", "Westport", "Wilton", "Weston"], languages: ["en", "es"] },
  { id: "c4", name: "Mr. Tom Kowalski", office: "Valley Career Center – Ansonia", towns: ["Ansonia", "Derby", "Seymour", "Shelton", "Oxford"], languages: ["en"] },
];

/** Route by town first, then language: Spanish speakers go to a bilingual counselor (nearest office if none local). */
export function counselorFor(town: string, lang: "en" | "es" = "en"): Counselor {
  const local = COUNSELORS.filter((c) => c.towns.includes(town));
  if (lang === "es") return local.find((c) => c.languages.includes("es")) ?? COUNSELORS.find((c) => c.languages.includes("es"))!;
  return local[0] ?? COUNSELORS[0];
}

const o = (x: Omit<Opportunity, "published">): Opportunity => ({ ...x, published: true });

export const OPPORTUNITIES: Opportunity[] = [
  // Jobs
  o({ id: "j1", skills: ["forklift","warehouse"], type: "job", title: { en: "Warehouse Associate – Day Shift", es: "Asociado de Almacén – Turno de Día" }, provider: "Harbor Logistics (sample)", town: "Bridgeport", needs: ["job"], tags: ["transit", "full-time", "no-diploma"], summary: { en: "$19.50/hr, full benefits. Forklift certification provided on the job. Near the Coastal Link bus.", es: "$19.50/hr, beneficios. Certificación de montacargas en el trabajo. Cerca del autobús Coastal Link." } }),
  o({ id: "j2", skills: ["patient","customer"], type: "job", title: { en: "Patient Transport Aide", es: "Asistente de Transporte de Pacientes" }, provider: "Coastal Health Partners (sample)", town: "Bridgeport", needs: ["job"], tags: ["transit", "full-time"], summary: { en: "$20/hr, rotating shifts, tuition help for nursing programs.", es: "$20/hr, turnos rotativos, ayuda con matrícula para enfermería." } }),
  o({ id: "j3", skills: ["manufacturing"], type: "job", title: { en: "CNC Machine Operator (will train)", es: "Operador de Máquina CNC (con capacitación)" }, provider: "Housatonic Precision (sample)", town: "Shelton", needs: ["job"], tags: ["full-time", "no-diploma"], summary: { en: "$22/hr to start. Paid training. Car or carpool needed.", es: "$22/hr inicial. Capacitación pagada. Se necesita carro o carpool." } }),
  o({ id: "j4", skills: ["customer","bilingual"], type: "job", title: { en: "Customer Service Rep – Remote", es: "Representante de Servicio al Cliente – Remoto" }, provider: "Sound Insurance Group (sample)", town: "Stamford", needs: ["job"], tags: ["remote", "full-time", "evening"], summary: { en: "Work from home, evening shifts available. Bilingual (Spanish) a plus.", es: "Desde casa, turnos de noche. Bilingüe (español) es una ventaja." } }),
  o({ id: "j5", skills: ["retail","customer"], type: "job", title: { en: "Retail Team Member", es: "Miembro del Equipo de Tienda" }, provider: "Post Road Market (sample)", town: "Norwalk", needs: ["job", "youth"], tags: ["transit", "evening", "youth", "no-diploma"], summary: { en: "Part-time, flexible evenings and weekends. Great first job.", es: "Medio tiempo, tardes y fines de semana. Excelente primer empleo." } }),
  o({ id: "j6", skills: ["driving"], type: "job", title: { en: "Bus Operator Trainee", es: "Aprendiz de Operador de Autobús" }, provider: "Regional Transit District (sample)", town: "Stratford", needs: ["job"], tags: ["transit", "full-time", "free"], summary: { en: "Paid CDL training, union benefits, $24/hr after training.", es: "Capacitación CDL pagada, beneficios sindicales, $24/hr después." } }),
  // Training
  o({ id: "t1", skills: ["patient"], type: "training", title: { en: "Certified Nursing Assistant (CNA) – Evening Cohort", es: "Asistente de Enfermería Certificado (CNA) – Grupo Nocturno" }, provider: "CT State Community College (sample)", town: "Stamford", needs: ["training"], tags: ["evening", "free", "transit"], summary: { en: "8 weeks, Mon–Thu 6–9pm. Tuition covered for eligible residents through WIOA funding.", es: "8 semanas, lun–jue 6–9pm. Matrícula cubierta para residentes elegibles con fondos WIOA." } }),
  o({ id: "t2", skills: ["admin","patient"], type: "training", title: { en: "Medical Billing & Coding Certificate", es: "Certificado de Facturación y Codificación Médica" }, provider: "Fairfield Career Institute (sample)", town: "Fairfield", needs: ["training"], tags: ["evening", "free", "remote"], summary: { en: "Online + 1 evening/week. Funded seats available.", es: "En línea + 1 noche por semana. Hay cupos financiados." } }),
  o({ id: "t3", skills: ["forklift","warehouse"], type: "training", title: { en: "Forklift & Warehouse Safety (OSHA-10)", es: "Montacargas y Seguridad en Almacén (OSHA-10)" }, provider: "The WorkPlace Training Center (sample)", town: "Bridgeport", needs: ["training", "job"], tags: ["free", "transit", "no-diploma"], summary: { en: "2-week course, free, leads directly to hiring events.", es: "Curso de 2 semanas, gratis, conecta con ferias de empleo." } }),
  o({ id: "t4", skills: ["manufacturing"], type: "training", title: { en: "Advanced Manufacturing Bootcamp", es: "Curso Intensivo de Manufactura Avanzada" }, provider: "Valley Manufacturing Academy (sample)", town: "Ansonia", needs: ["training"], tags: ["free", "full-time", "no-diploma"], summary: { en: "10 weeks, daytime, stipend included. Job placement with local manufacturers.", es: "10 semanas, de día, con estipendio. Colocación con fabricantes locales." } }),
  o({ id: "t5", skills: ["it"], type: "training", title: { en: "IT Support (CompTIA A+)", es: "Soporte Técnico (CompTIA A+)" }, provider: "Norwalk Tech Hub (sample)", town: "Norwalk", needs: ["training"], tags: ["evening", "free", "transit", "childcare"], summary: { en: "12 weeks, evenings. On-site childcare during class.", es: "12 semanas, noches. Cuidado infantil durante la clase." } }),
  // Programs
  o({ id: "p1", type: "program", title: { en: "Youth Employment Program (paid summer + year-round)", es: "Programa de Empleo Juvenil (pagado, verano y todo el año)" }, provider: "The WorkPlace (sample)", town: "Bridgeport", needs: ["youth"], tags: ["youth", "free", "transit", "no-diploma"], summary: { en: "Ages 16–24. Paid work experience, mentoring, and a career coach.", es: "Edades 16–24. Experiencia laboral pagada, mentoría y un coach." } }),
  o({ id: "p2", type: "program", title: { en: "GED Prep + Career Pathway", es: "Preparación para el GED + Ruta Profesional" }, provider: "Norwalk Adult Education (sample)", town: "Norwalk", needs: ["youth", "training"], tags: ["youth", "free", "evening", "no-diploma", "transit"], summary: { en: "Free GED classes in English or Spanish, plus a paid internship after you pass.", es: "Clases gratis de GED en inglés o español, más una pasantía pagada al aprobar." } }),
  o({ id: "p3", skills: ["construction"], type: "program", title: { en: "Pre-Apprenticeship in the Trades", es: "Pre-Aprendizaje en Oficios" }, provider: "Building Trades Council (sample)", town: "Stamford", needs: ["youth", "training"], tags: ["youth", "free", "full-time"], summary: { en: "Ages 18–24. Carpentry, electrical, plumbing basics. Stipend + tools.", es: "Edades 18–24. Carpintería, electricidad, plomería. Estipendio + herramientas." } }),
  o({ id: "p4", type: "program", title: { en: "One-on-One Career Coaching", es: "Asesoría Profesional Individual" }, provider: "The WorkPlace (sample)", town: "Bridgeport", needs: ["career", "job"], tags: ["free", "transit", "evening"], summary: { en: "Résumé help, interview practice, job search plan. In person or by phone.", es: "Ayuda con currículum, práctica de entrevistas, plan de búsqueda." } }),
  o({ id: "p5", type: "program", title: { en: "Résumé Clinic (walk-in)", es: "Clínica de Currículum (sin cita)" }, provider: "American Job Center – Stamford (sample)", town: "Stamford", needs: ["career"], tags: ["free", "transit"], summary: { en: "Tuesdays 1–4pm. Bring what you have — leave with a résumé.", es: "Martes 1–4pm. Traiga lo que tenga — salga con un currículum." } }),
  o({ id: "p6", type: "program", title: { en: "Back-to-Work for Parents", es: "Regreso al Trabajo para Padres" }, provider: "The WorkPlace (sample)", town: "Norwalk", needs: ["career", "job"], tags: ["free", "childcare", "transit"], summary: { en: "Flexible coaching sessions with childcare provided.", es: "Sesiones flexibles con cuidado infantil incluido." } }),
  // Events
  o({ id: "e1", type: "event", title: { en: "Bridgeport Hiring Fair – 40+ Employers", es: "Feria de Empleo de Bridgeport – 40+ Empleadores" }, provider: "The WorkPlace (sample)", town: "Bridgeport", needs: ["job", "youth"], tags: ["transit", "free", "youth"], date: "2026-11-18T10:00:00", summary: { en: "Bring résumés. On-the-spot interviews. Spanish interpreters on site.", es: "Traiga currículums. Entrevistas en el lugar. Intérpretes de español." } }),
  o({ id: "e2", type: "event", title: { en: "Healthcare Careers Info Night", es: "Noche Informativa de Carreras en Salud" }, provider: "CT State Community College (sample)", town: "Stamford", needs: ["training", "career"], tags: ["evening", "free", "transit"], date: "2026-11-20T18:00:00", summary: { en: "Learn about CNA, phlebotomy and medical billing — and how to get it funded.", es: "Conozca CNA, flebotomía y facturación médica — y cómo financiarlo." } }),
  o({ id: "e3", type: "event", title: { en: "Youth Job Readiness Workshop", es: "Taller de Preparación Laboral Juvenil" }, provider: "The WorkPlace (sample)", town: "Norwalk", needs: ["youth"], tags: ["youth", "free", "transit", "evening"], date: "2026-11-17T16:30:00", summary: { en: "Ages 16–24. Free pizza. Leave with a résumé and a mock interview.", es: "Edades 16–24. Pizza gratis. Salga con currículum y entrevista de práctica." } }),
  o({ id: "e4", type: "event", title: { en: "Manufacturing Open House", es: "Puertas Abiertas de Manufactura" }, provider: "Valley Manufacturing Academy (sample)", town: "Ansonia", needs: ["job", "training"], tags: ["free"], date: "2026-11-21T11:00:00", summary: { en: "Tour the shop floor and meet hiring managers.", es: "Recorra la planta y conozca gerentes de contratación." } }),
  o({ id: "e5", type: "event", title: { en: "Employer Roundtable: On-the-Job Training Funds", es: "Mesa Redonda: Fondos de Capacitación en el Trabajo" }, provider: "The WorkPlace Business Services (sample)", town: "Bridgeport", needs: ["employer"], tags: ["free"], date: "2026-11-19T08:30:00", summary: { en: "How to get up to 50% of new-hire wages reimbursed during training.", es: "Cómo recuperar hasta el 50% del salario durante la capacitación." } }),
];

const daysAgo = (d: number, h = 10) => {
  const t = new Date("2026-11-05T00:00:00");
  t.setDate(t.getDate() - d);
  t.setHours(h);
  return t.toISOString();
};

export const SEED_REFERRALS: Referral[] = [
  { id: "r-1001", kind: "resident", createdAt: daysAgo(2), name: "Tanya", phone: "(203) 555-0191", language: "en", need: "training", town: "Stratford", barriers: ["b_childcare", "b_free"], opportunityIds: ["t5"], slot: "2026-11-10T13:00:00", contactPref: "text", smsConsent: { optedIn: true, at: daysAgo(2) }, skills: ["it", "customer"], status: "scheduled", counselorId: "c1", notes: "Interested in IT. Needs childcare — matched to Norwalk Tech Hub." },
  { id: "r-1002", kind: "resident", createdAt: daysAgo(1), name: "José", phone: "(203) 555-0177", language: "es", need: "youth", town: "Norwalk", barriers: ["b_noDiploma", "b_evenings"], opportunityIds: ["p2", "e3"], slot: "2026-11-09T16:00:00", contactPref: "text", smsConsent: { optedIn: true, at: daysAgo(1) }, skills: ["retail"], status: "contacted", counselorId: "c6", notes: "Prefiere español. GED primero." },
  { id: "r-1003", kind: "resident", createdAt: daysAgo(4), name: "Kevin", phone: "(475) 555-0123", language: "en", need: "job", town: "Bridgeport", barriers: ["b_noCar", "b_fullTime"], opportunityIds: ["j1", "e1"], slot: "2026-11-04T10:00:00", contactPref: "call", smsConsent: { optedIn: false }, skills: ["warehouse", "forklift"], status: "enrolled", counselorId: "c1", notes: "Enrolled in OSHA-10. Hiring fair 11/18." },
  { id: "r-1004", kind: "resident", createdAt: daysAgo(0, 8), name: "Maria", phone: "(203) 555-0164", language: "es", need: "job", town: "Stamford", barriers: ["b_evenings"], opportunityIds: ["j4"], slot: "2026-11-07T11:00:00", contactPref: "text", smsConsent: { optedIn: true, at: daysAgo(0, 8) }, skills: ["customer", "bilingual", "admin"], status: "new", counselorId: "c2", notes: "" },
  { id: "r-1006", kind: "resident", createdAt: daysAgo(1, 15), name: "Ray", phone: "(203) 555-0133", language: "en", need: "job", town: "Shelton", barriers: ["b_fullTime"], opportunityIds: ["j3"], slot: "2026-11-09T14:00:00", contactPref: "text", smsConsent: { optedIn: true, at: daysAgo(1, 15) }, resumeFileName: "Ray_resume.pdf", skills: ["manufacturing", "warehouse"], status: "new", counselorId: "c4", notes: "", meet: "inperson" },
  { id: "r-1005", kind: "employer", createdAt: daysAgo(3), name: "Linda Chen", email: "lchen@example.com", language: "en", need: "employer", town: "Shelton", barriers: [], opportunityIds: [], contactPref: "email", smsConsent: { optedIn: false }, status: "contacted", notes: "Wants OJT for 3 machinists.", employer: { company: "Housatonic Precision (sample)", roles: "CNC operators", count: 3, startDate: "2026-12-01", ojt: true } },
];

export const SEED_MESSAGES: Message[] = [
  { id: "m1", referralId: "r-1001", direction: "out", body: "Hi Tanya, this is The WorkPlace. You're booked with Ms. Johnson on Mon Nov 10 at 1:00pm. Reply STOP to opt out.", sentAt: daysAgo(2) },
  { id: "m2", referralId: "r-1001", direction: "in", body: "Thank you! Can I bring my daughter?", sentAt: daysAgo(2, 11) },
  { id: "m3", referralId: "r-1001", direction: "out", body: "Of course — see you then!", sentAt: daysAgo(2, 12) },
  { id: "m4", referralId: "r-1002", direction: "out", body: "Hola José, soy el Sr. Gómez de The WorkPlace. ¿Le queda bien el domingo 9 a las 4pm?", sentAt: daysAgo(1) },
  { id: "m5", referralId: "r-1002", direction: "in", body: "Sí, gracias", sentAt: daysAgo(1, 13) },
];

// Baseline analytics so the Insights view isn't empty (sample, last 30 days).
export const BASELINE = {
  visits: 4820,
  needSelected: 3105,
  intakeCompleted: 1960,
  referrals: 612,
  enrolled: 188,
  smsOptIn: 0.78,
  spanishShare: 0.31,
  needByTown: {
    Bridgeport: { job: 140, training: 66, career: 41, youth: 58, employer: 12 },
    Stamford: { job: 92, training: 71, career: 30, youth: 25, employer: 9 },
    Norwalk: { job: 61, training: 38, career: 22, youth: 34, employer: 6 },
    Stratford: { job: 33, training: 18, career: 9, youth: 11, employer: 3 },
    Ansonia: { job: 21, training: 25, career: 6, youth: 9, employer: 5 },
  } as Record<string, Record<string, number>>,
};
