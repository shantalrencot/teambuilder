-- ============================================================
-- Team Builder v2.1 - Assessment Layer
-- Migration: 003_quiz_schema.sql
-- Run THIRD in Supabase SQL Editor (after 002_seed_courses.sql)
-- ============================================================

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quiz_score   integer DEFAULT 0;

CREATE TABLE public.quiz_questions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id            uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question_text        text        NOT NULL,
  options              jsonb       NOT NULL,
  correct_option_index integer     NOT NULL CHECK (correct_option_index >= 0),
  points               integer     DEFAULT 10 CHECK (points > 0),
  sort_order           integer     DEFAULT 0,
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX idx_quiz_questions_course ON public.quiz_questions(course_id);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrolled read questions" ON public.quiz_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = quiz_questions.course_id AND e.user_id = auth.uid()));

CREATE POLICY "admin write questions" ON public.quiz_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.quiz_attempts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  course_id     uuid        NOT NULL REFERENCES public.courses(id)     ON DELETE CASCADE,
  enrollment_id uuid        REFERENCES public.enrollments(id)          ON DELETE SET NULL,
  score         integer     NOT NULL DEFAULT 0,
  total_points  integer     NOT NULL DEFAULT 0,
  percentage    integer     NOT NULL DEFAULT 0 CHECK (percentage BETWEEN 0 AND 100),
  passed        boolean     DEFAULT false,
  answers       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  attempted_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user   ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_course ON public.quiz_attempts(course_id);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read attempts"   ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff read all attempts" ON public.quiz_attempts FOR SELECT USING (public.is_staff(auth.uid()));

-- SEED: 5 questions per segment (7 courses x 5 = 35 rows)

-- YOUTH: Career Readiness 101
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'Which of the following best describes a "growth mindset"?','["Believing abilities are fixed at birth","Believing skills can be developed through effort and learning","Avoiding challenges to protect self-esteem","Focusing only on natural talent"]',1),
  (2,'What is the PRIMARY purpose of a professional cover letter?','["To repeat your CV word for word","To introduce yourself and explain why you are the right fit for the role","To list your hobbies and interests","To state your expected salary"]',1),
  (3,'In a workplace setting, "professionalism" MOST importantly refers to:','["Wearing expensive clothing","Arriving early every day","Conducting yourself with integrity, respect, and accountability","Only speaking when spoken to"]',2),
  (4,'Which behaviour is MOST likely to impress a new employer in your first 30 days?','["Immediately suggesting major changes to processes","Listening actively, asking good questions, and delivering on small commitments","Staying quiet and never asking for help","Working longer hours than anyone else"]',1),
  (5,'Emotional intelligence in the workplace means:','["Never showing any emotion at work","Being aware of and managing your emotions while empathising with others","Always agreeing with your manager","Suppressing feelings to appear professional"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'career-readiness-101';

-- LOW GRADE: Workplace Safety & Employee Rights
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'Under Zimbabwe labour law, what is the maximum standard working week in hours?','["48 hours","50 hours","60 hours","40 hours"]',0),
  (2,'If you observe a safety hazard at work, your FIRST action should be:','["Ignore it and continue working","Report it to your supervisor or safety officer immediately","Wait to see if someone else reports it","Fix it yourself without telling anyone"]',1),
  (3,'Which of the following is a LEGAL right of every employee in Zimbabwe?','["The right to choose your own working hours","The right to a safe and healthy working environment","The right to refuse any task you dislike","The right to unlimited paid leave"]',1),
  (4,'Personal Protective Equipment (PPE) is:','["Optional gear employees may use if they choose","Mandatory equipment provided by the employer to protect workers from workplace hazards","Only required in factories","The responsibility of the employee to purchase"]',1),
  (5,'A Labour Relations Officer deals with:','["Hiring and firing of staff exclusively","Workplace disputes, grievances, and ensuring compliance with labour law","Setting employee salaries","Conducting performance reviews"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'workplace-safety-employee-rights';

-- MID GRADE: Supervisory Skills Fundamentals
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'Effective delegation means:','["Assigning all tasks you dislike to subordinates","Entrusting tasks to the right person with clear expectations and support","Micromanaging every step of the process","Only delegating to the most senior team member"]',1),
  (2,'The GROW coaching model stands for:','["Goals, Resources, Objectives, Work","Goal, Reality, Options, Will/Way Forward","Growth, Resilience, Outcomes, Wins","Guide, Review, Observe, Write"]',1),
  (3,'When giving performance feedback, best practice is to:','["Only give feedback during the annual review","Wait for problems to escalate before addressing them","Give specific, timely, and balanced feedback focused on behaviour not personality","Praise publicly and criticise in group settings to set an example"]',2),
  (4,'A supervisor''s PRIMARY responsibility is to:','["Complete all the work themselves to maintain quality","Enable their team to achieve goals through support, direction, and accountability","Protect themselves from blame when things go wrong","Report all team problems directly to senior management"]',1),
  (5,'Conflict in a team MOST constructively leads to:','["Immediate dismissal of the conflicting parties","Better solutions and stronger relationships when managed well","Permanent damage to team morale","A need for the supervisor to take sides"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'supervisory-skills-fundamentals';

-- HIGH GRADE: Advanced Leadership Principles
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'Transformational leadership is BEST described as:','["Managing by exception — only intervening when problems arise","Inspiring followers to exceed expectations through vision, motivation, and personal development","Transacting rewards for compliance with instructions","Maintaining strict hierarchical control to ensure discipline"]',1),
  (2,'Psychological safety in a team refers to:','["Ensuring no employee ever experiences stress","A belief that one can speak up, take risks, and make mistakes without fear of punishment","Physical safety protocols in the workplace","Keeping team members emotionally distant to maintain professionalism"]',1),
  (3,'Which best describes "strategic thinking" at a senior level?','["Focusing on daily operational tasks with precision","Looking beyond the immediate to understand patterns, anticipate change, and shape long-term direction","Delegating all strategic decisions to executive leadership","Avoiding risk at all costs"]',1),
  (4,'A leader''s MOST important role during organisational change is:','["Minimising communication to avoid confusion","Communicating clearly, creating safety, and modelling the desired behaviours","Enforcing change through strict performance management","Leaving teams to self-manage through the transition"]',1),
  (5,'The Servant Leadership model prioritises:','["Leader''s personal achievement above all","Serving the needs of team members, enabling their growth and performance","Authority and positional power","Strict hierarchical decision-making"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'advanced-leadership-principles';

-- SME: Starting & Running a Business
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'A business plan is PRIMARILY used to:','["Satisfy a legal registration requirement","Clarify strategic direction, set goals, and attract funding","List the names of all company directors","Document daily operational procedures"]',1),
  (2,'Cash flow management is critical because:','["A profitable business can still fail if it runs out of cash","Profit and cash flow are always equal","Banks only lend to businesses with positive cash flow","Investors only care about profit margins"]',0),
  (3,'In Zimbabwe, which body is responsible for company registration?','["Zimbabwe Revenue Authority (ZIMRA)","Companies and Other Business Entities Act (COBE) administered by ZIDA","Reserve Bank of Zimbabwe","Ministry of Finance"]',1),
  (4,'The BEST definition of a "value proposition" is:','["The price you charge for your product","A clear statement of the tangible benefit your business delivers to customers","Your company''s mission statement","The total value of your business assets"]',1),
  (5,'Working capital is:','["Total assets minus total liabilities","Current assets minus current liabilities — the funds available for day-to-day operations","The initial investment required to start a business","Profit retained in the business after dividends"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'starting-running-business';

-- MANAGEMENT: Strategy Development & Facilitation
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'A Balanced Scorecard measures organisational performance across:','["Financial results only","Financial, Customer, Internal Process, and Learning & Growth perspectives","Revenue, cost, quality, and speed","Short-term, medium-term, and long-term financial targets"]',1),
  (2,'PESTLE analysis examines:','["Personal, Emotional, Social, Technical, Legal, Economic factors","Political, Economic, Social, Technological, Legal, and Environmental macro-factors","Process, Efficiency, Strategy, Talent, Leadership, Execution","Product, Equipment, Sales, Team, Location, Enterprise factors"]',1),
  (3,'The BEST facilitator behaviour during a strategy session is:','["Sharing your own strategic opinions to guide the group","Remaining neutral, managing process, drawing out all voices, and keeping the group focused","Agreeing with the most senior person in the room","Preparing and presenting the strategy before the session begins"]',1),
  (4,'OKRs (Objectives and Key Results) were pioneered at:','["McKinsey & Company","Intel and popularised by Google","Harvard Business School","The World Economic Forum"]',1),
  (5,'Scenario planning is used to:','["Predict the single most likely future and plan for it","Explore multiple plausible futures so the organisation can prepare resilient strategies","Document past events that affected the business","Assign ownership of strategic initiatives to managers"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'strategy-development-facilitation';

-- EXECUTIVE: Board Governance & Advisory
INSERT INTO public.quiz_questions (course_id, question_text, options, correct_option_index, points, sort_order)
SELECT c.id, q.question_text, q.options::jsonb, q.correct_option_index, 10, q.sort_order
FROM public.courses c
CROSS JOIN (VALUES
  (1,'A board''s PRIMARY fiduciary duty is to:','["Maximise short-term shareholder returns at all costs","Act in the best long-term interests of the organisation and its stakeholders","Manage the day-to-day operations of the business","Represent only the interests of the majority shareholder"]',1),
  (2,'The "two-tier" board model separates:','["Executive and non-executive directors on the same board","The supervisory board (oversight) from the management board (operations)","Independent directors from employee representatives","The audit committee from the remuneration committee"]',1),
  (3,'King IV''s core governance principle is:','["Shareholder primacy — returns above all","Corporate citizenship — ethical, effective, responsible leadership for all stakeholders","Compliance-first governance","Separation of duties between board and management"]',1),
  (4,'The audit committee''s MAIN responsibility is:','["Approving the company''s marketing strategy","Overseeing financial reporting integrity, internal controls, and external audit","Setting executive remuneration packages","Approving major capital expenditure proposals"]',1),
  (5,'Director independence is important because:','["Independent directors earn higher fees","It ensures objective oversight and reduces conflicts of interest in board decisions","Independent directors have more relevant industry experience","It is required by all African stock exchanges without exception"]',1)
) AS q(sort_order, question_text, options, correct_option_index)
WHERE c.slug = 'board-governance-advisory';
