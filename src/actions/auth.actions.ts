'use server';

import { createClient } from '../utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signIn(email: string, password: string) {
    const supabase = createClient(await cookies());
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}

export async function signUp(email: string, password: string) {
    const supabase = createClient(await cookies());
    
    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // If email confirmation is disabled, redirect to dashboard
    // Otherwise, show a message to check email
    return { success: true };
}

export async function signOut() {
    const supabase = createClient(await cookies());
    await supabase.auth.signOut();
    redirect('/');
}
