// supabase.js
import { createClient } from '@supabase/supabase-js';

// Use YOUR actual credentials from API settings
const SUPABASE_URL = 'https://dogqmxadstapacemmb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3FteGFkc3RxcGFhY2Vucm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjQyODUsImV4cCI6MjA2NTcwMDI4NX0.pNf4kLpFaPUks2sTegXV12a61OigTYCuw_AGn0ISjwM'; // Replace with your anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;