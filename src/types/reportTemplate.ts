// Question structure for each section
export interface Question {
  Question: string;
  answer: string;
  answers: string[]; // Options for selection (for type 'table')
  photo: string;
  Ket: string;
}

// Section types based on API response
export type SectionType = 'table' | 'table_text' | 'text';

// Section structure matching API response
export interface Section {
  id?: string;
  Section: string; // Section name/title
  type: SectionType;
  Questions: Question[];
}

// Template structure matching API response
export interface ReportTemplate {
  id?: string;
  title: string;
  year: number;
  data: Section[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API Response structure
export interface ReportTemplateResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    title: string;
    year: number;
    data: Section[];
  };
}

// Request body for creating/updating template
export interface CreateReportTemplateData {
  title: string;
  year: number;
  data: Section[];
  isActive?: boolean;
}

export interface UpdateReportTemplateData extends Partial<CreateReportTemplateData> {}
