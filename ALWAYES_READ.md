# EcoTrack AI - Project Constitution

You are joining an existing production-grade React + TypeScript + Firebase application.

This is NOT a greenfield project.

Before writing, modifying, deleting, or suggesting any code, follow this workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PROJECT FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT immediately start coding.

First understand the repository.

Before making any change:

• Read all project documentation.
• Understand the existing architecture.
• Understand how features interact.
• Identify dependencies.
• Preserve the existing design philosophy.
• Preserve scientific correctness.

Never redesign blindly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. READ THE DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read every important project document before modifying anything.

This includes (if present):

docs/

Architecture.md

Design.md

Memory.md

Summary.md

Phases.md

Roadmap.md

README.md

CONTRIBUTING.md

Developer Notes

Implementation Notes

Dataset documentation

Firebase documentation

Any ADR (Architecture Decision Records)

Never ignore documentation.

Documentation is the source of truth.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. FOLLOW THE PROJECT ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respect existing architecture.

Do NOT rewrite the project.

Do NOT introduce new patterns without reason.

Reuse:

• existing hooks

• existing services

• existing utilities

• contexts

• providers

• components

• design tokens

• Firebase layer

• dataset registry

• AI services

Never duplicate code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. USE NO-AI-SLOP PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Follow the No-AI-Slop philosophy.

Never:

❌ duplicate logic

❌ create unnecessary files

❌ create giant components

❌ invent APIs

❌ invent data

❌ invent datasets

❌ create placeholder implementations

❌ replace working code

❌ ignore TypeScript

❌ use "any"

❌ ignore lint warnings

❌ ignore build errors

❌ leave TODOs instead of implementations

Every change must feel like it was written by a senior engineer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. FOLLOW ADHD.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If an ADHD.md or I-HAVE-ADHD repository exists:

Read it.

Follow it.

Respond using that communication style.

That means:

• Start with the answer.

• Keep responses structured.

• Use headings.

• Number steps.

• Avoid walls of text.

• Keep context clear.

• Show progress.

• Explain why changes are made.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. ANALYZE BEFORE CODING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before modifying code:

1. Understand the problem.

2. Find affected files.

3. Identify dependencies.

4. Explain the plan.

5. Wait if clarification is required.

6. Modify the minimum necessary code.

Never perform massive rewrites.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. PRESERVE FUNCTIONALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This application already contains production features.

Never remove or break:

• Authentication

• Firestore

• Firebase

• Dataset Registry

• Carbon calculations

• AI Coach

• History

• Leaderboards

• Community

• Dashboard

• Admin Panel

• Regional datasets

• What-if simulator

• Charts

• Routing

• State management

• Context providers

Everything must continue working.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. NEVER HALLUCINATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If data does not exist:

Say it.

Do NOT fabricate.

Never create:

fake emissions

fake analytics

fake APIs

fake user statistics

fake leaderboards

fake environmental data

Use only existing project data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The project should follow a premium climate-tech aesthetic.

Inspired by:

• Linear

• Vercel

• Stripe

• Watershed

• Our World In Data

• Arc Browser

• Apple

• Notion

Avoid generic "green website" design.

No:

❌ leaves

❌ gradients everywhere

❌ cartoon illustrations

❌ giant icons

❌ glassmorphism

❌ neon green

Instead use:

✔ typography

✔ whitespace

✔ scientific dashboards

✔ clean grids

✔ subtle motion

✔ premium spacing

Use existing design tokens whenever possible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. USE PROJECT TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If available:

• Use Multica planning methodology.

• Follow No-AI-Slop repository standards.

• Follow ADHD repository instructions.

• Use Motion Primitives for animations.

• Use Refero for design inspiration.

• Use Realtime Colors for palettes.

• Use Haikei only if lightweight SVG backgrounds are appropriate.

Never introduce unnecessary libraries.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. IMPLEMENTATION STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write code that is:

Readable

Composable

Typed

Accessible

Responsive

Maintainable

Reusable

Production-ready

Do not over-engineer.

Do not under-engineer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before claiming completion verify:

✓ Build passes

✓ TypeScript passes

✓ Existing features still work

✓ No broken imports

✓ No duplicated code

✓ No unused code

✓ No console errors

✓ Responsive

✓ Accessible

✓ Uses design tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. RESPONSE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always respond in this format:

1. Understanding

Summarize the task.

2. Analysis

Explain affected files and dependencies.

3. Plan

Explain exactly what will change.

4. Implementation

Perform only the required modifications.

5. Verification

Explain how functionality was preserved.

6. Final Summary

List every changed file and why.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. PRIMARY OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Improve the project without sacrificing stability.

Every decision must preserve:

• functionality

• scientific accuracy

• architecture

• maintainability

• performance

• accessibility

• readability

The final result should feel like it was built by a team of senior engineers and product designers—not generated by AI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0. MANDATORY INITIALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing a single line of code:

1. Read ALWAYS_READ.md completely.

2. Read every document referenced inside ALWAYS_READ.md.

3. Read README.md.

4. Read ADHD.md (if present).

5. Read AGENTS.md (if present).

6. Read docs/Architecture.md.

7. Read docs/Design.md.

8. Read docs/Memory.md.

9. Read docs/CodingStandards.md.

10. Read docs/Firebase.md.

11. Read docs/UIPrinciples.md.

Summarize your understanding before coding.

Never skip initialization.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPOSITORY DISCOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before modifying code identify:

• related pages

• related components

• related contexts

• related hooks

• related services

• related utilities

• shared types

• Firebase dependencies

• datasets

• design tokens

• tests

Explain the dependency graph.

Only then modify code.

Never rewrite entire files.

Never rewrite entire components.

Modify the minimum amount of code required.

Prefer surgical edits.

Preserve formatting.

Preserve comments.

Preserve architecture.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN GUARDIAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never redesign because it "looks better."

Every visual change must improve one or more:

• hierarchy

• readability

• accessibility

• usability

• responsiveness

• consistency

• perceived performance

Never redesign for novelty.

Every visual decision must have a UX reason.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avoid:

large dependencies

duplicate rendering

unnecessary state

heavy animations

layout shifts

re-render loops

Prefer:

memoization

lazy loading

tree shaking

existing libraries

CSS animations

GPU-friendly transforms

Keep bundles small.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every component must:

have keyboard navigation

visible focus states

proper ARIA labels

semantic HTML

color contrast

responsive typography

accessible forms

Never sacrifice accessibility for aesthetics.


Never claim:

✓ Build passes

unless you actually ran it.

Never claim:

✓ TypeScript passes

without running TypeScript.

Distinguish clearly between:

Verified

Likely

Assumed

Unknown


Never say:

Completed

unless 100% complete.

Instead report:

Completed

Remaining

Blocked

Deferred

Risks

Verification

Large migrations must be incremental.

Never migrate multiple major pages in one task unless explicitly requested.

Recommended order:

Assessment

Dashboard

History

Community

Admin

Verify each before continuing.

Understanding

Repository Analysis

Affected Files

Dependencies

Implementation Plan

Implementation

Verification

Remaining Work

Risks

Summary

Never assume.

If something is unclear:

inspect the repository

search for implementations

trace imports

ask for clarification

Do not guess.

Design references:

Linear

Vercel

Stripe

Apple

Arc Browser

Notion

OpenAI

Anthropic

Raycast

GitHub

Watershed

Our World In Data

The Browser Company

Goal:

editorial

premium

scientific

minimal

trustworthy

high-performance

Avoid generic SaaS and generic "green" aesthetics.