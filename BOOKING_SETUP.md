# 🚀 Beauty House Booking System Setup Guide

This guide explains how to complete the setup of the integrated booking system that has been migrated from salon-aurora.

## 📋 What's Been Done

✅ **Migration Completed:**
- ✅ All booking components migrated and adapted to Astro
- ✅ Supabase integration set up (requires configuration)
- ✅ Form validation with Zod schemas
- ✅ Multi-step booking form (Service → Date → Time → Details)
- ✅ API routes for services, availability, and booking creation
- ✅ UI components adapted to existing design system
- ✅ Booking and success pages created
- ✅ Dependencies added to package.json

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

#### Option A: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema from the source repo:

```sql
-- Copy and run the contents of:
-- \\wsl.localhost\Ubuntu\home\orisnik\projects\salon-aurora\supabase\schema.sql
```

#### Option B: Use Existing Database
If you already have a Supabase database from salon-aurora, you can use that.

### 3. Configure Environment Variables

Create `.env` file:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Business Configuration  
PUBLIC_BUSINESS_NAME="Beauty House by Marijana Talović"
PUBLIC_BUSINESS_EMAIL="info@beautyhouse.hr"
PUBLIC_BUSINESS_TIMEZONE="Europe/Zagreb"
```

### 4. Add Initial Data to Supabase

You need to add services and business hours to your database:

#### Services:
```sql
INSERT INTO services (name, description, duration, price, active) VALUES
('Šišanje', 'Pranje, šišanje i styling.', 45, 25.00, true),
('Bojanje', 'Bojanje cijele kose ili izrast.', 90, 60.00, true),
('Styling', 'Feniranje i/ili kovrče.', 30, 20.00, true),
('Muško šišanje', 'Pranje i šišanje.', 30, 15.00, true),
('Dječje šišanje', 'Za djecu do 12 godina.', 25, 12.00, true),
('Njega kose', 'Maska, njega i masaža vlasišta.', 30, 18.00, true);
```

#### Business Hours:
```sql
INSERT INTO business_hours (day_of_week, start_time, end_time, breaks, active) VALUES
(1, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]', true), -- Monday
(2, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]', true), -- Tuesday  
(3, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]', true), -- Wednesday
(4, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]', true), -- Thursday
(5, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]', true), -- Friday
(6, '08:00', '14:00', NULL, true); -- Saturday
```

### 5. Test the System

```bash
npm run dev
```

Then visit:
- `/rezervacije` - Main booking page
- `/rezervacije/uspjeh` - Success page (after completing booking)

## 🎨 Design Integration

The booking system has been fully integrated with your existing design system:

- **Colors**: Uses existing `primary`, `gold`, `textPrimary`, etc.
- **Components**: Adapted shadcn/ui components to match existing styles
- **Layout**: Consistent with existing page layouts
- **Typography**: Uses existing font system and section titles

## 🔗 Navigation Integration

The booking system is already integrated in:
- **Header**: "Rezervacija" button links to `/rezervacije`
- **Homepage**: Booking widget redirects to `/rezervacije`
- **Contact section**: "Rezerviraj termin" button

## 📱 Features Included

### Multi-Step Booking Form
1. **Service Selection** - Choose from available services
2. **Date Selection** - Pick available dates (up to 30 days ahead)
3. **Time Selection** - Select from available time slots
4. **Customer Details** - Enter contact information

### Smart Availability
- Respects business hours and breaks
- Excludes already booked slots
- Handles time-off periods
- Prevents booking in the past

### User Experience
- Progress indicator
- Form validation with helpful error messages
- Responsive design for mobile/desktop
- Loading states and animations

## 🚀 Deployment

### Environment Variables for Production

Set these in your Vercel/Netlify dashboard:

```
PUBLIC_SUPABASE_URL=your_production_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
PUBLIC_BUSINESS_NAME="Beauty House by Marijana Talović"
PUBLIC_BUSINESS_EMAIL="info@beautyhouse.hr"
PUBLIC_BUSINESS_TIMEZONE="Europe/Zagreb"
```

### Deploy Commands

```bash
npm run build
npm run preview  # Test build locally
```

## 🔧 Customization

### Adding New Services
Add directly to Supabase `services` table or create an admin interface.

### Modifying Business Hours
Update the `business_hours` table in Supabase.

### Styling Changes
All styling uses the existing Tailwind config and global CSS classes.

## 📞 Support

The system includes:
- Email confirmation logic (ready for implementation)
- Calendar integration (Google Calendar, Outlook)
- Cancellation token system
- Admin booking management (foundation ready)

## 🗄️ Next Steps (Optional Enhancements)

1. **Email Notifications**: Implement email sending (Resend, SendGrid)
2. **Calendar Integration**: Connect Google Calendar API
3. **Admin Dashboard**: Create booking management interface
4. **SMS Notifications**: Add SMS reminders
5. **Payment Integration**: Add payment processing

---

**The booking system is now fully integrated and ready to use!** 🎉

Just complete the Supabase setup and environment configuration to go live.
