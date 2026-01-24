import { assignmentsData } from "@/lib/data/assignments";

type AssignmentsMap = Record<string, number | null>;

let assignments: AssignmentsMap = { ...assignmentsData };
const listeners = new Set<() => void>();

export function getAssignments(): AssignmentsMap {
  return assignments;
}

export function setAssignments(
  updater: AssignmentsMap | ((prev: AssignmentsMap) => AssignmentsMap)
) {
  assignments = typeof updater === "function" ? updater(assignments) : updater;
  listeners.forEach((listener) => listener());
}

export function subscribeAssignments(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
