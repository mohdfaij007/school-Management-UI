export interface StudentMarksDTO {
  id?: number;
  examSubjectMappingId: number;
  studentId: number;
  
  // UI Display Fields
  studentName?: string;
  admissionNumber?: string;
  rollNumber?: string;
  
  marksObtained: number | null; // Null means marks not entered yet
  isAbsent: boolean;
  remarks?: string;
}