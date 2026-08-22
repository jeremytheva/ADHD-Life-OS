# Unified Execution Engine Foundation

**Date:** 2026-08-22
**Stage:** 3 — Unified ADHD Execution Engine

## Decision

Stage 3 begins with a single execution-decision boundary over canonical Activities rather than adding more domain-specific recommendation widgets.

`executionEngine` answers the first form of the platform's core execution question: **what are the best things I can realistically start now?**

## Inputs

The engine accepts canonical Activities and current execution state:

- current energy;
- available time;
- current location;
- available items/tools;
- mood.

The service-level entry point loads Activities through `activityService`, so Tasks, project tasks, routine steps, chores, and future Activity-backed domains can participate without separate recommendation pipelines.

## Eligibility policy

Before ranking, activities are excluded when they are terminal or when known hard context makes them unavailable. Time is normally a hard constraint, but sufficiently aversive work may remain startable when the user has enough time for a bounded 10-minute Brave Frog micro-start.

Unknown context is not treated as a negative match. For example, an empty `available_items` state means item availability is unknown rather than proving required tools are absent.

## Ranking

The engine reuses the existing ADHD priority and dopamine-path recommender rather than creating a second scoring model. Dopamine-path recommendations are placed first and priority-ranked eligible activities provide fallback coverage.

Every returned execution option includes source provenance, recommendation path/reason/confidence, whether the full activity fits the available time, and a concrete initiation action.

## Brave Frog correction

The existing Brave Frog predicate incorrectly used `task.is_essential || config.is_essential`. Since the configuration requires essential tasks, that expression made every sufficiently aversive task eligible. The predicate now requires `task.is_essential === true` when the path is configured as essential-only.

## Scope

This foundation does not yet:

- render a new Stage 3 UI;
- persist execution state or recommendation feedback;
- automatically replan the day;
- learn durations or preferences;
- integrate external calendars.

Those capabilities should build on this decision boundary rather than bypass it.
