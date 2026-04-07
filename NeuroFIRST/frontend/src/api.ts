import axios from "axios";

const API_URL = "http://localhost:32425";
const RENDER_API_URL = "https://neurofirst-io.onrender.com"

const apiClient = axios.create({
  baseURL: RENDER_API_URL,
  timeout: 10000,
});

export interface UrgencyAssessment {
  age: number;
  sex: "Male" | "Female" | "Other";
  symptom_duration_num: number;
  symptom_duration_qualifier: "min" | "hrs" | "days" | "wks" | "mos";
  symptom_onset: "Sudden" | "Rapid" | "Gradual" | "Fluctuating";
  symptoms: string[];
  notes: string;
}

interface UrgencyScoreResponse {
  urgency: number;
}

export async function getUrgencyScore(assessment: UrgencyAssessment): Promise<number> {
  const response = await apiClient.post<UrgencyScoreResponse>("/urgency_score", assessment);
  return response.data.urgency;
}