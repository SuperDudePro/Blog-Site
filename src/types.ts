
export type Domain = {
  slug: string;
  title: string;
  number: string;
  coreOutcomes: string[];
  competencies: string[];
  evidence: string;
};

export type RichSectionContent = {
  heading: string;
  body?: string[];
  bullets?: string[];
  footer?: string;
};

export type RichSectionData = RichSectionContent;


export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string; level?: number }
  | { type: "list"; items: string[] };

export type StructuredSection = {
  id: string;
  heading: string;
  blocks: ContentBlock[];
};
