# Knowledge Architecture
## Mental Awareness Knowledge Management App
> Committed to /docs/km-architecture.md | Version 1.0

---

## 1. Data Schema for Knowledge Items

Each knowledge entry in the app contains the following fields. This schema ensures structured, searchable, and reusable knowledge across all SECI phases.

| Field | Description | Data Type | Example |
|---|---|---|---|
| entry_id | Unique identifier for the knowledge entry | UUID | k-0041 |
| title | Short label for the entry | String | "Breathing Exercise" |
| type | Kind of knowledge entry | Enum | reflection |
| author_id | User who created the entry | UUID / anonymous | usr-2291 |
| date_created | Timestamp of creation | ISO 8601 | 2025-04-10 |
| emotion_tags | Emotional states associated with the entry | Array\<String\> | ["anxious","calm"] |
| category | Top-level taxonomy category | Enum | Coping Strategies |
| subcategory | Sub-level topic within category | String | Breathwork |
| seci_phase | Which SECI stage this entry belongs to | Enum | Externalization |
| visibility | Who can view the entry | Enum | public / private |
| content_body | Main text or media of the entry | Text / Rich Text | "Today I felt..." |
| source_type | Origin of the knowledge | Enum | user / curated |
| moderation_status | Current moderation state of the entry | Enum | active / flagged / blocked |
| report_count | Number of times this entry has been reported by users | Integer | 3 |
| report_reason | Category of violation selected by the reporting user | Enum | harassment / spam / harmful |
| blocked_by | Admin user ID who issued the block action | UUID / null | adm-0012 |
| blocked_at | Timestamp when the block was applied | ISO 8601 / null | 2025-04-15T10:30Z |

**Entry type values:** `reflection` | `resource` | `story` | `habit` | `exercise` | `mood_log` | `community_post`

**SECI phase values:** `Socialization` | `Externalization` | `Combination` | `Internalization`

**Moderation status values:** `active` | `flagged` | `blocked`

**Report reason values:** `harassment` | `spam` | `harmful_content` | `misinformation` | `inappropriate`

---

## 2. Block, Report & Admin Moderation System

To protect the safety and integrity of the community space, the app includes a three-layer moderation system: user-level blocking, user-initiated reporting, and admin-level enforcement. This system ensures the Socialization phase of the SECI model remains a safe environment for sharing tacit knowledge without exposure to harmful content or trolling behavior.

| Action | Description | Triggered By | Result |
|---|---|---|---|
| Report Entry | User flags a community post as harmful, spam, or harassing. Must select a reason from a predefined list. | Any user | report_count +1; if threshold met, auto-flag for admin review |
| Block User | User blocks another user from appearing in their community feed. Blocked user is unaware. | Any user | Blocked user's posts hidden from blocker's view only |
| Auto-Flag (Threshold) | System automatically escalates an entry to admin review queue when report_count reaches the defined threshold (default: 3 reports). | System (automatic) | Entry marked `flagged`; pushed to Admin Review Queue |
| Admin Review | Admin views flagged entry, report reasons, and reporter count in the Admin Dashboard. | Admin only | Admin selects: Dismiss, Warn User, or Block Entry |
| Dismiss Report | Admin determines the entry does not violate community guidelines. Entry is restored to active status. | Admin only | moderation_status = active; report_count reset |
| Warn User | Admin sends the entry author an in-app warning notification. Entry remains visible but is flagged internally. | Admin only | Warning notification sent to author |
| Block Entry | Admin permanently removes the entry from public view. Entry is retained in the database for audit purposes but invisible to all users. | Admin only | moderation_status = blocked; entry hidden system-wide |

### Moderation Design Rules

- Auto-flag threshold is set at **3 unique user reports** by default. Admin can configure this threshold in the Admin Dashboard.
- Blocked entries are **NEVER deleted** from the database — they are hidden from public view but retained for audit and appeals purposes.
- User-level blocks are personal — the blocked user is **never notified**.
- Anonymous posts are reportable. The system can trace anonymous posts to a `user_id` internally (for admin enforcement) without ever revealing that identity publicly.
- A user who accumulates **3 or more blocked entries within 30 days** is automatically escalated to admin for account review.

### Admin Dashboard Requirements (for Developer)

- Admin must be able to view a queue of all flagged entries sorted by `report_count` (highest first).
- Each flagged entry card must display: entry content, report_count, list of report_reason values submitted, and date_created.
- Admin actions (Dismiss / Warn / Block) must be logged with the admin's user ID and a timestamp for accountability.
- Admin must be able to search blocked entries and **reverse a block** if a mistake was made.

---

## 3. Taxonomy

Knowledge in the app is organized by five top-level categories, each mapped to a SECI phase.

| Category | Subcategories | SECI Phase | Entry Types |
|---|---|---|---|
| Personal Reflections | Daily Journaling, Gratitude, Emotional Check-in | Externalization | Reflection, Mood Log |
| Coping Strategies | Breathwork, Grounding, Mindfulness, Physical Activity | Internalization | Tip, Exercise, Habit |
| Mental Health Education | Anxiety, Depression, Stress Management, Self-Care | Combination | Article, Resource, Guide |
| Community Stories | Peer Experiences, Anonymous Posts, Shared Insights | Socialization | Story, Post, Comment |
| Growth Tracking | Mood Trends, Habit Logs, Milestone Records | Internalization | Log, Progress Entry |

### Taxonomy Design Rationale

- Categories map directly to SECI phases to reinforce the knowledge cycle throughout the user experience.
- Emotion tags are separate from categories — they allow cross-category filtering (e.g., all `anxious` entries regardless of type).
- Subcategories are extensible — new topics can be added without restructuring the top-level taxonomy.

---

## 4. Retrieval Logic Requirements

| Feature | Requirement | Filter Logic |
|---|---|---|
| Keyword Search | Users can type keywords; system searches titles, tags, and content_body | Full-text match |
| Category Filter | Users can select one or more top-level categories to narrow results | Exact match on `category` field |
| Emotion Tag Filter | Users can filter entries by one or more emotion tags (e.g., anxious, hopeful) | Array contains match |
| SECI Phase Filter | Users can browse entries by SECI phase to find entries relevant to their current growth stage | Exact match on `seci_phase` |
| Date Range Filter | Users can filter by date range for personal entries and mood logs | Range match on `date_created` |
| Source Type Filter | Users can toggle between "My Entries" (user-generated) and "Library" (curated content) | Exact match on `source_type` |
| Sort Options | Results sortable by: Most Recent, Most Relevant (keyword rank), Most Shared (community) | Sort on date or relevance score |

### Additional Retrieval Rules

- Private entries (`visibility = private`) must **NEVER** appear in community or shared views — only in the author's own dashboard.
- Anonymous community posts should display no `author_id` to any other user.
- The system must support combining **multiple active filters simultaneously** (e.g., Category = Coping Strategies AND emotion_tag = anxious).
- Search results must display the entry's title, type, category, and a 2–3 sentence excerpt from `content_body`.
