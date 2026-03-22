export interface SubjectDTO {
  id?: number; // Optional because it's null when creating
  subjectName: string;
  subjectCode: string;
  subjectType: string; // 'THEORY', 'PRACTICAL', etc.
}