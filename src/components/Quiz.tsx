import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Award, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react'
import { useCourseProgress } from '../hooks/useCourseProgress'
import type { QuizQuestion, QuizResult } from '../hooks/useCourseProgress'

interface CourseQuizModalProps {
  userId: string
  courseId: string
  courseTitle: string
  cpdCredits: number
  onClose: () => void
}

export function CourseQuizModal({ userId, courseId, courseTitle, cpdCredits, onClose }: CourseQuizModalProps) {
  const { questions, enrollment, loading, submitting, submitQuizAttempt } = useCourseProgress(userId, courseId)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (loading) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={40} color="#c9a84c" className="animate-spin" />
          <p className="font-semibold text-white/70" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading assessment...</p>
        </div>
      </ModalOverlay>
    )
  }

  if (enrollment?.status === 'completed') {
    return (
      <ModalOverlay onClose={onClose}>
        <CompletedView cpdCredits={cpdCredits} quizScore={enrollment.quiz_score} onClose={onClose} />
      </ModalOverlay>
    )
  }

  if (questions.length === 0) {
    return (
      <ModalOverlay onClose={onClose}>
        <NoQuestionsView courseTitle={courseTitle} onClose={onClose} />
      </ModalOverlay>
    )
  }

  return (
    <ModalOverlay onClose={onClose}>
      <QuizUI courseTitle={courseTitle} cpdCredits={cpdCredits} questions={questions} submitting={submitting} onSubmit={submitQuizAttempt} onClose={onClose} />
    </ModalOverlay>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div key="quiz-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" style={{ backgroundColor: 'rgba(54,64,51,0.92)', backdropFilter: 'blur(16px)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2rem' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  )
}

interface QuizUIProps {
  courseTitle: string
  cpdCredits: number
  questions: QuizQuestion[]
  submitting: boolean
  onSubmit: (answers: number[]) => Promise<QuizResult>
  onClose: () => void
}

type Phase = 'quiz' | 'submitting' | 'results'

function QuizUI({ courseTitle, cpdCredits, questions, submitting, onSubmit, onClose }: QuizUIProps) {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)

  const currentQuestion = questions[currentIndex]
  const selectedOption = selectedAnswers[currentIndex] ?? -1
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = ((currentIndex + (selectedOption !== -1 ? 1 : 0)) / questions.length) * 100

  function handleSelectOption(idx: number) {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: idx }))
  }

  async function handleNext() {
    if (selectedOption === -1) return
    if (!isLastQuestion) { setDirection(1); setCurrentIndex((i) => i + 1); return }
    setPhase('submitting')
    const answersArray = questions.map((_, i) => selectedAnswers[i] ?? -1)
    const res = await onSubmit(answersArray)
    setResult(res)
    setPhase('results')
  }

  if (phase === 'submitting') {
    return (
      <div className="p-12 flex flex-col items-center gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
          <Award size={56} color="#c9a84c" />
        </motion.div>
        <p className="text-white font-semibold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>Calculating your results...</p>
      </div>
    )
  }

  if (phase === 'results' && result) {
    return <ResultsView result={result} cpdCredits={cpdCredits} totalQuestions={questions.length} onClose={onClose} />
  }

  return (
    <div className="p-8 md:p-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#c9a84c' }}>{courseTitle}</p>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <button onClick={onClose} className="rounded-full p-2 transition-colors flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} aria-label="Close quiz">
          <X size={18} color="rgba(255,255,255,0.7)" />
        </button>
      </div>
      <div className="w-full h-1.5 rounded-full mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <motion.div className="h-1.5 rounded-full" style={{ backgroundColor: '#02670a' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>
      <div className="overflow-hidden mb-8" style={{ minHeight: '120px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentIndex} custom={direction} variants={{ enter: (dir: number) => ({ opacity: 0, x: dir * 72 }), center: { opacity: 1, x: 0 }, exit: (dir: number) => ({ opacity: 0, x: dir * -72 }) }} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug" style={{ letterSpacing: '-0.02em' }}>{currentQuestion.question_text}</h2>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`options-${currentIndex}`} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }} className="flex flex-col gap-3 mb-10">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx
            return (
              <motion.button key={optIdx} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } } }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} onClick={() => handleSelectOption(optIdx)} className="w-full text-left px-6 py-4 rounded-[1.5rem] font-medium text-sm transition-all" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: isSelected ? 'rgba(2,103,10,0.22)' : 'rgba(255,255,255,0.06)', border: isSelected ? '2px solid rgba(2,103,10,0.7)' : '2px solid rgba(255,255,255,0.1)', color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0" style={{ backgroundColor: isSelected ? '#02670a' : 'rgba(255,255,255,0.1)', color: 'white' }}>{String.fromCharCode(65 + optIdx)}</span>
                {option}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{questions[currentIndex].points} pts per question - pass mark 80%</span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} disabled={selectedOption === -1 || submitting} onClick={handleNext} className="flex items-center gap-2 px-8 py-3 rounded-[3rem] font-bold text-sm text-white transition-all" style={{ backgroundColor: selectedOption === -1 ? 'rgba(2,103,10,0.35)' : '#02670a', opacity: selectedOption === -1 ? 0.5 : 1, cursor: selectedOption === -1 ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}<ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

function ResultsView({ result, cpdCredits, totalQuestions, onClose }: { result: QuizResult; cpdCredits: number; totalQuestions: number; onClose: () => void }) {
  const { passed, percentage, score, totalPoints } = result
  const cpdRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!passed) return
    const el = cpdRef.current
    if (!el) return
    let current = 0
    const step = cpdCredits / (1200 / 16)
    const timer = setInterval(() => {
      current = Math.min(current + step, cpdCredits)
      if (el) el.textContent = current.toFixed(1)
      if (current >= cpdCredits) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [passed, cpdCredits])

  return (
    <div className="p-8 md:p-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {passed ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center text-center">
          <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)', boxShadow: '0 0 48px rgba(201,168,76,0.4)' }}>
              <Award size={48} color="#000" />
            </div>
          </motion.div>
          <h2 className="text-4xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Passed!</h2>
          <p className="font-semibold text-lg mb-8" style={{ color: '#c9a84c' }}>We Are Greater Than Me</p>
          <div className="flex items-center gap-3 px-8 py-4 rounded-[2rem] mb-8" style={{ backgroundColor: 'rgba(2,103,10,0.2)', border: '1px solid rgba(2,103,10,0.4)' }}>
            <CheckCircle2 size={22} color="#4ade80" />
            <span className="text-2xl font-extrabold" style={{ color: '#4ade80', letterSpacing: '-0.02em' }}>{percentage}%</span>
            <span className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>({score}/{totalPoints} pts - {totalQuestions} questions)</span>
          </div>
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center mb-10 p-6 rounded-[2rem] w-full" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(240,208,128,0.08) 100%)', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#c9a84c' }}>CPD Credits Earned</p>
            <span className="text-6xl font-extrabold" style={{ color: '#c9a84c', letterSpacing: '-0.03em', textShadow: '0 0 32px rgba(201,168,76,0.5)' }}><span ref={cpdRef}>0.0</span></span>
            <p className="text-xs font-medium mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>credited to your professional development record</p>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} onClick={onClose} className="px-12 py-4 rounded-[3rem] font-bold text-black text-base" style={{ backgroundColor: '#c9a84c' }}>Back to Dashboard</motion.button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <XCircle size={48} color="#b1b1b1" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Not Quite</h2>
          <p className="font-medium mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>You need 80% to pass. You scored {percentage}%. Review the material and try again.</p>
          <div className="flex items-center gap-3 px-8 py-4 rounded-[2rem] mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-3xl font-extrabold" style={{ color: '#b1b1b1', letterSpacing: '-0.02em' }}>{percentage}%</span>
            <span className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>({score}/{totalPoints} pts - pass mark 80%)</span>
          </div>
          <p className="text-xs font-medium mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Your progress has been saved. You can re-attempt after reviewing the course content.</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} onClick={onClose} className="flex items-center gap-2 px-8 py-3.5 rounded-[3rem] font-bold text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
              <RotateCcw size={15} />Review & Retry
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function CompletedView({ cpdCredits, quizScore, onClose }: { cpdCredits: number; quizScore: number; onClose: () => void }) {
  return (
    <div className="p-12 flex flex-col items-center text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d080 100%)', boxShadow: '0 0 40px rgba(201,168,76,0.35)' }}>
        <Award size={40} color="#000" />
      </motion.div>
      <h2 className="text-3xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Already Completed!</h2>
      <p className="font-medium mb-2" style={{ color: '#c9a84c' }}>{quizScore}% - {cpdCredits} CPD credits earned</p>
      <p className="text-sm font-medium mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>You have already passed this assessment. Your certificate is on your Dashboard.</p>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} onClick={onClose} className="px-10 py-3.5 rounded-[3rem] font-bold text-black text-sm" style={{ backgroundColor: '#c9a84c' }}>Back to Dashboard</motion.button>
    </div>
  )
}

function NoQuestionsView({ courseTitle, onClose }: { courseTitle: string; onClose: () => void }) {
  return (
    <div className="p-12 flex flex-col items-center text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <Award size={36} color="#b1b1b1" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Assessment Coming Soon</h2>
      <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{courseTitle}</p>
      <p className="text-sm font-medium mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>The quiz for this course is being prepared. Check back soon.</p>
      <button onClick={onClose} className="px-8 py-3 rounded-[3rem] font-semibold text-sm text-white" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>Close</button>
    </div>
  )
}
