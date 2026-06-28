// Shared types for the Ad Astra demo flow.

export interface Premise {
  productName: string;
  keyFeature: string;
  /** ICP described as a list of concrete traits — at least 10 items. */
  icp: string[];
}

export interface Lead {
  name: string;
  title: string;
  company: string;
  location: string;
  /** Real LinkedIn profile URL when sourced from Orange Slice. */
  linkedinUrl?: string;
}

export interface GeoCluster {
  city: string;
  /** A specific area / venue where the ICP concentrates. */
  cluster: string;
  /** Why the leads concentrate here. */
  why: string;
  /** Precise geocodable street address or intersection for map placement. */
  address: string;
}

export interface Timing {
  /** When to fly the drones, e.g. "Weekdays, 17:50 — 10 min before clock-out". */
  when: string;
  /** Where exactly to show the ad, e.g. "Above the plaza facing the office tower windows". */
  where: string;
  /** Why this time + place maximises impressions. */
  why: string;
}

export interface LeadsResult {
  geo: GeoCluster;
  leads: Lead[];
  timing: Timing;
}

export interface PreviewResult {
  status: "ready";
  /** URL/path to the partner-provided 3D asset (video, image, or embed). */
  assetUrl: string | null;
  caption: string;
}

export interface PaymentResult {
  success: boolean;
  txId: string;
  amount: string;
}
