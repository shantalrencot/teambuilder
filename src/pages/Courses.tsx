import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Beams from '../components/Beams'
import Navbar from '../components/Navbar'

interface Course {
  id: string; slug: string; title: string; description: string | null
  segment: string; category: string; price_usd: number
  access_type: 'free' | 'paid' | 'subscription'
  is_published: boolean; cpd_credits: number; sort_order: number
}

interface Enrollment { course_id: string; status: string }

const SEGMENT_LABELS: Record<string, string> = {
  youth: 'Youth', low_grade: 'Low Grade', mid_grade: 'Mid Grade',
  high_grade: 'High Grade', sme: 'SME', management: 'Management', executive: 'Executive',
}

const SEGMENT_OPTIONS = [
  { value: '', label: 'All Segments' }, { value: 'youth', label: 'Youth' },
  { value: 'low_grade', label: 'Low Grade' }, { value: 'mid_grade', label: 'Mid Grade' },
  { value: 'high_grade', label: 'High Grade' }, { value: 'sme', label: 'SME' },
  { value: 'management', label: 'Management' }, { value: 'executive', label: 'Executive' },
]

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

const springHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
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

export default function Courses() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login', { replace: true }); return }
    void fetchData()
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true)
    const [coursesRes, enrollRes] = await Promise.all([
      supabase.from('courses').select('id, slug, title, description, segment, category, price_usd, access_type, is_published, cpd_credits, sort_order').eq('is_published', true).order('sort_order', { ascending: true }),
      user ? supabase.from('enrollments').select('course_id, status').eq('user_id', user.id) : Promise.resolve({ data: [], error: null }),
    ])
    if (!coursesRes.error && coursesRes.data) setCourses(coursesRes.data as Course[])
    if (!enrollRes.error && enrollRes.data) setEnrollments(enrollRes.data as Enrollment[])
    setLoading(false)
  }

  async function handleEnrol(course: Course) {
    if (!user) return
    setEnrollingId(course.id)
    const { error } = await supabase.from('enrollments').insert({ user_id: user.id, course_id: course.id, status: 'active', amount_paid_usd: course.access_type === 'free' ? 0 : course.price_usd })
    if (!error) setEnrollments((prev) => [...prev, { course_id: course.id, status: 'active' }])
    setEnrollingId(null)
  }

  const filtered = useMemo(() => {
    let result = courses
    if (segmentFilter) result = result.filter((c) => c.segment === segmentFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((c) => c.title.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false) || c.category.toLowerCase().includes(q))
    }
    return result
  }, [courses, search, segmentFilter])

  const enrolledIds = new Set(enrollments.map((e) => e.course_id))
  if (authLoading || loading) return <LoadingScreen />

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#364033', fontFamily: 'Montserrat, sans-serif' }}>
      <Beams beamWidth={3} beamHeight={30} beamNumber={20} lightColor="#ffffff" speed={2} noiseIntensity={1.75} rotation={30} className="absolute inset-0 z-0" />
      <div className="relative z-10"><Navbar variant="portal" /></div>
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-12 px-6 text-center" style={{ backgroundColor: 'rgba(2,103,10,0.15)', borderBottom: '1px solid rgba(2,103,10,0.2)' }}>
          <h1 className="text-5xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Course Catalogue</h1>
          <p className="font-medium text-lg" style={{ color: '#b1b1b1' }}>{courses.length} courses - 7 segments - CPD certified</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" color="rgba(255,255,255,0.4)" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="w-full pl-11 pr-5 py-3 outline-none text-white text-sm font-medium transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2rem', fontFamily: 'Montserrat, sans-serif' }} onFocus={(e) => { e.target.style.borderColor = 'rgba(2,103,10,0.8)' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.2)' }} />
          </div>
          <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} className="px-5 py-3 outline-none text-white text-sm font-medium cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2rem', fontFamily: 'Montserrat, sans-serif', minWidth: '180px' }}>
            {SEGMENT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} style={{ backgroundColor: '#364033' }}>{opt.label}</option>)}
          </select>
          <span className="text-sm font-medium" style={{ color: '#b1b1b1' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''}</span>
        </motion.div>
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24">
                <BookOpen size={48} color="rgba(255,255,255,0.2)" className="mb-4" />
                <p className="text-white/40 font-medium">No courses match your search.</p>
              </motion.div>
            ) : (
              <motion.div key={`grid-${segmentFilter}`} variants={gridVariants} initial="hidden" animate="visible" className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {filtered.map((course) => {
                  const isEnrolled = enrolledIds.has(course.id)
                  const isEnrolling = enrollingId === course.id
                  const isFree = course.access_type === 'free'
                  return (
                    <motion.div key={course.id} variants={cardVariants} layout whileHover={{ scale: 1.02, y: -5 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} className="flex flex-col p-6 rounded-[2rem] backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: isEnrolled ? '1px solid rgba(2,103,10,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(2,103,10,0.2)', color: '#4ade80' }}>{SEGMENT_LABELS[course.segment] ?? course.segment}</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={isFree ? { backgroundColor: 'rgba(2,103,10,0.2)', color: '#4ade80' } : { backgroundColor: 'rgba(201,168,76,0.2)', color: '#c9a84c' }}>{isFree ? 'Free' : `$${Math.round(course.price_usd)}`}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2 leading-snug flex-1" style={{ letterSpacing: '-0.02em' }}>{course.title}</h3>
                      {course.description && <p className="text-sm font-medium mb-3 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{course.description}</p>}
                      <p className="text-xs font-medium mb-5" style={{ color: '#b1b1b1' }}>{course.cpd_credits} CPD credits - {course.category}</p>
                      {isEnrolled && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <CheckCircle2 size={13} color="#4ade80" />
                          <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Enrolled</span>
                        </div>
                      )}
                      <motion.button {...springHover} disabled={isEnrolled || isEnrolling} onClick={() => !isEnrolled && !isEnrolling && void handleEnrol(course)} className="w-full py-3 rounded-[2rem] font-bold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: isEnrolled ? 'rgba(2,103,10,0.2)' : '#02670a', color: isEnrolled ? '#4ade80' : 'white', opacity: isEnrolled ? 0.75 : 1, cursor: isEnrolled ? 'default' : 'pointer' }}>
                        {isEnrolling ? <><Loader2 size={14} className="animate-spin" />Enrolling...</> : isEnrolled ? 'Enrolled' : isFree ? 'Enrol Free' : `Enrol - $${Math.round(course.price_usd)}`}
                      </motion.button>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
