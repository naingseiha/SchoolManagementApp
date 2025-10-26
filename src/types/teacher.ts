export interface Teacher {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  subjects?: string[];
  classes?: string[];
  isClassTeacher: boolean;
  classTeacherOf?: string;
}