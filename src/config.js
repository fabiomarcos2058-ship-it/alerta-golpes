// Dados do seu projeto Supabase (Project Settings → API Keys / Data API).
//
// Enquanto estiverem vazios, o site roda em MODO DEMONSTRAÇÃO, com números fictícios.
//
// A "publishable key" (ou "anon key") é feita para ficar no site, à vista de todos:
// quem protege os dados são as regras do banco em supabase/schema.sql.
// NUNCA coloque aqui a "secret key" / "service_role key".
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || ''
