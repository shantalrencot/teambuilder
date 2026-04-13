import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Award, Users, Building2, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react'
import Particles from '../components/Particles'
import Navbar from '../components/Navbar'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function useCountUp(target: number, duration = 1500) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      el.textContent = Math.round(start).toString()
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return ref
}

const FEATURES = [
  { icon: BookOpen, title: 'Role-Curated Learning', body: 'Courses matched to your exact career stage — from youth to executive. No irrelevant content.' },
  { icon: Heart, title: 'Life Skills Track', body: 'Emotional intelligence, financial wellness, and personal effectiveness woven through every tier.' },
  { icon: Award, title: 'CPD Certificates', body: 'Earn Continuing Professional Development certificates recognised across corporate Africa.' },
  { icon: Users, title: 'Community Forum', body: 'Connect with peers across your segment. Share, collaborate, and grow together.' },
  { icon: Building2, title: 'Corporate Endorsements', body: "Training programmes designed in partnership with Zimbabwe's leading organisations." },
  { icon: Sparkles, title: 'AI Recommendations', body: 'Smart course suggestions powered by your role, progress, and learning history.' },
]

const SEGMENTS = [
  { label: 'Youth', count: 6, emoji: '🌱', desc: 'School leavers & first-jobbers' },
  { label: 'Low Grade', count: 6, emoji: '🔧', desc: 'Frontline & operational staff' },
  { label: 'Mid Grade', count: 6, emoji: '📈', desc: 'Supervisors & team leads' },
  { label: 'High Grade', count: 6, emoji: '🏆', desc: 'Senior professionals' },
  { label: 'SME', count: 6, emoji: '🏢', desc: 'Business owners & entrepreneurs' },
  { label: 'Management', count: 6, emoji: '🧭', desc: 'Managers & directors' },
  { label: 'Executive', count: 6, emoji: '👑', desc: 'C-suite & board members' },
]

const STEPS = [
  { num: '01', title: 'Choose Your Portal', desc: 'Select the segment that matches your career stage.' },
  { num: '02', title: 'Enrol in a Course', desc: 'Pick free or paid courses — all just $5 each.' },
  { num: '03', title: 'Learn & Progress', desc: 'Watch, engage, and complete at your own pace.' },
  { num: '04', title: 'Earn Your Certificate', desc: 'Download your CPD certificate instantly on completion.' },
]

const PRICING = [
  { name: 'Pay Per Course', price: '$5', period: 'per course', features: ['Lifetime access', 'CPD certificate', 'Course resources', 'Community access'], cta: 'Buy a Course', highlight: false },
  { name: 'Monthly', price: '$29', period: 'per month', features: ['All 42 courses', 'CPD certificates', 'Priority support', 'New courses free', 'AI recommendations'], cta: 'Start Monthly', highlight: true, badge: 'Most Popular' },
  { name: 'Annual', price: '$249', period: 'per year', features: ['Everything in Monthly', '2 months free', 'Team dashboard', 'Custom reporting', 'Dedicated account manager'], cta: 'Go Annual', highlight: false },
]

function StatCard({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useCountUp(value)
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center px-8 py-6 rounded-[2rem] backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <span className="font-extrabold text-5xl" style={{ color: '#c9a84c', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.03em' }}><span ref={ref}>0</span>{suffix}</span>
      <span className="mt-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
    </motion.div>
  )
}

export default function Index() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="relative overflow-hidden" style={{ backgroundColor: '#364033', minHeight: '100vh' }}>
        <Particles particleColors={['#fefefe', '#c9a84c']} particleCount={200} speed={0.1} particleBaseSize={100} moveParticlesOnHover={true} className="absolute inset-0 z-0" />
        <Navbar variant="landing" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-40 pb-24">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center gap-6 max-w-4xl">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(201,168,76,0.85)' }}>TEAM Consulting · We Are Greater Than Me</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-6xl md:text-8xl font-extrabold text-white leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
              Build Skills.{' '}
              <span style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Build Careers.</span>{' '}
              Build Your Future.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-xl font-medium max-w-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>Africa's premier professional learning & development platform — 42 expert-crafted courses across 7 career segments, starting at just $5.</motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.03 }}>
                <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-[3rem] font-bold text-lg text-white transition-all shadow-lg" style={{ backgroundColor: '#02670a' }}>Get Started<ChevronRight size={20} /></Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.03 }}>
                <Link to="/courses" className="inline-flex items-center gap-2 px-10 py-4 rounded-[3rem] font-bold text-lg text-white border-2 border-white/40 hover:border-white/70 transition-all">Explore Courses</Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <div className="relative z-10 pb-16 px-6">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={7} label="Segments" />
            <StatCard value={42} label="Courses" />
            <StatCard value={5} label="Per Course ($)" />
            <StatCard value={15} suffix="+" label="Countries" />
          </motion.div>
        </div>
      </div>

      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-black mb-4" style={{ letterSpacing: '-0.03em' }}>What We Offer</h2>
            <p className="text-lg font-medium text-gray-500 max-w-xl mx-auto">A complete professional development ecosystem built for corporate Africa.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} whileHover={{ scale: 1.03, y: -4 }} className="p-8 rounded-[2rem] bg-white shadow-md hover:shadow-2xl transition-all duration-300" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-14 h-14 rounded-[1rem] flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(2,103,10,0.1)' }}><f.icon size={28} color="#02670a" /></div>
                <h3 className="text-xl font-bold text-black mb-2" style={{ letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: '#364033' }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>Who It's For</h2>
            <p className="text-lg font-medium max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>Seven curated learning paths — one for every stage of your professional journey.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEGMENTS.map((seg, i) => (
              <motion.div key={seg.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }} whileHover={{ scale: 1.03, y: -4 }} className="p-6 rounded-[2rem] backdrop-blur-md cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: 'rgba(2,103,10,0.25)' }}>{seg.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-1">{seg.label}</h3>
                <p className="text-sm font-medium mb-3" style={{ color: '#b1b1b1' }}>{seg.desc}</p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(2,103,10,0.2)', color: '#4ade80' }}>{seg.count} courses</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-black mb-4" style={{ letterSpacing: '-0.03em' }}>How It Works</h2>
            <p className="text-lg font-medium text-gray-500">Four simple steps to unlock your potential.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-white text-lg mb-5" style={{ backgroundColor: '#02670a' }}>{step.num}</div>
                <h3 className="font-bold text-black text-lg mb-2" style={{ letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ backgroundColor: '#fefefe' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-black mb-4" style={{ letterSpacing: '-0.03em' }}>Simple Pricing</h2>
            <p className="text-lg font-medium text-gray-500">Start free. Scale as you grow. Every course just $5 a la carte.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {PRICING.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ scale: plan.highlight ? 1.02 : 1.03, y: -4 }} className="p-10 rounded-[2.5rem] relative" style={{ backgroundColor: plan.highlight ? '#02670a' : 'white', color: plan.highlight ? 'white' : 'black', border: plan.highlight ? 'none' : '1px solid rgba(0,0,0,0.08)', boxShadow: plan.highlight ? '0 24px 64px rgba(2,103,10,0.35)' : '0 4px 24px rgba(0,0,0,0.06)', transform: plan.highlight ? 'scale(1.05)' : undefined }}>
                {'badge' in plan && plan.badge && <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-black" style={{ backgroundColor: '#c9a84c' }}>{plan.badge}</span>}
                <h3 className="font-bold text-xl mb-1" style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1"><span className="text-5xl font-extrabold" style={{ letterSpacing: '-0.03em' }}>{plan.price}</span></div>
                <p className="text-sm font-medium mb-8" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm font-medium">
                      <CheckCircle2 size={16} color={plan.highlight ? '#c9a84c' : '#02670a'} className="shrink-0" />
                      <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151' }}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link to="/login" className="block w-full text-center py-3.5 rounded-[3rem] font-bold text-sm" style={{ backgroundColor: plan.highlight ? '#c9a84c' : '#02670a', color: plan.highlight ? '#000' : 'white' }}>{plan.cta}</Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 text-center" style={{ backgroundColor: '#364033' }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <img src="/TEAMLOGO.webp" alt="TEAM Consulting" className="h-14 w-14 object-contain rounded-xl opacity-90" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h3 className="text-white font-extrabold text-2xl" style={{ letterSpacing: '-0.03em' }}>Team Builder</h3>
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>TEAM Consulting · Harare, Zimbabwe</p>
          <p className="font-semibold italic text-lg" style={{ color: '#c9a84c' }}>"Seek. Serve. Steward. Stand."</p>
          <p className="text-sm font-medium mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} TEAM Consulting. All rights reserved. · We Are Greater Than Me.</p>
        </div>
      </footer>
    </div>
  )
}
