// =============================================================================
// OnboardingPage.jsx
// Flow: Terms → College → Program → Communities → Welcome
// =============================================================================
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Check,
  X,
  AlertTriangle,
  ScrollText,
  Shield,
  Users,
  BookOpen,
  ArrowRight,
  PartyPopper,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import AppContext from "../../AppContext";
import "./OnboardingPage.css";
import { supabase } from "../../supabase";

// ── Community emoji map ───────────────────────────────────────────────────────
const COMMUNITY_EMOJI = {
  "Programming & Dev": "💻",
  "Design & Animation": "🎨",
  "Gaming & Esports": "🎮",
  "Media & Content Creation": "📰",
  "Finance & Investing": "📈",
  "Startups & Side Hustles": "🚀",
  "Politics & Current Events": "🌍",
  "Science & Research": "🔬",
  "Music & Performing Arts": "🎵",
  "Sports & Fitness": "🏃",
  "Mental Health & Wellness": "🧠",
  "Travel & Culture": "✈️",
  "Books & Learning": "📖",
  "Food & Lifestyle": "🍳",
  "Engineering & Making": "⚙️",
};

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = [
    { label: "Terms", icon: ScrollText },
    { label: "College", icon: GraduationCap },
    { label: "Program", icon: BookOpen },
    { label: "Communities", icon: Users },
    { label: "Done", icon: CheckCircle2 },
  ];

  return (
    <div className="ob-stepbar">
      {steps.map((step, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        const StepIcon = step.icon;
        return (
          <React.Fragment key={step.label}>
            <div
              className={`ob-step ${active ? "ob-step--active" : ""} ${done ? "ob-step--done" : ""}`}
            >
              <div className="ob-step-circle">
                {done ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <StepIcon size={14} />
                )}
              </div>
              <span className="ob-step-label">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`ob-step-line ${done ? "ob-step-line--done" : ""}`}
              >
                <ChevronRight size={12} className="ob-step-chevron" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Terms & Conditions ────────────────────────────────────────────────
function StepTerms({ onAgree, onDisagree, loading }) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);

  function handleScroll(e) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 48)
      setScrolledToEnd(true);
  }

  const TNC_SECTIONS = [
    {
      icon: <FileText size={14} />,
      title: "1. Acceptance of Terms",
      body: "By accessing and using MindSpace, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use this platform. Your continued use constitutes acceptance of any updates.",
    },
    {
      icon: <Shield size={14} />,
      title: "2. Eligibility",
      body: "MindSpace is exclusively available to currently enrolled students, faculty, and staff of New Era University. Access requires a valid institutional email (@neu.edu.ph). Your account will be deactivated upon separation from the university.",
    },
    {
      icon: <Users size={14} />,
      title: "3. Community Standards",
      body: "You agree to engage respectfully and constructively. The following are strictly prohibited:",
      list: [
        "Harassment, bullying, or threatening behavior",
        "Sharing false, misleading, or harmful information",
        "Content promoting self-harm, suicide, or dangerous behaviors",
        "Discrimination based on race, gender, religion, or disability",
        "Spam, unauthorized advertising, or repetitive content",
        "Impersonating other users, faculty, or university officials",
      ],
    },
    {
      icon: <Shield size={14} />,
      title: "4. Privacy & Confidentiality",
      body: "Personal information shared on MindSpace is governed by the NEU Privacy Policy. Anonymous posts will not display your identity to other users; however, anonymized data may be accessible to university administrators for safety purposes.",
    },
    {
      icon: <AlertTriangle size={14} />,
      title: "5. Mental Health Disclaimer",
      body: "MindSpace is a peer support platform — NOT a substitute for professional mental health care. If you or someone you know is in crisis, contact the NEU Guidance and Counseling Office or call the National Crisis Hotline at 1553.",
    },
    {
      icon: <BookOpen size={14} />,
      title: "6. Content Ownership",
      body: "You retain ownership of content you post. By posting, you grant New Era University a non-exclusive license to display your content within the platform. The university may remove content that violates these terms without prior notice.",
    },
    {
      icon: <FileText size={14} />,
      title: "7. Reporting & Moderation",
      body: "Users are encouraged to report violating content using the in-app reporting feature. Reports are anonymous and reviewed within 48 hours. Repeated violations may result in suspension or permanent removal.",
    },
    {
      icon: <AlertTriangle size={14} />,
      title: "8. Account Termination",
      body: "The university reserves the right to suspend or terminate any account that violates these terms or poses a risk to the community. Users may also delete their account at any time through profile settings.",
    },
  ];

  return (
    <div className="ob-section">
      <div className="ob-section-header">
        <div className="ob-section-icon ob-section-icon--blue">
          <ScrollText size={20} />
        </div>
        <div>
          <h2 className="ob-title">Terms &amp; Conditions</h2>
          <p className="ob-subtitle">Read carefully before continuing</p>
        </div>
      </div>

      <div className="ob-tnc-scroll" onScroll={handleScroll}>
        <div className="ob-tnc-top">
          <img
            src="/NEULogo1.png"
            alt="New Era University"
            className="ob-tnc-logo"
          />
          <div>
            <h3 className="ob-tnc-heading">
              MindSpace — Student Wellness Platform
            </h3>
            <p className="ob-tnc-updated">
              Last updated: January 2025 · New Era University
            </p>
          </div>
        </div>
        {TNC_SECTIONS.map((s, i) => (
          <div className="ob-tnc-section" key={i}>
            <div className="ob-tnc-section-title">
              <span className="ob-tnc-section-icon">{s.icon}</span>
              <h4>{s.title}</h4>
            </div>
            <p>{s.body}</p>
            {s.list && (
              <ul>
                {s.list.map((item, j) => (
                  <li key={j}>
                    <Check size={11} className="ob-tnc-li-check" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div className="ob-tnc-contact">
          <p>
            Questions? Contact the NEU Guidance and Counseling Office or email{" "}
            <strong>mindspace@neu.edu.ph</strong>
          </p>
        </div>
      </div>

      {!scrolledToEnd && (
        <div className="ob-scroll-hint">
          <ChevronDown size={14} />
          Scroll down to read all terms
        </div>
      )}

      <label
        className={`ob-checkbox-row ${!scrolledToEnd ? "ob-checkbox-row--locked" : ""}`}
      >
        <div
          className={`ob-custom-checkbox ${checked ? "ob-custom-checkbox--checked" : ""}`}
        >
          {checked && <Check size={11} strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          className="ob-checkbox-hidden"
          checked={checked}
          disabled={!scrolledToEnd}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span className="ob-checkbox-label">
          I have read and understood the Terms &amp; Conditions
        </span>
      </label>

      <div className="ob-btn-row">
        <button
          className="ob-btn-danger"
          onClick={onDisagree}
          disabled={loading}
        >
          <X size={15} />
          Disagree
        </button>
        <button
          className="ob-btn-primary"
          onClick={onAgree}
          disabled={!checked || !scrolledToEnd || loading}
        >
          {loading ? (
            "Please wait…"
          ) : (
            <>
              Agree &amp; Continue <ChevronRight size={15} />
            </>
          )}
        </button>
      </div>
      <p className="ob-hint">
        <AlertTriangle size={11} />
        Disagreeing will return you to the login page.
      </p>
    </div>
  );
}

// ── Step 2: College Selection ─────────────────────────────────────────────────
function StepCollege({ onBack, onSelect }) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("colleges")
        .select("id, name")
        .order("name");
      if (data) setColleges(data);
      setLoading(false);
    }
    fetch();
  }, []);

  // Shorten long college names for cards
  function shortName(name) {
    return name.replace("College of ", "").replace("School of ", "");
  }

  return (
    <div className="ob-section">
      <div className="ob-section-header">
        <div className="ob-section-icon ob-section-icon--green">
          <GraduationCap size={20} />
        </div>
        <div>
          <h2 className="ob-title">Which college are you in?</h2>
          <p className="ob-subtitle">Select your college to continue</p>
        </div>
      </div>

      {loading ? (
        <p className="ob-loading">Loading colleges…</p>
      ) : (
        <div className="ob-courses-grid">
          {colleges.map((c) => (
            <button
              key={c.id}
              className="ob-course-card"
              onClick={() => onSelect(c)}
            >
              <div className="ob-course-name">
                College of 
              </div>
              <div className="ob-course-code">{shortName(c.name)}</div>
              
            </button>
          ))}
        </div>
      )}

      <div className="ob-btn-row">
        <button className="ob-btn-ghost" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Program Selection ─────────────────────────────────────────────────
function StepProgram({ college, onBack, onSelect }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("programs")
        .select("id, name")
        .eq("college_id", college.id)
        .order("name");
      if (data) setPrograms(data);
      setLoading(false);
    }
    fetch();
  }, [college.id]);

  return (
    <div className="ob-section">
      <div className="ob-section-header">
        <div className="ob-section-icon ob-section-icon--green">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="ob-title">What's your program?</h2>
          <p className="ob-subtitle">{college.name}</p>
        </div>
      </div>

      {loading ? (
        <p className="ob-loading">Loading programs…</p>
      ) : (
        <div className="ob-courses-grid">
          {programs.map((p) => (
            <button
              key={p.id}
              className="ob-course-card"
              onClick={() => onSelect(p)}
            >
              <div className="ob-course-name">{p.name}</div>
            </button>
          ))}
        </div>
      )}

      <div className="ob-btn-row">
        <button className="ob-btn-ghost" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Community Selection ───────────────────────────────────────────────
function StepCommunities({ program, onBack, onSubmit, loading, error }) {
  const [allCommunities, setAllCommunities] = useState([]);
  const [suggestedIds, setSuggestedIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [{ data: communities }, { data: mappings }] = await Promise.all([
        supabase.from("communities").select("id, name").order("name"),
        supabase
          .from("program_community_map")
          .select("community_id")
          .eq("program_id", program.id),
      ]);

      const suggested = (mappings ?? []).map((m) => m.community_id);
      setAllCommunities(communities ?? []);
      setSuggestedIds(suggested);
      setSelectedIds(suggested); // pre-select suggested
      setFetching(false);
    }
    fetch();
  }, [program.id]);

  function toggle(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const suggested = allCommunities.filter((c) => suggestedIds.includes(c.id));
  const others = allCommunities.filter((c) => !suggestedIds.includes(c.id));

  return (
    <div className="ob-section">
      <div className="ob-section-header">
        <div className="ob-section-icon ob-section-icon--green">
          <Users size={20} />
        </div>
        <div>
          <h2 className="ob-title">Your communities</h2>
          <p className="ob-subtitle">
            Suggested for {program.name} — add more if you like
          </p>
        </div>
      </div>

      {fetching ? (
        <p className="ob-loading">Loading communities…</p>
      ) : (
        <>
          {suggested.length > 0 && (
            <>
              <div className="ob-community-section-label">
                <Sparkles size={13} /> Suggested for your program
              </div>
              <div className="ob-courses-grid">
                {suggested.map((c) => {
                  const isSel = selectedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      className={`ob-course-card ob-course-card--community ${isSel ? "ob-course-card--selected" : ""}`}
                      onClick={() => toggle(c.id)}
                    >
                      <div className="ob-community-emoji">
                        {COMMUNITY_EMOJI[c.name] ?? "🌐"}
                      </div>
                      <div className="ob-course-name">{c.name}</div>
                      <div className="ob-course-code ob-suggested-badge">
                        Suggested
                      </div>
                      {isSel && (
                        <div className="ob-course-check">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {others.length > 0 && (
            <>
              <div
                className="ob-community-section-label"
                style={{ marginTop: 16 }}
              >
                <Users size={13} /> All communities
              </div>
              <div className="ob-courses-grid">
                {others.map((c) => {
                  const isSel = selectedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      className={`ob-course-card ob-course-card--community ${isSel ? "ob-course-card--selected" : ""}`}
                      onClick={() => toggle(c.id)}
                    >
                      <div className="ob-community-emoji">
                        {COMMUNITY_EMOJI[c.name] ?? "🌐"}
                      </div>
                      <div className="ob-course-name">{c.name}</div>
                      {isSel && (
                        <div className="ob-course-check">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selectedIds.length > 0 && (
            <p className="ob-selected-summary">
              <CheckCircle2 size={14} className="ob-selected-icon" />
              <span className="ob-selected-count">{selectedIds.length}</span>
              {selectedIds.length === 1
                ? " community selected"
                : " communities selected"}
            </p>
          )}
        </>
      )}

      {error && (
        <div className="ob-error-box">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div className="ob-btn-row">
        <button className="ob-btn-ghost" onClick={onBack} disabled={loading}>
          <ChevronLeft size={15} /> Back
        </button>
        <button
          className="ob-btn-primary"
          onClick={() => onSubmit(selectedIds)}
          disabled={selectedIds.length === 0 || loading || fetching}
        >
          {loading ? (
            "Setting up…"
          ) : (
            <>
              Finish setup <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Welcome ───────────────────────────────────────────────────────────
function StepWelcome({ displayName, courseCount, onContinue }) {
  return (
    <div className="ob-welcome">
      <div className="ob-welcome-visual">
        <img
          src="/NEULogo1.png"
          alt="New Era University"
          className="ob-welcome-logo"
        />
        <div className="ob-welcome-ring ob-welcome-ring--1" />
        <div className="ob-welcome-ring ob-welcome-ring--2" />
      </div>
      <div className="ob-welcome-badge">
        <PartyPopper size={18} />
        Welcome to MindSpace
      </div>
      <h2 className="ob-welcome-title">You're all set, {displayName}!</h2>
      <p className="ob-welcome-body">
        You've been added to <strong>{courseCount}</strong>{" "}
        {courseCount === 1 ? "community" : "communities"}. Start exploring,
        sharing, and connecting with your peers.
      </p>
      <div className="ob-welcome-stats">
        <div className="ob-welcome-stat">
          <Users size={18} className="ob-welcome-stat-icon" />
          <span className="ob-welcome-stat-value">{courseCount}</span>
          <span className="ob-welcome-stat-label">
            {courseCount === 1 ? "Community" : "Communities"}
          </span>
        </div>
        <div className="ob-welcome-stat-divider" />
        <div className="ob-welcome-stat">
          <GraduationCap size={18} className="ob-welcome-stat-icon" />
          <span className="ob-welcome-stat-value">NEU</span>
          <span className="ob-welcome-stat-label">Institution</span>
        </div>
        <div className="ob-welcome-stat-divider" />
        <div className="ob-welcome-stat">
          <Shield size={18} className="ob-welcome-stat-icon" />
          <span className="ob-welcome-stat-value">✓</span>
          <span className="ob-welcome-stat-label">Verified</span>
        </div>
      </div>
      <button
        className="ob-btn-primary ob-btn-primary--wide"
        onClick={onContinue}
      >
        Go to MindSpace <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(AppContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCollege, setCollege] = useState(null);
  const [selectedProgram, setProgram] = useState(null);
  const [joinedCount, setJoinedCount] = useState(0);

  const displayName = currentUser?.display_name?.split(" ")[0] ?? "there";

  async function handleSubmit(selectedCommunityIds) {
    if (!currentUser) return;
    setError("");
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ privacy_acknowledged: true, program_id: selectedProgram.id })
        .eq("id", currentUser.id);
      if (profileError) throw profileError;

      if (selectedCommunityIds.length > 0) {
        const memberships = selectedCommunityIds.map((id) => ({
          user_id: currentUser.id,
          community_id: id,
        }));
        const { error: joinError } = await supabase
          .from("community_members")
          .upsert(memberships, {
            onConflict: "community_id,user_id",
            ignoreDuplicates: true,
          });
        if (joinError) throw joinError;
        setJoinedCount(selectedCommunityIds.length);
      }

      setCurrentUser((prev) => ({
        ...prev,
        privacy_acknowledged: true,
        program: {
          name: selectedProgram.name,
          college: { name: selectedCollege.name },
        },
      }));
      setStep(5);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-page">
      <div className="ob-brand">
        <img
          src="/NEULogo1.png"
          alt="New Era University logo"
          className="ob-brand-logo"
        />
        <div className="ob-brand-text">
          <span className="ob-brand-name">MindSpace</span>
          <span className="ob-brand-university">New Era University</span>
        </div>
      </div>

      <div className="ob-card">
        {step < 5 && <StepBar current={step} />}

        {step === 1 && (
          <StepTerms
            onAgree={() => setStep(2)}
            onDisagree={() => navigate("/login", { replace: true })}
            loading={loading}
          />
        )}

        {step === 2 && (
          <StepCollege
            onBack={() => setStep(1)}
            onSelect={(college) => {
              setCollege(college);
              setStep(3);
            }}
          />
        )}

        {step === 3 && selectedCollege && (
          <StepProgram
            college={selectedCollege}
            onBack={() => setStep(2)}
            onSelect={(program) => {
              setProgram(program);
              setStep(4);
            }}
          />
        )}

        {step === 4 && selectedProgram && (
          <StepCommunities
            program={selectedProgram}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        )}

        {step === 5 && (
          <StepWelcome
            displayName={displayName}
            courseCount={joinedCount}
            onContinue={() => navigate("/home", { replace: true })}
          />
        )}
      </div>
    </div>
  );
}
