export interface ExamDTO {
  id?: number;
  examName: string;
  academicSessionId: number;
  isActive?: boolean;
  description?: string;
}

export interface ExamSubjectMappingDTO {
  id?: number;
  examId: number;
  standardId: number;
  subjectId: number;
  
  subjectName?: string; // Display purpose from backend
  
  maxMarks: number;
  passingMarks: number;
  
  examDate?: string; // YYYY-MM-DD format
  startTime?: string; // HH:mm:ss format
  endTime?: string;
}