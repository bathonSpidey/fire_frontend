export type Broker = "N26" | "Commerzbank" | "Sparkasse";

export const UNKNOWN = "Unknown";

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
  moved_out: MovedOut[]; // taken out of the investments by hand: can be brought back
  costs: { total: number; items: Flow[] };
  received: { total: number; items: Flow[] };
  bookings: Booking[]; // only on a broker's page
}
