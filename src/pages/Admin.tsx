import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Users, BookOpen, TrendingUp, Activity, ExternalLink } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Beams from '../components/Beams'
import Navbar from '../components/Navbar'

interface AdminStats { totalUsers: number; totalEnrollments: number; activeEnrollments: number; totalCourses: number }
interface UserRow { id: string; full_name: string; email: string; organisation: string | null; created_at: string; role: string | null }
type TabId = 'overview' | 'users' | 'courses'

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

export default function Admin() {
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalEnrollments: 0, activeEnrollments: 0, totalCourses: 0 })
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const isAdmin = role === 'admin' || role === 'super_admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login', { replace: true }); return }
    if (!isAdmin) { navigate('/dashboard', { replace: true }); return }
    fetchData()
  }, [user, role, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true)
    const [profilesRes, enrollRes, coursesRes, userRolesRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, organisation, created_at'),
      supabase.from('enrollments').select('id, status'),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('user_roles').select('user_id, role'),
    ])
    const profiles = profilesRes.data ?? []
    const enrollments = enrollRes.data ?? []
    const courseCount = coursesRes.count ?? 0
    const roleMap = new Map<string, string>()
    for (const r of userRolesRes.data ?? []) { if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role as string) }
    setStats({ totalUsers: profiles.length, totalEnrollments: enrollments.length, activeEnrollments: enrollments.filter((e) => e.status === 'active').length, totalCourses: courseCount })
    setUsers(profiles.map((p) => ({ id: p.id, full_name: p.full_name, email: p.email, organisation: p.organisation ?? null, created_at: p.created_at, role: roleMap.get(p.id) ?? null })))
    setLoading(false)
  }

  if (authLoading || loading) return <LoadingScreen />

  const TABS: { id: TabId; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'courses', label: 'Courses' }]

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#364033', fontFamily: 'Montserrat, sans-serif' }}>
      <Beams beamWidth={3} beamHeight={30} beamNumber={20} lightColor="#ffffff" speed={2} noiseIntensity={1.75} rotation={30} className="absolute inset-0 z-0" />
      <div className="relative z-10"><Navbar variant="portal" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.03em' }}>Admin Panel</h1>
          <p className="font-medium italic" style={{ color: '#c9a84c' }}>Platform Intelligence</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-flex p-1.5 rounded-[2rem] mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {TABS.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-6 py-2.5 rounded-[1.5rem] font-semibold text-sm transition-all" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: activeTab === tab.id ? '#02670a' : 'transparent', color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)' }}>{tab.label}</button>))}
        </motion.div>
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard label="Total Users" value={stats.totalUsers} color="#4ade80" icon={<Users size={20} color="#4ade80" />} />
              <StatCard label="Total Enrollments" value={stats.totalEnrollments} color="#c9a84c" icon={<BookOpen size={20} color="#c9a84c" />} />
              <StatCard label="Active Enrollments" value={stats.activeEnrollments} color="#60a5fa" icon={<Activity size={20} color="#60a5fa" />} />
              <StatCard label="Total Courses" value={stats.totalCourses} color="#b1b1b1" icon={<TrendingUp size={20} color="#b1b1b1" />} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <ActionButton label="View Users" onClick={() => setActiveTab('users')} />
                <ActionButton label="Manage Courses" onClick={() => setActiveTab('courses')} />
                <ActionButton label="View Catalogue" onClick={() => navigate('/courses')} external />
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>All Users <span className="ml-3 text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(2,103,10,0.2)', color: '#4ade80' }}>{users.length}</span></h2>
            </div>
            <div className="rounded-[2rem] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="grid px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(2,103,10,0.35)', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
                <span>Name</span><span>Email</span><span>Organisation</span><span>Role</span><span>Joined</span>
              </div>
              {users.length === 0 ? <div className="py-12 text-center"><p className="text-white/40 font-medium">No users found.</p></div> : users.map((u, i) => (
                <div key={u.id} className="grid px-6 py-4 items-center text-sm transition-colors" style={{ gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr', backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', fontFamily: 'Montserrat, sans-serif' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <span className="font-semibold text-white truncate pr-2">{u.full_name}</span>
                  <span className="truncate pr-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{u.email}</span>
                  <span className="truncate pr-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{u.organisation ?? '-'}</span>
                  <span>{u.role ? <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: 'rgba(2,103,10,0.2)', color: '#4ade80' }}>{u.role.replace('_', ' ')}</span> : <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(u.created_at).toLocaleDateString('en-ZW', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'courses' && (
          <motion.div key="courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="p-8 rounded-[2rem] mb-6 inline-flex items-center gap-5" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <BookOpen size={32} color="#c9a84c" />
              <div><p className="text-5xl font-extrabold" style={{ color: '#c9a84c', letterSpacing: '-0.03em' }}>{stats.totalCourses}</p><p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Published courses</p></div>
            </div>
            <div className="p-8 rounded-[2rem] mb-6" style={{ backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <h3 className="font-bold text-white text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>Video Upload & Content Management</h3>
              <p className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Full video hosting, lesson builder, and content management features are coming in Phase 2. All 42 course shells are live in the database and visible to learners.</p>
            </div>
            <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-[2rem] font-semibold text-sm transition-all" style={{ backgroundColor: 'rgba(2,103,10,0.2)', border: '1px solid rgba(2,103,10,0.4)', color: '#4ade80' }}><ExternalLink size={15} />View Live Catalogue</Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-8 rounded-[2rem] backdrop-blur-md flex flex-col gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2">{icon}</div>
      <span className="text-6xl font-extrabold" style={{ color, letterSpacing: '-0.03em', fontFamily: 'Montserrat, sans-serif' }}>{value}</span>
      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
    </motion.div>
  )
}

function ActionButton({ label, onClick, external = false }: { label: string; onClick: () => void; external?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={onClick} className="flex items-center gap-2 px-6 py-3 rounded-[2rem] font-semibold text-sm transition-all" style={{ backgroundColor: 'rgba(2,103,10,0.15)', border: '1px solid rgba(2,103,10,0.35)', color: '#4ade80', fontFamily: 'Montserrat, sans-serif' }}>
      {external && <ExternalLink size={14} />}{label}
    </motion.button>
  )
}
