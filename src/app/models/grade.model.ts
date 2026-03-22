export interface GradeMasterDTO {
  id?: number;
  gradeName: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  remarks?: string;
}