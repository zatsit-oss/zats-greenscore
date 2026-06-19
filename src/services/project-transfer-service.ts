/**
 * Project Transfer Service - Export and import of projects
 *
 * Provides backup (export) and restore (import) of projects as JSON.
 * Pure parsing/merge logic is kept side-effect free for testability; only
 * exportAllProjects/applyImport touch the storage layer (via project-service).
 *
 * Merge strategy on import: projects are matched against existing ones by
 * name. Name conflicts are resolved by a single global decision (overwrite
 * all or skip all), surfaced to the user before applyImport is called.
 */

import type {Project} from '../types/project';
import {APP_VERSION} from '../types/project';
import {getAllProjects, restoreProject} from './project-service';

export const EXPORT_FORMAT = 'zats-greenscore';
export const EXPORT_VERSION = 1;

/**
 * Envelope wrapping exported projects with metadata for safe re-import.
 */
export interface ProjectsExport {
    format: string;
    version: number;
    exportedAt: string;
    appVersion: string;
    projects: Project[];
}

export type ImportParseResult =
    | { ok: true; projects: Project[] }
    | { ok: false; error: string };

export interface ImportSummary {
    added: number;
    overwritten: number;
    skipped: number;
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Serialize projects into the export envelope (pretty-printed JSON).
 */
export function serializeProjects(projects: Project[]): string {
    const payload: ProjectsExport = {
        format: EXPORT_FORMAT,
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
        projects
    };
    return JSON.stringify(payload, null, 2);
}

/**
 * Export all stored projects as a JSON string.
 */
export function exportAllProjects(): string {
    return serializeProjects(getAllProjects());
}

// ============================================================================
// IMPORT - PARSING & VALIDATION
// ============================================================================

/**
 * Minimal structural validation of an imported project. We only check the
 * shape required to safely store and display it; deeper evaluation contents
 * are tolerated to stay forward-compatible.
 */
function isValidProject(value: unknown): value is Project {
    if (typeof value !== 'object' || value === null) return false;
    const project = value as Record<string, unknown>;
    return (
        typeof project.id === 'string' &&
        typeof project.name === 'string' &&
        typeof project.description === 'string' &&
        typeof project.createdAt === 'string' &&
        typeof project.updatedAt === 'string' &&
        typeof project.evaluations === 'object' &&
        project.evaluations !== null
    );
}

/**
 * Parse and validate an import payload. Accepts either the export envelope
 * ({ projects: [...] }) or a bare array of projects.
 */
export function parseProjectsFile(content: string): ImportParseResult {
    const trimmed = content.trim();
    if (!trimmed) {
        return {ok: false, error: 'The file is empty.'};
    }

    let data: unknown;
    try {
        data = JSON.parse(trimmed);
    } catch {
        return {ok: false, error: 'Invalid JSON: the file could not be parsed.'};
    }

    let rawProjects: unknown;
    if (Array.isArray(data)) {
        rawProjects = data;
    } else if (typeof data === 'object' && data !== null && 'projects' in data) {
        rawProjects = (data as Record<string, unknown>).projects;
    } else {
        return {ok: false, error: 'Unrecognized format: no projects found.'};
    }

    if (!Array.isArray(rawProjects)) {
        return {ok: false, error: 'Unrecognized format: projects must be a list.'};
    }

    const projects = rawProjects.filter(isValidProject);
    if (projects.length === 0) {
        return {ok: false, error: 'No valid project found in the file.'};
    }

    return {ok: true, projects};
}

// ============================================================================
// IMPORT - MERGE
// ============================================================================

/**
 * Return the distinct names of imported projects that already exist (by name).
 */
export function detectNameConflicts(
    imported: Project[],
    existing: Project[]
): string[] {
    const existingNames = new Set(existing.map((p) => p.name));
    const conflicts = new Set<string>();
    for (const project of imported) {
        if (existingNames.has(project.name)) {
            conflicts.add(project.name);
        }
    }
    return [...conflicts];
}

/**
 * Persist imported projects, merging by name.
 *
 * - New name: added (a fresh id is assigned if the imported id collides with
 *   an unrelated existing project).
 * - Existing name + overwrite=true: replaces the existing project in place
 *   (keeps the existing id).
 * - Existing name + overwrite=false: skipped.
 */
export function applyImport(
    imported: Project[],
    overwrite: boolean
): ImportSummary {
    const existing = getAllProjects();
    const existingByName = new Map(existing.map((p) => [p.name, p]));
    const existingIds = new Set(existing.map((p) => p.id));

    const summary: ImportSummary = {added: 0, overwritten: 0, skipped: 0};

    for (const project of imported) {
        const match = existingByName.get(project.name);
        if (match) {
            if (overwrite) {
                // Restore verbatim, but keep the existing id so it updates in
                // place. Timestamps come from the backup, not import time.
                restoreProject({...project, id: match.id});
                summary.overwritten++;
            } else {
                summary.skipped++;
            }
            continue;
        }

        // No name conflict: avoid clobbering an unrelated project that happens
        // to share the imported id.
        const id = existingIds.has(project.id) ? crypto.randomUUID() : project.id;
        restoreProject({...project, id});
        existingIds.add(id);
        summary.added++;
    }

    return summary;
}
