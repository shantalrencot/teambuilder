import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, BookOpen, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  variant: 'landing' | 'portal'
}

export default function Navbar({ variant }: NavbarProps) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const isAdmin = role === 'admin' || role === 'super_admin'

  if (variant === 'landing') {
    return (
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        style={{ backgroundColor: 'rgba(54,64,51,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/TEAMLOGO.webp" alt="TEAM Consulting" className="h-10 w-10 object-contain rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>Team Builder</span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="px-6 py-2.5 rounded-[3rem] border-2 font-semibold text-sm transition-colors" style={{ borderColor: '#c9a84c', color: '#c9a84c', fontFamily: 'Montserrat, sans-serif' }}>Staff Login</Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="px-6 py-2.5 rounded-[3rem] font-semibold text-sm text-white transition-all hover:opacity-90" style={{ backgroundColor: '#02670a', fontFamily: 'Montserrat, sans-serif' }}>Get Started</Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>
    )
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-40 border-b border-white/10"
      style={{ backgroundColor: 'rgba(54,64,51,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
          <img src="/TEAMLOGO.webp" alt="TEAM Consulting" className="h-9 w-9 object-contain rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>Team Builder</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-[2rem] text-sm font-semibold transition-all ${location.pathname === '/dashboard' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <LayoutDashboard size={15} />Dashboard
          </Link>
          <Link to="/courses" className={`flex items-center gap-2 px-4 py-2 rounded-[2rem] text-sm font-semibold transition-all ${location.pathname === '/courses' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <BookOpen size={15} />Courses
          </Link>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {user?.email && <span className="text-white/40 text-xs hidden md:block truncate max-w-[160px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{user.email}</span>}
          {role && <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize hidden sm:block" style={{ backgroundColor: 'rgba(2,103,10,0.25)', color: '#4ade80', fontFamily: 'Montserrat, sans-serif' }}>{role.replace('_', ' ')}</span>}
          {isAdmin && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link to="/admin" className={`flex items-center gap-1.5 px-4 py-2 rounded-[2rem] text-xs font-semibold transition-all ${location.pathname === '/admin' ? 'bg-white/15 text-white' : 'border border-white/20 text-white/70 hover:text-white hover:bg-white/10'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <ShieldCheck size={13} />Admin
              </Link>
            </motion.div>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSignOut} className="flex items-center gap-1.5 px-4 py-2 rounded-[2rem] text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <LogOut size={13} />Sign Out
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
