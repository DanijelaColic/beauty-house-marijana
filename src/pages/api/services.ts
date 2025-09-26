// API route for fetching services
import type { APIRoute } from 'astro';
import { db } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const services = await db.getServices();
    
    return new Response(
      JSON.stringify({
        success: true,
        data: services,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri dohvaćanju usluga',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
