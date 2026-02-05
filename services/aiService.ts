
import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeWorkforce(users: User[]): Promise<string> {
  const currentMonth = new Array('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre')[new Date().getMonth()];
  
  const userSummary = users.map(u => 
    `- ${u.nombre} (${u.id_empleado}): Equipo ${u.equipo}, Cumpleaños: ${u.dia} de ${u.mes}, Estado ${u.estado}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un asistente de RRHH. Analiza este listado de empleados. 
      Estamos en el mes de ${currentMonth}. 
      Genera un resumen ejecutivo breve (máximo 3 párrafos) en español. 
      Destaca quiénes cumplen años este mes para organizar celebraciones y comenta la distribución por equipos:
      
      ${userSummary}`,
    });
    
    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con la IA para el análisis.";
  }
}
