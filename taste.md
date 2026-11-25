# taste.md — How we work on every product

This is the shared playbook for every product (mobile app or website). Every project ends as a **portfolio case study**, so each step is done and documented with that in mind. Edit this file whenever the process changes. Claude adds or removes items only when asked.

## Principles
- **Simple over complex.** Prefer a simple happy-path flow that solves the problem clearly. No 20-page flows. It should be easy to explain, show in a case study and share.
- **Be smart about evidence.** Every decision traces back to research. Every claim in the case study needs data.
- **Document as we go,** in clear, plain language. Don't reconstruct it afterwards.
- **AI is used carefully.** Note where AI was used, why, and what a human verified. Never let it replace research with users.

## The process (in order)

1. **UX research**
   - Desk research (competitors, articles, existing data), and/or primary research (usability tests, surveys, interviews).
   - Note the method, sample size and date for each.
2. **Find the gap and the problem**
   - Synthesize with affinity diagramming and thematic analysis.
   - Write a clear problem statement (who, what, why it matters).
3. **Journey map**
   - Map the stages, actions, emotions and **drop-off points**. This is where the opportunity is.
4. **User flow**
   - Keep it small: the happy path or a simple flow that solves the problem.
5. **Sketching**, then **low-fidelity wireframes**, then **high-fidelity design**
   - Record why each step changed along the way.
6. **Deploy for real use**
   - It must be something people can actually use.
   - Set up measurement *before* launch (analytics, feedback prompt or survey).
7. **Measure and prove it**
   - How many people used it?
   - Did it help them? (task success, time on task, drop-off, satisfaction, qualitative quotes)
   - Show the problem was solved: before vs after.
8. **Case study**
   - Turn the documentation into the portfolio piece: problem, research, insights, process, solution, results, reflection.

## Design & UI principles
Apply from the first wireframe onwards, even in low-fidelity.
- **Hierarchy:** one primary action per screen. Size, weight and position show what matters most.
- **Consistency:** same component, same place, same behaviour. Use design system tokens, never one-off values.
- **Grouping and spacing:** related things sit close together, aligned to a grid. Spacing on a 4/8pt scale.
- **Feedback and recovery:** every action responds. Every step can be undone (Back, Reset, Skip).
- **Recognition over recall:** visible labels. Icon-only controls must have an accessible name.
- **Progressive disclosure:** ask only what is needed, when it is needed. Say why. Mark optional fields as optional.
- **Accessibility (WCAG 2.2 AA):** text contrast 4.5:1 (3:1 for large text and controls). Tap targets at least 44x44pt. Never use colour alone. Text scales up. Gesture, 3D and voice features always have a simple alternative. Respect reduced motion.
- **Platform:** follow Apple HIG. Respect safe areas. Put primary actions within thumb reach.
- **Content:** plain, calm, kind language. Short. No diagnosis or medical advice.
- **Motion:** purposeful, under 500ms, with a reduced-motion fallback.
- **Privacy and trust (health data):** private by default, explain what is stored and why, get consent (GDPR), minimise what we collect.

## Documentation conventions
- Each project keeps its artifacts in folders that follow the steps above (this repo uses `research/` and `design/`).
- Keep a running `process-log.md` per project: date, what we did, why, what we learned.
- Save raw research, synthesis, journey map, flows, wireframe iterations, and metrics so the case study can be built from them.
- Name the tools used at each step (e.g. Figma, Miro, Maze, analytics tool) and where AI was involved.

## Tools & workflow
<!-- Add tools here as we decide on them. -->
- Design: Figma
- Synthesis/mapping: Miro
- UI components: shadcn/ui (for web builds)

## Open items
- Define the standard metrics set for "did it help people".
- Decide the case study template.
