export type Broker = "N26" | "Commerzbank" | "Sparkasse";

export const UNKNOWN = "Unknown"; // nothing says what it bought
export const MANUAL = "Manual buys"; // bought outside every plan while plans were running

export interface BrokerTotal {
  broker: Broker;
  net: number;
  bookings: number;
  unknown: number; // invested but not yet known what it bought
}

export interface InvestMonth {
  year: number;
  month: number;
  label: string;
  statements: Broker[];
  covered: boolean; // a statement exists for it: false means "not uploaded yet", not "nothing invested"
  net: number;
  bought: number;
  sold: number;
  count: number;
  by_instrument: Record<string, number>;
  by_broker: Record<string, number>;
}

export interface InvestYear {
  year: number;
  net: number;
  bought: number;
  sold: number;
  count: number;
  months: number; // months of that year that have a statement
  avg_per_month: number;
}

export interface Instrument {
  code: string | null; // WKN or ISIN when the booking names it
  name: string;
  net: number;
  share_pct: number;
  buys: number;
  first: string;
  last: string;
  per_month: number;
  brokers: Broker[];
}

export interface Booking {
  id: number;
  broker: Broker;
  date: string;
  amount: number; // money into the market is positive, a sell is negative
  counterparty: string;
  description: string;
  instrument: string;
  code: string | null;
  source: BookingSource; // how we know what it bought
  candidates: string[]; // plans that could all be meant, when the amount is shared
  plan_id: number | null;
}

export type BookingSource = "booking" | "manual" | "plan" | "plan_amount" | "manual_buy" | "ambiguous" | "unknown";

export interface PlanCheck {
  expected: number; // buys the plans with a known day should have made where statements exist
  matched: number;
  missed: { date: string; instrument: string; amount: number; plan_id: number }[];
  anchored_plans: number;
  unanchored_plans: number;
  manual: { count: number; net: number };
  ambiguous: { count: number; net: number };
}

export interface Flow {
  broker: Broker;
  date: string;
  amount: number;
  text: string;
}

export interface MovedOut {
  id: number;
  broker: Broker;
  date: string;
  amount: number;
  text: string;
}

export type BookingKind = "investment" | "internal_transfer";

export interface InvestmentSummary {
  broker: Broker | null;
  brokers: BrokerTotal[];
  totals: {
    net: number;
    bought: number;
    sold: number;
    this_year: number;
    avg_per_month_12: number;
    months_with_statement: number;
    bookings: number;
    first_date: string | null;
    last_date: string | null;
  };
  years: InvestYear[];
  months: InvestMonth[];
  instruments: Instrument[];
  unknown: { net: number; count: number };
  manual: { net: number; count: number };
  plan_check: Record<string, PlanCheck>; // per broker that has plans
  known_instruments: string[]; // names to offer when typing what a booking was
  moved_out: MovedOut[]; // taken out of the investments by hand: can be brought back
  costs: { total: number; items: Flow[] };
  received: { total: number; items: Flow[] };
  bookings: Booking[]; // only on a broker's page
}

export type Frequency = "weekly" | "biweekly" | "monthly";

export interface Plan {
  id: number;
  broker: Broker;
  instrument: string;
  amount: number;
  frequency: Frequency;
  frequency_label: string;
  anchor_date: string | null; // one known execution day: the others follow from it
  start_date: string | null;
  end_date: string | null;
  note: string | null;
  status: "active" | "scheduled" | "ended";
  per_month: number;
  next_dates: string[];
}

export interface PlansResponse {
  plans: Plan[];
  summary: { active: number; ended: number; per_month: number; per_month_by_broker: Record<string, number> };
  instruments: string[];
}

export interface PlanInput {
  broker: Broker;
  instrument: string;
  amount: number;
  frequency: Frequency;
  anchor_date: string | null;
  start_date: string | null;
}

