// API route for fetching staff members
import type { APIRoute } from 'astro';
import { db } from '@/lib/supabase';
import { mockStaff } from '@/lib/mock-staff';
import type { Staff } from '@/types';

export const GET: APIRoute = async () => {
  try {
    // Pokušaj dohvatiti prave staff podatke iz baze
    const realStaff = await db.getAllStaffMembers();
    
    if (realStaff.length > 0) {
      // Mapiranje slika po imenu djelatnika
      const getAvatarForStaff = (name: string): string => {
        const nameLower = name.toLowerCase();
        
        // Marijana Talović - vlasnica, dobiva sliku koja je bila Ana Djelatnik (team-1.jpg)
        if (nameLower.includes('marijana') || nameLower.includes('talović')) {
          return '/team/team-1.jpg';
        }
        // Elena Božić - dobiva drugu sliku (team-2.jpg)
        if (nameLower.includes('elena') || nameLower.includes('božić') || nameLower.includes('bozic')) {
          return '/team/team-2.jpg';
        }
        // Petra Novak
        if (nameLower.includes('petra') || nameLower.includes('novak')) {
          return '/team/team-3.jpg';
        }
        // Marija Kovač
        if (nameLower.includes('marija') || nameLower.includes('kovač') || nameLower.includes('kovac')) {
          return '/team/team-4.jpg';
        }
        // Sara Babić
        if (nameLower.includes('sara') || nameLower.includes('babić') || nameLower.includes('babic')) {
          return '/team/team-5.jpg';
        }
        // Nina Jurić
        if (nameLower.includes('nina') || nameLower.includes('jurić') || nameLower.includes('juric')) {
          return '/team/team-6.jpg';
        }
        
        // Default slika ako se ne prepozna
        return '/team/team-1.jpg';
      };
      
      // Mapiraj StaffProfile na Staff format za frontend
      // Filtriraj "Ana Djelatnik" i "Ana Marić" iz liste djelatnika za rezervacije
      // Marijana Talović ostaje owner, svi ostali su staff
      const staffData: Staff[] = realStaff
        .filter((profile) => {
          const name = (profile.fullName || profile.email).toLowerCase();
          // Izbaci "Ana Djelatnik" i "Ana Marić" iz liste djelatnika za rezervacije
          const isAnaDjelatnik = name.includes('ana djelatnik');
          const isAnaMaric = (name.includes('ana marić') || name.includes('ana maric')) && !name.includes('marijana');
          return !isAnaDjelatnik && !isAnaMaric;
        })
        .map((profile) => {
          const name = profile.fullName || profile.email;
          const avatar = getAvatarForStaff(name);
          
          return {
            id: profile.id, // Koristi pravi UUID umjesto mock ID-a
            name: name,
            avatar: avatar,
            description: profile.role === 'owner' ? 'Vlasnica' : 'Djelatnik',
            active: profile.active,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          };
        })
        .sort((a, b) => {
          // Marijana Talović na prvo mjesto
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          const isMarijanaA = aName.includes('marijana') || aName.includes('talović') || aName.includes('talovic');
          const isMarijanaB = bName.includes('marijana') || bName.includes('talović') || bName.includes('talovic');
          
          if (isMarijanaA && !isMarijanaB) return -1;
          if (!isMarijanaA && isMarijanaB) return 1;
          
          // Ostali djelatnici po abecednom redu
          return a.name.localeCompare(b.name, 'hr');
        });
      
      console.log('✅ Using real staff data from database:', staffData.length, 'members');
      
      return new Response(
        JSON.stringify({
          success: true,
          data: staffData,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Fallback na mock podatke ako baza nije dostupna ili nema podataka
    console.log('⚠️ Using mock staff data (no database data available)');
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
    
    // Fallback na mock podatke u slučaju greške
    console.log('⚠️ Error occurred, using mock staff data as fallback');
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
