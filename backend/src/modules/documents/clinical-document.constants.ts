export const CLINICAL_DOCUMENT_CATEGORIES = [
  'medical_history',
  'medical_consultation',
] as const;

export type ClinicalDocumentCategory =
  (typeof CLINICAL_DOCUMENT_CATEGORIES)[number];
