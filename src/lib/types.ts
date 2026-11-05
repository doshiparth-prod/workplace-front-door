export type Lang = "en" | "es";
export type L10n = { en: string; es: string };

export type NeedId = "job" | "training" | "career" | "youth" | "employer";

export type Tag =
  | "transit"
  | "evening"
  | "childcare"
  | "free"
  | "youth"
  | "no-diploma"
  | "full-time"
  | "remote";

export type OppType = "job" | "training" | "program" | "event";

export interface Opportunity {
  id: string;
  type: OppType;
  title: L10n;
  provider: string;
  town: string;
  needs: NeedId[];
  tags: Tag[];
  date?: string; // ISO date for events / start dates
  summary: L10n;
  published: boolean;
  skills?: string[]; // skill ids that make someone a strong fit
}

export interface Counselor {
  id: string;
  name: string;
  office: string; // American Job Center location
  towns: string[];
  languages: Lang[];
}

export type ReferralStatus = "new" | "contacted" | "scheduled" | "enrolled" | "closed";
export type ContactPref = "text" | "call" | "email";

export interface Referral {
  id: string;
  kind: "resident" | "employer";
  createdAt: string;
  name: string;
  phone?: string;
  email?: string;
  language: Lang;
  need: NeedId;
  town: string;
  barriers: string[];
  opportunityIds: string[];
  slot?: string;
  contactPref: ContactPref;
  smsConsent: { optedIn: boolean; at?: string; optedOutAt?: string };
  resumeFileName?: string;
  status: ReferralStatus;
  counselorId?: string;
  notes: string;
  employer?: { company: string; roles: string; count: number; startDate: string; ojt: boolean };
  source?: string;
  meet?: MeetType;
  eligibility?: Eligibility;
  freeText?: string; // resident's own words, verbatim
  focusOppId?: string; // the listing they asked about
  skills?: string[];
}

export type MeetType = "inperson" | "phone" | "video";
export type Eligibility = "likely" | "maybe";

export interface Message {
  id: string;
  referralId: string;
  direction: "out" | "in"; // out = WorkPlace -> resident
  body: string;
  sentAt: string;
}

export type AnalyticsName =
  | "visit"
  | "need_selected"
  | "intake_completed"
  | "referral_created"
  | "employer_lead"
  | "saved_item"
  | "sms_opt_in"
  | "sms_opt_out";

export interface AnalyticsEvent {
  name: AnalyticsName;
  at: string;
  need?: NeedId;
  town?: string;
  lang?: Lang;
}

export interface Intake {
  need: NeedId;
  town: string;
  barriers: string[];
  contactPref: ContactPref;
  freeText: string;
  eligibility: Eligibility;
  focusOppId: string;
  skills: string[];
  resumeFileName: string;
}
