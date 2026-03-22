export interface SubjectMarkDTO {
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  marksObtained: number;
  grade: string;
  remarks: string;
}

export interface ExamResultDTO {
  examId: number;
  examName: string;
  subjects: SubjectMarkDTO[];
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  overallGrade: string;
}

export interface ReportCardDTO {
  studentId: number;
  studentName: string;
  admissionNumber: string;
  className: string;
  sectionName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  profilePhoto: string;
  sessionName: string;
  
  examResults: ExamResultDTO[];
  
  totalWorkingDays: number;
  presentDays: number;
  attendancePercentage: number;
  
  classTeacherRemarks: string;
}