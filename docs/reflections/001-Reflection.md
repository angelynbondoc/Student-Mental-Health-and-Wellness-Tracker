# PM Reflection
 
---
 
## Hardest Decisions
 
The hardest decision I had to make was how to keep the team moving without waiting on each other. With two full-stack developers and a separate frontend person, the natural bottleneck was dependency — Dev 2 owned the database layer and core auth features (login, sign-up), while I handled the general application features, and the frontend developer worked on the UI separately. Waiting for one to finish before the other started would have stalled the entire sprint. So I made the call to establish a **contract-based development approach**: we agreed on data shapes and API interfaces upfront, and everyone coded against those contracts independently. That decision kept momentum, but it introduced its own cost — one I didn't fully anticipate at the time.
 
---
 
## Handling the Integration Blocker
 
The most significant blocker came at the end, not the beginning. To unblock the team early, I built mock data and a mock UI so that the frontend and backend developers had something concrete to build against. This worked — the team was able to develop in parallel without waiting on real implementations. However, when everyone finished their parts, the integration phase became unexpectedly painful. Replacing mocks with live data and cleaning up the placeholder logic turned out to be harder than expected — in some ways, it felt like it would have been easier to rebuild the whole thing from scratch than to surgically remove the scaffolding from a working codebase.
 
I handled this blocker by going through the codebase methodically, identifying every mock touchpoint, and replacing them one layer at a time — starting from the data layer up to the UI. Dev 2 helped clarify the actual API responses and database schema, which made the swap-out feasible.
 
---
 
## What I Would Do Differently
 
Two things. First, I would still use contracts — that decision was sound. But I would build a **thinner mock layer**, just enough to type-check against, rather than a full mock UI with rich fake data. The more realistic the mock, the harder it is to rip out later. Second, and more importantly, once I finished my own coding, I would have **immediately replaced my mocks with the actual implementations** before handing anything off. Had I done that cleanly at the end of my own sprint — while the code was still fresh in my mind — the integration would have been a non-issue for the rest of the team. Instead, the mocks persisted into the final build phase, and that created unnecessary rework.
 
The lesson: mocks are for building speed, not for final delivery. Retire them early.