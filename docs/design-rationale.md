

# Design Rationale
## Student Mental Health and Wellness Tracker
### New Era University — Philippines

---

## 1. Color Palette and Typography Choices

### Color Palette

The color palette was directly inspired by the **New Era University logo**, 
extracting its core colors and adapting them into a softer, more accessible 
tone suitable for a mental health and wellness platform.

| Role | Color | Hex Code |
|---|---|---|
| Primary | Soft Green | `#2E7D32` |
| Accent | Warm Gold | `#F5C400` |
| Danger / Alert | Muted Red | `#C62828` |
| Background | Warm White | `#FAFAFA` |
| Surface / Cards | Light Gray | `#F2F2F2` |
| Body Text | Off Black | `#1A1A1A` |
| Secondary Text | Medium Gray | `#616161` |

**Rationale:** The green and gold tones were drawn directly from the NEU 
logo's outer ring and sun motif, creating an immediate visual connection 
to the university identity. Green was chosen as the primary color because 
it is widely associated with growth, calm, and emotional balance — qualities 
that are especially important for a platform centered on student mental 
health. Warm gold serves as an accent to convey warmth and positivity 
without overwhelming the interface. Muted red is used sparingly only for 
alerts, delete actions, and dislike buttons — reflecting its limited and 
purposeful use in the logo itself. Warm white and light gray backgrounds 
minimize visual fatigue during extended use, while off black ensures strong 
text readability without the harshness of pure black.

---

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Headings | Poppins | 24px – 32px | 600 (Semi-bold) |
| Subheadings | Poppins | 18px – 20px | 500 (Medium) |
| Body Text | Inter | 14px – 16px | 400 (Regular) |
| Captions / Labels | Inter | 12px | 400 (Regular) |

**Rationale:** Poppins was chosen for headings because of its rounded and 
friendly letterforms that convey approachability and warmth — important 
qualities for a mental health platform where students need to feel 
welcomed and safe. Inter was selected for body text due to its high 
legibility at small sizes and its clean, neutral appearance that keeps 
the focus on the content rather than the typography itself. Together, 
both fonts establish a clear visual hierarchy that is easy to scan, 
read, and navigate across all screen sizes.

---

## 2. Navigation Structure

The navigation was designed to be simple, consistent, and immediately 
accessible across all screens — reducing cognitive load for students 
who may already be experiencing stress or emotional difficulty.

### Navigation Layout
```
┌─────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                     │
│  [ NEU Logo ]        [ Search ]        [ Profile Icon ] │
├────────────────┬────────────────────────────────────────┤
│  Left Panel    │  Main Content Feed                     │
│                │                                        │
│  Recommended   │   [ Post Card ]                        │
│  Discussions   │   [ Post Card ]                        │
│                │                                        │
│  Recent        │   [ Discussion Thread ]                │
│  Visits        │                                        │
│                │   [ Coping Strategy Post ]             │
│  Shared        │                                        │
│  Interests     │                                        │
├────────────────┴────────────────────────────────────────┤
│  Bottom Navigation Bar (Mobile)                         │
│  [ Home ]  [ Search ]  [ + Post ]  [ Profile ]          │
└─────────────────────────────────────────────────────────┘
```

### Navigation Breakdown

| Element | Location | Purpose |
|---|---|---|
| Top bar | All screens | Global search, university branding, profile access |
| Left panel | Dashboard only | Quick access to discussions, recent visits, interests |
| Bottom nav | Mobile view | Primary navigation between core screens |
| Back button | Inner screens | Return to previous screen without losing context |

**Rationale:** A persistent top navigation bar ensures students always 
have access to search and their profile from any screen in the app. 
The NEU logo placed in the top bar reinforces university identity and 
gives students a familiar anchor point throughout the experience. The 
left panel on the dashboard provides personalized shortcuts to relevant 
discussion groups without cluttering the main content feed. On mobile, 
a bottom navigation bar was chosen over a hamburger menu because it 
exposes the four primary actions immediately and requires fewer taps — 
reducing friction for students accessing the platform on their phones 
between classes or during breaks.

---

## 3. Design Decision We Are Most Proud Of

### Community-Style Dashboard with Personalized Left Panel

The design decision we are most proud of is the **community-style 
dashboard** paired with the **personalized left panel navigation**. 
Rather than building a traditional private wellness tracker that isolates 
students with only their own data and entries, we intentionally designed 
the platform around **peer connection and shared experience**.

The left panel surfaces three key elements at a glance:
- **Recommended program discussions** based on the student's profile 
  and interests
- **Recently visited discussion groups** for quick return access to 
  ongoing conversations
- **Shared interest communities** to connect students going through 
  similar experiences

**Why we are proud of this decision:** Mental health challenges in 
academic settings are often made worse by isolation and the feeling 
that one's struggles are unique. By centering the dashboard around 
community content and making relevant discussions immediately visible 
the moment a student logs in, we directly addressed this problem. 
Students are greeted not with a blank tracker or empty form, but with 
a living feed of peer experiences, coping strategies, and open 
discussions — reinforcing that they are part of a community that 
understands them. This decision reflects a genuine understanding of 
the target users and places emotional connection above data collection.

---

## 4. One Thing We Would Change

### Adopting a Web-First Design Approach from the Start

If we could go back to the beginning of the design process, we would 
approach the wireframes with a **web-first mindset** rather than 
designing screens without a clear primary platform target from the start.

**The problem:** During the wireframing process, design decisions such 
as the community-style dashboard, the left panel navigation, and the 
post engagement system were made without fully committing to a web 
browser as the primary platform. This caused inconsistencies in layout 
proportions, spacing, and component sizing that would have been avoided 
had we established web as the primary design surface from the beginning.

**What we would do differently:** Begin wireframing with a standard 
web viewport (1440px desktop width) as the primary canvas, establishing 
consistent grid systems, column layouts, and component sizing specifically 
optimized for browser-based access. A web-first approach would have 
allowed us to take full advantage of wider screen real estate — making 
the left panel navigation, the community feed, and the discussion threads 
feel more intentional and spacious. Responsive breakpoints for tablet 
(768px) and mobile (375px) would then be designed as adaptations of the 
established web layout rather than separate design problems, resulting 
in a more cohesive and well-structured experience across all screen sizes.


