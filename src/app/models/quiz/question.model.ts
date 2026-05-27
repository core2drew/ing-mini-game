export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  questionNumber?: number;
}
