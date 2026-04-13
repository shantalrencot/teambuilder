import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import Particles from '../components/Particles'

export default function Login() {
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (user) {
      if (role === 'admin' || role === 'super_admin') navigate('/admin', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
  }, [user, role, authLoading, navigate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Login failed. Please check your credentials.')
      setSubmitting(false)
      return
    }
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).limit(1).single()
    const userRole = roleData?.role as string | undefined
    setSubmitting(false)
    if (userRole === 'admin' || userRole === 'super_admin') navigate('/admin', { replace: true })
    else navigate('/dashboard', { replace: true })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4" style={{ backgroundColor: '#364033' }}>
      <Particles particleColors={['rgba(254,254,254,0.4)', 'rgba(201,168,76,0.3)']} particleCount={50} speed={0.08} particleBaseSize={60} moveParticlesOnHover={false} className="absolute inset-0 z-0" />
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full max-w-md">
        <div className="p-10 rounded-[2.5rem]" style={{ backgroundColor: 'rgba(254,254,254,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex flex-col items-center mb-8">
            <img src="/TEAMLOGO.webp" alt="TEAM Consulting" className="h-16 w-16 object-contain rounded-2xl mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <h1 className="text-3xl font-extrabold text-black" style={{ letterSpacing: '-0.03em', fontFamily: 'Montserrat, sans-serif' }}>Welcome Back</h1>
            <p className="font-medium mt-1 text-sm" style={{ color: '#b1b1b1', fontFamily: 'Montserrat, sans-serif' }}>Team Builder - TEAM Consulting</p>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-[1rem] text-sm font-medium" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontFamily: 'Montserrat, sans-serif' }}>{error}</motion.div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#364033', fontFamily: 'Montserrat, sans-serif' }}>Email Address</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organisation.com" className="outline-none w-full transition-all" style={{ padding: '1rem 1.25rem', borderRadius: '1.5rem', border: '2px solid rgba(177,177,177,0.3)', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: '#000', backgroundColor: '#fefefe' }} onFocus={(e) => { e.target.style.borderColor = '#02670a' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(177,177,177,0.3)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#364033', fontFamily: 'Montserrat, sans-serif' }}>Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="outline-none w-full pr-12 transition-all" style={{ padding: '1rem 1.25rem', borderRadius: '1.5rem', border: '2px solid rgba(177,177,177,0.3)', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: '#000', backgroundColor: '#fefefe' }} onFocus={(e) => { e.target.style.borderColor = '#02670a' }} onBlur={(e) => { e.target.style.borderColor = 'rgba(177,177,177,0.3)' }} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }} className="mt-2 w-full py-4 rounded-[3rem] font-bold text-white text-base flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: submitting ? '#5a9e60' : '#02670a', fontFamily: 'Montserrat, sans-serif', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? <><Loader2 size={18} className="animate-spin" />Signing in...</> : 'Sign In'}
            </motion.button>
          </form>
          <p className="text-center text-xs font-medium mt-6" style={{ color: '#b1b1b1', fontFamily: 'Montserrat, sans-serif' }}>Don't have an account? <span style={{ color: '#02670a', cursor: 'default' }}>Contact your TEAM administrator.</span></p>
        </div>
      </motion.div>
    </div>
  )
}
