-- ============================================================
-- Team Builder - TEAM Consulting, Harare, Zimbabwe
-- Migration: 002_seed_courses.sql
-- Run SECOND in the Supabase SQL Editor (after 001_schema.sql)
-- Seeds all 42 courses across 7 segments
-- ============================================================

INSERT INTO public.courses (slug, title, description, segment, category, price_usd, access_type, is_published, cpd_credits, sort_order) VALUES

-- YOUTH (6 courses) cpd: 1.0
('career-readiness-101','Career Readiness 101','A foundational course equipping young professionals with the mindset, habits, and practical tools needed to enter and thrive in the modern workplace.','youth','Career Development',0.00,'free',true,1.0,1),
('cv-cover-letter-interview','CV, Cover Letter & Interview','Master the art of crafting a standout CV, writing compelling cover letters, and performing confidently in job interviews.','youth','Career Development',0.00,'free',true,1.0,2),
('servant-leadership-found','Servant Leadership Foundations','Discover the principles of servant leadership — leading with humility, empathy, and purpose to uplift teams and communities.','youth','Leadership',0.00,'free',true,1.0,3),
('financial-literacy-youth','Financial Literacy for Youth','Build the financial knowledge and habits that set you up for lifetime wealth — budgeting, saving, investing, and avoiding debt traps.','youth','Financial Wellness',5.00,'paid',true,1.0,4),
('communication-etiquette','Communication & Workplace Etiquette','Learn professional communication skills, workplace etiquette, and interpersonal strategies that make you stand out in any organisation.','youth','Soft Skills',5.00,'paid',true,1.0,5),
('digital-skills-workplace','Digital Skills for the Workplace','Essential digital literacy covering productivity suites, email professionalism, virtual collaboration tools, and online safety.','youth','Digital Skills',5.00,'paid',true,1.0,6),

-- LOW GRADE (6 courses) cpd: 1.0
('workplace-safety-employee-rights','Workplace Safety & Employee Rights','Understand your rights as an employee, workplace safety protocols, and how to report and resolve workplace hazards and violations.','low_grade','Employee Rights',0.00,'free',true,1.0,7),
('personal-effectiveness-time','Personal Effectiveness & Time Management','Unlock your productivity potential with proven time management frameworks, prioritisation techniques, and personal effectiveness habits.','low_grade','Productivity',5.00,'paid',true,1.0,8),
('emotional-intelligence-level-1','Emotional Intelligence Level 1','An introduction to emotional intelligence — understanding and managing your emotions to improve relationships and workplace performance.','low_grade','Emotional Intelligence',5.00,'paid',true,1.0,9),
('teamwork-collaboration-basics','Teamwork & Collaboration Basics','Learn the foundations of effective teamwork, collaborative problem-solving, and building trust within diverse work teams.','low_grade','Teamwork',5.00,'paid',true,1.0,10),
('communication-skills-frontline','Communication Skills for Frontline Staff','Practical communication strategies for frontline employees — active listening, clear messaging, and professional customer interactions.','low_grade','Communication',5.00,'paid',true,1.0,11),
('financial-wellness-employees','Financial Wellness for Employees','Practical financial planning for working professionals — managing salary, avoiding debt, and building an emergency fund on any income.','low_grade','Financial Wellness',5.00,'paid',true,1.0,12),

-- MID GRADE (6 courses) cpd: 1.5
('supervisory-skills-fundamentals','Supervisory Skills Fundamentals','Transition confidently from individual contributor to supervisor — delegation, performance conversations, and team motivation.','mid_grade','Leadership',5.00,'paid',true,1.5,13),
('conflict-resolution-workplace','Conflict Resolution in the Workplace','Develop the skills to identify, address, and resolve workplace conflicts constructively, turning tension into productive outcomes.','mid_grade','Soft Skills',5.00,'paid',true,1.5,14),
('emotional-intelligence-level-2','Emotional Intelligence Level 2','Advanced emotional intelligence skills — empathy, social awareness, and using emotional data to lead more effectively.','mid_grade','Emotional Intelligence',5.00,'paid',true,1.5,15),
('employee-rights-labour-law','Employee Rights & Labour Law Basics','A practical overview of Zimbabwe labour law, employment contracts, dispute resolution, and your rights in the workplace.','mid_grade','Employee Rights',0.00,'free',true,1.5,16),
('performance-productivity','Performance & Productivity','Set meaningful goals, track performance with OKRs, and create personal systems that drive consistent high output.','mid_grade','Productivity',5.00,'paid',true,1.5,17),
('personal-branding-career-growth','Personal Branding & Career Growth','Build a powerful personal brand, leverage LinkedIn effectively, and create a career growth strategy that opens doors.','mid_grade','Career Development',5.00,'paid',true,1.5,18),

-- HIGH GRADE (6 courses) cpd: 1.5
('advanced-leadership-principles','Advanced Leadership Principles','Deep-dive into transformational leadership models, vision-setting, and the behaviours that distinguish great leaders from good ones.','high_grade','Leadership',5.00,'paid',true,1.5,19),
('emotional-health-wellness-work','Emotional Health & Wellness at Work','Understand the intersection of mental health and professional performance, and build resilience strategies for high-pressure environments.','high_grade','Wellness',5.00,'paid',true,1.5,20),
('mentoring-coaching-skills','Mentoring & Coaching Skills','Develop the skills to mentor junior staff and coach peers using proven frameworks — GROW model, active listening, and feedback delivery.','high_grade','Leadership',5.00,'paid',true,1.5,21),
('strategic-thinking-senior-staff','Strategic Thinking for Senior Staff','Elevate your thinking from operational to strategic — scenario planning, systems thinking, and contributing to organisational strategy.','high_grade','Strategy',5.00,'paid',true,1.5,22),
('change-management-essentials','Change Management Essentials','Navigate organisational change with confidence using Kotter, ADKAR, and Prosci frameworks to lead people through transitions.','high_grade','Change Management',5.00,'paid',true,1.5,23),
('employee-rights-senior','Employee Rights — Senior Perspectives','An advanced exploration of employment law, executive employment contracts, and governance responsibilities at senior levels.','high_grade','Employee Rights',0.00,'free',true,1.5,24),

-- SME (6 courses) cpd: 2.0
('starting-running-business','Starting & Running a Business','The complete blueprint for launching and sustaining a business in Zimbabwe — business registration, funding, operations, and growth.','sme','Entrepreneurship',5.00,'paid',true,2.0,25),
('business-process-reengineering','Business Process Reengineering','Redesign your business processes from the ground up to eliminate waste, improve efficiency, and deliver superior customer value.','sme','Operations',5.00,'paid',true,2.0,26),
('financial-governance-smes','Financial Governance for SMEs','Build robust financial controls, reporting systems, and governance structures that give your SME the credibility to grow and attract investment.','sme','Finance',5.00,'paid',true,2.0,27),
('people-management-small-business','People Management for Small Business','Hire right, retain your best people, and build a high-performance culture even with a lean team and limited HR resources.','sme','HR & People',5.00,'paid',true,2.0,28),
('marketing-digital-presence','Marketing & Digital Presence','Build a compelling brand identity and digital marketing strategy using social media, SEO, and content that converts for African markets.','sme','Marketing',5.00,'paid',true,2.0,29),
('sme-governance-compliance','SME Governance & Compliance','Navigate Zimbabwe''s regulatory environment — tax compliance, corporate governance, licensing, and the legal obligations every SME owner must know.','sme','Governance',5.00,'paid',true,2.0,30),

-- MANAGEMENT (6 courses) cpd: 3.0
('strategy-development-facilitation','Strategy Development & Facilitation','Design and facilitate powerful strategy sessions — from environmental scanning and SWOT to strategy maps and balanced scorecards.','management','Strategy',5.00,'paid',true,3.0,31),
('organisational-development','Organisational Development','Drive sustainable organisational change through culture design, structural alignment, and OD interventions that build lasting capability.','management','OD & Culture',5.00,'paid',true,3.0,32),
('performance-management-systems','Performance Management Systems','Design and implement end-to-end performance management systems — KPIs, review cycles, calibration, and linking performance to reward.','management','HR & People',5.00,'paid',true,3.0,33),
('emotional-intelligence-leaders','Emotional Intelligence for Leaders','Harness emotional intelligence to inspire trust, navigate difficult conversations, and create psychologically safe team environments.','management','Emotional Intelligence',5.00,'paid',true,3.0,34),
('change-management-culture','Change Management & Culture','Lead large-scale cultural transformation — diagnose culture, design change programmes, and embed new behaviours organisation-wide.','management','Change Management',5.00,'paid',true,3.0,35),
('coaching-developing-your-team','Coaching & Developing Your Team','Build a coaching culture that unlocks your team''s full potential — coaching conversations, development planning, and succession pipelines.','management','Leadership',5.00,'paid',true,3.0,36),

-- EXECUTIVE (6 courses) cpd: 4.0
('board-governance-advisory','Board Governance & Advisory','Understand fiduciary duties, board composition, governance frameworks, and how to add strategic value in boardroom and advisory roles.','executive','Governance',5.00,'paid',true,4.0,37),
('executive-strategy-business-design','Executive Strategy & Business Design','Design business models for the future — blue ocean strategy, platform economics, and executive decision-making in complex environments.','executive','Strategy',5.00,'paid',true,4.0,38),
('executive-coaching-fundamentals','Executive Coaching Fundamentals','Develop executive presence and coaching mastery — working with C-suite clients, navigating power dynamics, and measuring coaching ROI.','executive','Coaching',5.00,'paid',true,4.0,39),
('corporate-wellness-emotional-health','Corporate Wellness & Emotional Health','Design enterprise-wide wellness programmes that reduce burnout, improve retention, and build emotionally healthy organisational cultures.','executive','Wellness',5.00,'paid',true,4.0,40),
('corporate-ethics-employee-rights','Corporate Ethics & Employee Rights','Navigate complex ethical dilemmas, whistleblowing frameworks, and executive responsibility for employee rights at enterprise scale.','executive','Ethics & Governance',5.00,'paid',true,4.0,41),
('rpa-technology-transformation','RPA & Technology-Enabled Transformation','Lead digital transformation using Robotic Process Automation, AI integration, and technology strategy to future-proof your organisation.','executive','Digital Transformation',5.00,'paid',true,4.0,42)
ON CONFLICT (slug) DO NOTHING;
