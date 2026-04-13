import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Star, ChevronRight, Inbox } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Beams from '../components/Beams'
import Navbar from '../components/Navbar'
import { CourseQuizModal } from '../components/Quiz'

interface EnrollmentCourse {
  id: string; title: string; slug: string; segment: string
  cpd_credits: number; thumbnail_url: string | null
}

interface Enrollment {
  id: string
  status: 'pending' | 'active' | 'completed' | 'expired'
  progress_pct: number
  enrolled_at: string
  expires_at: string | null
  completed_at: string | null
  courses: EnrollmentCourse | null
}

interface QuizCourse { id: string; title: string; cpd_credits: number }

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
}

const springHover = {
  whileHover: { scale: 1.05, y: -4 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
}

function CountUp({ target, color }: { target: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (target === 0) { el.textContent = '0'; return }
    let current = 0
    const step = target / (1500 / 16)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      if (el) el.textContent = Math.round(current).toString()
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <span ref={ref} className="text-5xl font-extrabold" style={{ color, letterSpacing: '-0.03em', fontFamily: 'Montserrat, sans-serif' }}>0</span>
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ backgroundColor: '#364033' }}>
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-4">
        <img src="/TEAMLOGO.webp" alt="Loading" className="h-20 w-20 object-contain rounded-2xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <span className="text-white font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>Team Builder</span>
      </motion.div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quizCourse, setQuizCourse] = useState<QuizCourse | null>(null)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const displayName =
    (user?.user_metadata as Record<string, string> | null)?.full_name ??
    user?.email?.split('@')[0] ?? 'Learner'

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login', { replace: true }); return }
    void fetchData()
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    if (!user) return
    setLoading(true)
    const [enrollRes, pointsRes] = await Promise.all([
      supabase.from('enrollments').select('id, status, progress_pct, enrolled_at, expires_at, completed_at, courses ( id, title, slug, segment, cpd_credits, thumbnail_url )').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
      supabase.from('leaderboard_points').select('points').eq('user_id', user.id),
    ])
    if (!enrollRes.error && enrollRes.data) setEnrollments(enrollRes.data as unknown as Enrollment[])
    if (!pointsRes.error && pointsRes.data) {
      const total = (pointsRes.data as { points: number }[]).reduce((sum, r) => sum + (r.points ?? 0), 0)
      setPoints(total)
    }
    setLoading(false)
  }

  if (authLoading || loading) return <LoadingScreen />

  const active = enrollments.filter((e) => e.status === 'active' || e.status === 'pending')
  const completed = enrollments.filter((e) => e.status === 'completed')

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#364033', fontFamily: 'Montserrat, sans-serif' }}>
      <Beams beamWidth={3} beamHeight={30} beamNumber={20} lightColor="#ffffff" speed={2} noiseIntensity={1.75} rotation={30} className="absolute inset-0 z-0" />
      <div className="relative z-10"><Navbar variant="portal" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 p-8 rounded-[2rem] backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="text-4xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.03em' }}>{greeting}, {displayName}</h1>
          <p className="font-medium italic" style={{ color: '#c9a84c' }}>We Are Greater Than Me</p>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[{ label: 'Active Courses', value: active.length, color: '#4ade80' }, { label: 'Completed', value: completed.length, color: '#c9a84c' }, { label: 'Points Earned', value: points, color: '#b1b1b1' }].map((stat) => (
            <motion.div key={stat.label} variants={cardVariants} className="p-6 rounded-[2rem] backdrop-blur-md flex flex-col gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CountUp target={stat.value} color={stat.color} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>My Active Courses</h2>
            <motion.button {...springHover} onClick={() => navigate('/courses')} className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#c9a84c' }}>Browse all <ChevronRight size={15} /></motion.button>
          </div>
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-[2rem]" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Inbox size={48} color="rgba(255,255,255,0.2)" className="mb-4" />
              <p className="text-white/50 font-medium mb-4">No active courses yet</p>
              <motion.button {...springHover} onClick={() => navigate('/courses')} className="px-6 py-3 rounded-[3rem] font-semibold text-sm" style={{ backgroundColor: '#c9a84c', color: '#000' }}>Browse Courses</motion.button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {active.map((enroll) => <CourseCard key={enroll.id} enrollment={enroll} variant="active" onContinue={(course) => setQuizCourse(course)} />)}
            </motion.div>
          )}
        </motion.section>
        {completed.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-white mb-5" style={{ letterSpacing: '-0.02em' }}>Completed Courses</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {completed.map((enroll) => <CourseCard key={enroll.id} enrollment={enroll} variant="completed" onContinue={(course) => setQuizCourse(course)} />)}
            </motion.div>
          </motion.section>
        )}
      </div>
      <AnimatePresence>
        {quizCourse && user && (
          <CourseQuizModal key={quizCourse.id} userId={user.id} courseId={quizCourse.id} courseTitle={quizCourse.title} cpdCredits={quizCourse.cpd_credits} onClose={() => { setQuizCourse(null); void fetchData() }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function CourseCard({ enrollment, variant, onContinue }: { enrollment: Enrollment; variant: 'active' | 'completed'; onContinue: (course: QuizCourse) => void }) {
  const course = enrollment.courses
  if (!course) return null
  const borderColor = variant === 'completed' ? '#c9a84c' : '#02670a'
  return (
    <motion.div variants={cardVariants} whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="p-6 rounded-[2rem] backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `4px solid ${borderColor}` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4ade80' }}>{course.segment.replace('_', ' ')}</p>
      <h3 className="text-white font-bold text-lg mb-1 leading-snug" style={{ letterSpacing: '-0.02em' }}>{course.title}</h3>
      <p className="text-sm font-medium mb-3" style={{ color: '#b1b1b1' }}>{course.cpd_credits} CPD credits</p>
      {variant === 'completed' ? (
        <div className="flex items-center gap-1.5 mb-4">
          <CheckCircle2 size={14} color="#c9a84c" />
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>Completed</span>
        </div>
      ) : (enrollment.expires_at && <p className="text-xs font-medium mb-4" style={{ color: 'rgba(201,168,76,0.8)' }}>Expires: {new Date(enrollment.expires_at).toLocaleDateString()}</p>)}
      {variant === 'active' && (
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-medium text-white/50">Progress</span>
            <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>{enrollment.progress_pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="h-2 rounded-full" style={{ backgroundColor: '#02670a' }} initial={{ width: 0 }} animate={{ width: `${enrollment.progress_pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
          </div>
        </div>
      )}
      {variant === 'active' && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} onClick={() => onContinue({ id: course.id, title: course.title, cpd_credits: course.cpd_credits })} className="flex items-center gap-1.5 px-5 py-2.5 rounded-[2rem] font-semibold text-sm text-white" style={{ backgroundColor: '#02670a' }}>
          <BookOpen size={14} />Take Assessment
        </motion.button>
      )}
      {variant === 'completed' && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} className="flex items-center gap-1.5 px-5 py-2.5 rounded-[2rem] font-semibold text-sm" style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
          <Star size={14} />View Certificate
        </motion.button>
      )}
    </motion.div>
  )
}
