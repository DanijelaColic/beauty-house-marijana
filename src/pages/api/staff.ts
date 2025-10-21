// API route for fetching staff members
import type { APIRoute } from 'astro';
import { mockStaff } from '@/lib/mock-staff';


export const GET: APIRoute = async () => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: mockStaff,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching staff:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri dohvaćanju djelatnika',
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
