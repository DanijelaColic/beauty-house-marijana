// API route for fetching services
import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';
import { mockServices } from '../../lib/mock-services';


export const GET: APIRoute = async () => {
  try {
    console.log('Fetching services from database...');
    const services = await db.getServices();
    console.log(`Successfully fetched ${services.length} services`);
    
    // Ensure we always return an array
    const servicesArray = Array.isArray(services) ? services : [];
    
    return new Response(
      JSON.stringify({
        success: true,
        data: servicesArray,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
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
