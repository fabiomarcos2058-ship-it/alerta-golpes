import { supabase } from '../lib/supabase'
import { supabaseBackend } from './supabaseBackend'
import { demoBackend } from './demoBackend'

/** Online quando o Supabase está configurado em src/config.js; senão, demonstração. */
export const backend = supabase ? supabaseBackend : demoBackend
