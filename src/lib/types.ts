export type CareReport = {
    id: string;
    patientId: string | null;
    patientName: string;
    patientRoom: string | null;
    timestamp: string; // ISO string
    transcript: string;
    // AI-structured fields — null means not mentioned in the recording
    foodIntake: string | null;
    hydration: string | null;
    medication: string | null;
    vitalSigns: string | null;
    mobility: string | null;
    mood: string | null;
    skinCondition: string | null;
    toileting: string | null;
    observations: string | null;
    followUp: string | null;
};

export const REPORTS_KEY = "kaigo_reports";

export function loadReports(): CareReport[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(REPORTS_KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function saveReport(report: CareReport): void {
    if (typeof window === "undefined") return;
    const existing = loadReports();
    localStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...existing]));
}
