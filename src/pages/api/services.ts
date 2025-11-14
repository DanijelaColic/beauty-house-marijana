// API route for fetching services
import type { APIRoute } from 'astro';
import { db } from '@/lib/supabase';
import { mockServices } from '@/lib/mock-services';


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
    console.error('Error fetching services from database:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Fallback to mock services when database is not configured
    console.log('Falling back to mock services data');
    return new Response(
      JSON.stringify({
        success: true,
        data: mockServices,
        fallback: true, // Indicate this is fallback data
      }),
      {
        status: 200,
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
