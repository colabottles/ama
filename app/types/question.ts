export interface Question {
  id: string
  question: string
  answer: string | null
  answered: boolean
  created_at: string
}