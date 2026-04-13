import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export interface QuizQuestion {
  id: string
  question_text: string
  options: string[]
  correct_option_index: number
  points: number
  sort_order: number
}

export interface CourseEnrollment {
  id: string
  status: 'pending' | 'active' | 'completed' | 'expired'
  progress_pct: number
  quiz_score: number
  current_step: number
  enrolled_at: string
}

export interface QuizResult {
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
}

export interface UseCourseProgressReturn {
  enrollment: CourseEnrollment | null
  questions: QuizQuestion[]
  loading: boolean
  submitting: boolean
  submitQuizAttempt: (answers: number[]) => Promise<QuizResult>
  refetch: () => Promise<void>
}

export function useCourseProgress(
  userId: string | undefined,
  courseId: string
): UseCourseProgressReturn {
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!userId || !courseId) { setLoading(false); return }
    setLoading(true)

    const [enrollRes, questionsRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select('id, status, progress_pct, quiz_score, current_step, enrolled_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle(),
      supabase
        .from('quiz_questions')
        .select('id, question_text, options, correct_option_index, points, sort_order')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true }),
    ])

    if (!enrollRes.error && enrollRes.data) {
      setEnrollment(enrollRes.data as CourseEnrollment)
    } else {
      setEnrollment(null)
    }

    if (!questionsRes.error && questionsRes.data) {
      const parsed = questionsRes.data.map((q) => ({
        ...q,
        options: Array.isArray(q.options)
          ? (q.options as string[])
          : (JSON.parse(q.options as unknown as string) as string[]),
      }))
      setQuestions(parsed as QuizQuestion[])
    } else {
      setQuestions([])
    }

    setLoading(false)
  }, [userId, courseId])

  useEffect(() => { void fetchData() }, [fetchData])

  const submitQuizAttempt = useCallback(
    async (answers: number[]): Promise<QuizResult> => {
      if (!userId || !enrollment) {
        return { score: 0, totalPoints: 0, percentage: 0, passed: false }
      }
      setSubmitting(true)

      let score = 0
      let totalPoints = 0
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        totalPoints += q.points
        if (answers[i] === q.correct_option_index) score += q.points
      }
      const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
      const passed = percentage >= 80

      await supabase.from('quiz_attempts').insert({
        user_id: userId,
        course_id: courseId,
        enrollment_id: enrollment.id,
        score,
        total_points: totalPoints,
        percentage,
        passed,
        answers,
      })

      const progressPct = passed ? 100 : Math.min(75, Math.round(percentage * 0.75))
      const enrollmentUpdate: Record<string, unknown> = {
        progress_pct: progressPct,
        quiz_score: percentage,
        current_step: questions.length,
      }
      if (passed) {
        enrollmentUpdate.status = 'completed'
        enrollmentUpdate.completed_at = new Date().toISOString()
      }

      await supabase.from('enrollments').update(enrollmentUpdate).eq('id', enrollment.id)

      if (passed) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('cpd_credits, segment')
          .eq('id', courseId)
          .single()

        const cpd = (courseData?.cpd_credits as number) ?? 1.0
        const segment = (courseData?.segment as string) ?? 'youth'
        const pointsToAward = Math.round(cpd * 10 * (percentage / 100))

        await supabase.from('leaderboard_points').insert({
          user_id: userId,
          segment,
          points: pointsToAward,
          reason: `Quiz completed - ${percentage}% on "${courseId}" (${cpd} CPD)`,
        })
      }

      await fetchData()
      setSubmitting(false)
      return { score, totalPoints, percentage, passed }
    },
    [userId, enrollment, questions, courseId, fetchData]
  )

  return { enrollment, questions, loading, submitting, submitQuizAttempt, refetch: fetchData }
}
