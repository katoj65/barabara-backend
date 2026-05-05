import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);

class Authentication{
//login function 
async login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error

  return data;
}


//register function
async register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error

  return data;  
}


//logout function
async logout() {
const { error } = await supabase.auth.signOut();
if (error) throw error    
}

//get session function
async getSession() {
const { data: { session }, error } = await supabase.auth.getSession();
if (error) throw error
return session?.access_token;
}

}

export default Authentication;
