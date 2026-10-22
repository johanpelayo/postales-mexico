export type VerificationStatus = "pending" | "team-confirmed" | "verified";
export interface Observation {
  id: string;
  ageMin: number;
  ageMax: number;
  ratePct: number;
  abstentionPct?: number;
  nonSpecifiedPct?: number | null;
  counts?: {
    registered: number;
    voted: number;
    notVoted: number | null;
    nonSpecified: number | null;
  };
  source?: {
    file: string;
    row: number;
    column: string;
    groupEvidence: string;
    originalFile: string | null;
    originalSha256?: string;
    ageFilterEmbedded?: boolean;
  };
}
export interface ElectoralDataset {
  id: string;
  entityId: string;
  entityName: string;
  year: number;
  observations: Observation[];
  provenance: {
    status: VerificationStatus;
    sourceKind: "project-guide" | "processed-csv" | "official-export";
    title: string;
    officialUrl: string;
    manualUrl?: string;
    rawFile: string | null;
    sha256: string | null;
    downloadedAt: string | null;
    receivedAt?: string;
    verificationScope?: string;
    sourceFiles?: {file:string;groupId:string;sha256:string}[];
    indicator: string | null;
    denominator: string | null;
    filters: string | null;
    verifiedBy: string | null;
    verifiedAt: string | null;
    note: string;
  };
}
type Prompt = { prompt: string };
export type ChoiceQuestion = Prompt &
  (
    | { type: "highest-rate" }
    | { type: "gap"; groupA: string; groupB: string }
    | { type: "compare"; groupA: string; groupB: string }
    | { type: "rate"; groupId: string }
    | { type: "interpretation" }
  );
export interface PostcardContent {
  id: string;
  entityId: string;
  entityName: string;
  slug: string;
  code: string;
  number: string;
  datasetId: string;
  artwork: string;
  artworkDescription: string;
  title: string;
  introduction: string;
  questionTitle: string;
  question: ChoiceQuestion;
  reflectionTitle: string;
  reflection: string;
}
