# How evaluation scoring works

Claude never states a score. It classifies; TypeScript computes. This document explains why, and what the numbers mean.

## Why not just ask for a score?

The original implementation asked Claude for `overallScore` (0–100) directly, alongside the strengths and weaknesses lists. That number was generated the same way the prose was — plausibly, holistically, with no anchor. Two consequences:

- **It wasn't reproducible.** The same resume and posting could score 31 or 35 on different runs. There is no fact of the matter about what 33 means, so the variance was pure noise.
- **It wasn't auditable.** "Skills: 33/40" is not a claim anyone can dispute. There was no way to see which judgment produced it.

The fix is to shrink what the model is asked to decide. A four-way classification with written anchors is a bounded choice with a criterion behind it; a number between 0 and 40 is not. Everything numeric moved into [`lib/ai/scoring.ts`](../lib/ai/scoring.ts), where it is inspectable, testable, and changeable without touching a prompt.

## The pipeline

Two model calls per evaluation, orchestrated by `analyzeJobPost` in [`lib/ai/claude.ts`](../lib/ai/claude.ts).

### Pass 1 — requirement extraction

Input: the job posting only. Output: 8–15 `JobRequirement` records, each with a stable `id`, a `category`, and an `importance`.

**This pass never receives the resume.** That isolation is deliberate. If the model could see the candidate while deciding what the job requires, the requirement list could drift toward whatever that candidate happens to have — and two candidates for the same role would then be measured against different rubrics, making their scores incomparable.

| | |
|---|---|
| Model | `claude-haiku-4-5` |
| `temperature` | `0` |
| `max_tokens` | 4096 |

Extraction is parsing, not judgment, so it runs on the cheaper model. It gets `temperature: 0` because this pass sets the denominator for every score that follows — it's the part of the system where consistency matters most.

### Pass 2 — resume assessment

Input: the frozen requirement list plus the resume. Output: one ordinal per requirement with a one-line justification, plus the narrative feedback (strengths, weaknesses, recommendations, summary, insights).

| | |
|---|---|
| Model | `claude-sonnet-5` |
| `temperature` | **must not be set** — a non-default sampling parameter returns a 400 on this model |
| `thinking` | `{ type: 'adaptive' }` |
| `effort` | `medium` |
| `max_tokens` | 16000 |

This is where the real judgment lives — deciding whether a Vue developer counts as `adjacent` for a React requirement is a genuine call — so it runs on the stronger model with thinking enabled. `max_tokens` is high because on this model thinking and response text share one budget.

### The anchors

These definitions are in the prompt verbatim. They are what makes the ordinal mean anything:

| Level | Definition |
|---|---|
| `direct` | Named explicitly in the resume with concrete evidence — a project, a role, a measurable result. |
| `adjacent` | Demonstrably transferable, but not the thing itself (React when the posting asks for Vue). |
| `partial` | Touched, but the evidence is shallow, dated, or peripheral to their main work. |
| `none` | No evidence in the resume. |

## The math

| Match | Points | | Importance | Weight | | Category | Weight |
|---|---|---|---|---|---|---|---|
| `direct` | 1.0 | | `required` | 1.0 | | skill | 0.5 |
| `adjacent` | 0.7 | | `preferred` | 0.5 | | experience | 0.3 |
| `partial` | 0.4 | | | | | domain | 0.2 |
| `none` | 0.0 | | | | | | |

**Subscore per category** — `100 × Σ(points × weight) / Σ(weight)` across that category's requirements.

**`overallScore`** — `0.50 × skillMatch + 0.30 × experienceMatch + 0.20 × domainFit`. Graded quality: partial credit counts.

**`matchPercentage`** — the share of `required` requirements matched at `direct` or `adjacent`, counted binary. Coverage, not quality: "how much of what they asked for do you actually have?"

The two numbers answer different questions on purpose. A candidate can score well on `overallScore` through broad partial credit while `matchPercentage` stays low because they're missing several hard requirements outright.

### Guard rules

- **A category with no requirements is excluded** from `overallScore`, and the remaining category weights are renormalized to sum to 1. A posting that never mentions domain isn't penalized for it, and nothing divides by zero.
- **If extraction produced no `required` requirements**, `matchPercentage` falls back to computing over all requirements.
- **An unassessed requirement counts as `none`** rather than being skipped. Dropping it would shrink the denominator and silently inflate the score.
- **Malformed extracted requirements are discarded**, not coerced. A requirement with a guessed category would distort every subscore downstream. If nothing valid survives, the call throws rather than scoring against an empty rubric.

## Idempotency

`POST /api/evaluate` accepts an optional `idempotencyKey`. When present, a repeated request returns the stored evaluation instead of re-running the analysis — no model calls, no new record, no re-billing. The response carries `idempotent: true`.

The mechanism relies on the table's key schema. Evaluations are keyed by `(userId, evaluationId)`, so the evaluation ID is derived deterministically:

```
evaluationId = sha256(`${userId}:${idempotencyKey}`).slice(0, 32)
```

That turns the idempotency lookup into an ordinary point read — **no secondary index and no key-mapping table**. Hashing the user ID in means one user's key can never resolve to another user's evaluation.

Writes on this path use `ConditionExpression: attribute_not_exists(evaluationId)`. If two concurrent requests with the same key both miss the initial read, the loser catches the conditional-check failure, re-reads, and returns the winner's result rather than erroring.

> **Caveat:** the key is the client's identity claim. Reusing one key across *different* job/resume pairs returns the first result. That's standard idempotency-key semantics, not a bug.

Requests without a key behave exactly as before — a fresh `randomUUID()` each time.

## What is still not deterministic

Requirement **extraction**. The model decides how many requirements exist and where the boundaries fall. If one run extracts 12 requirements and another extracts 14 by splitting "CI/CD" into "Jenkins" and "GitHub Actions", the normalized score shifts even when every individual ordinal call is identical — the denominator changed.

This is the largest remaining source of variance, and it's easy to miss because the per-requirement classifications all look stable when you inspect them.

Two things mitigate it: `temperature: 0` on extraction, and persisting the extracted `requirements` with the evaluation. The stored list is the frozen rubric — re-reading an evaluation always shows the requirement set it was actually scored against, and an idempotency key makes a repeat request return that same evaluation rather than extracting afresh.

## Changing the scoring policy

Weights live in `lib/ai/scoring.ts` as exported constants (`MATCH_POINTS`, `IMPORTANCE_WEIGHTS`, `CATEGORY_WEIGHTS`). The scoring functions are pure and import nothing from the SDK, so they can be unit-tested directly and stored evaluations can be re-scored from their persisted requirements without another API call.
