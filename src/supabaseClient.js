import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jihslpykhcmwothdsiej.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const isMockEnabled = !supabaseKey || supabaseKey === 'mock_key_or_insert_real_key_here';

export const supabase = isMockEnabled 
  ? null 
  : createClient(supabaseUrl, supabaseKey);

// Custom mock storage manager to simulate Supabase database locally
class MockDatabase {
  constructor() {
    this.initMockData();
  }

  initMockData() {
    if (!localStorage.getItem('nirogitanman_profiles')) {
      const mockProfiles = [
        { id: 'pat-1', full_name: 'Rahul Kumar', email: 'patient@nirogitanman.com', role: 'patient', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
        { id: 'paid-1', full_name: 'Anjali Sharma', email: 'paid@nirogitanman.com', role: 'paid_user', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
        { id: 'doc-1', full_name: 'Dr. Sarah Mathews', email: 'doctor@nirogitanman.com', role: 'doctor', avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150' },
        { id: 'adm-1', full_name: 'Admin User', email: 'admin@nirogitanman.com', role: 'admin', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
      ];
      localStorage.setItem('nirogitanman_profiles', JSON.stringify(mockProfiles));
    }

    if (!localStorage.getItem('nirogitanman_doctors')) {
      const mockDoctors = [
        {
          id: 'doc-id-1',
          user_id: 'doc-1',
          full_name: 'Dr. Sarah Mathews',
          specialty: 'Cardiologist',
          experience: '12 Years',
          bio: 'Expert in preventive cardiology and lifestyle management for heart health.',
          availability: ['Monday', 'Wednesday', 'Friday'],
          image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
        },
        {
          id: 'doc-id-2',
          user_id: 'doc-2',
          full_name: 'Dr. Rohan Mehra',
          specialty: 'Nutritionist & Dietician',
          experience: '8 Years',
          bio: 'Specializes in metabolic disorders, sports nutrition, and custom health meal plans.',
          availability: ['Tuesday', 'Thursday', 'Saturday'],
          image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
        },
        {
          id: 'doc-id-3',
          user_id: 'doc-3',
          full_name: 'Dr. Priya Nair',
          specialty: 'General Physician',
          experience: '15 Years',
          bio: 'Dedicated to comprehensive primary care, chronic condition management, and preventative health.',
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          image_url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300'
        }
      ];
      localStorage.setItem('nirogitanman_doctors', JSON.stringify(mockDoctors));
    }

    if (!localStorage.getItem('nirogitanman_appointments')) {
      const mockAppointments = [
        {
          id: 'apt-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-id-1',
          appointment_date: '2026-08-01',
          appointment_time: '10:00 AM',
          status: 'confirmed',
          created_at: new Date().toISOString()
        },
        {
          id: 'apt-2',
          patient_id: 'paid-1',
          doctor_id: 'doc-id-2',
          appointment_date: '2026-08-03',
          appointment_time: '02:30 PM',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('nirogitanman_appointments', JSON.stringify(mockAppointments));
    }

    if (!localStorage.getItem('nirogitanman_consultations')) {
      const mockConsultations = [
        {
          id: 'con-1',
          appointment_id: 'apt-1',
          doctor_id: 'doc-id-1',
          patient_id: 'pat-1',
          notes: 'Patient exhibits normal blood pressure. Advised regular walking and reducing sodium intake.',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('nirogitanman_consultations', JSON.stringify(mockConsultations));
    }

    if (!localStorage.getItem('nirogitanman_medicines')) {
      const mockMedicines = [
        {
          id: 'med-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-id-1',
          name: 'Atorvastatin (10mg)',
          instructions: 'Take 1 tablet daily at night after dinner.',
          start_date: '2026-08-01',
          end_date: '2026-10-01'
        }
      ];
      localStorage.setItem('nirogitanman_medicines', JSON.stringify(mockMedicines));
    }

    if (!localStorage.getItem('nirogitanman_diet_plans')) {
      const mockDietPlans = [
        {
          id: 'diet-1',
          patient_id: 'pat-1',
          doctor_id: 'doc-id-2',
          title: 'Heart-Healthy Low Sodium Diet',
          goal: 'Reduce blood pressure and improve metabolic wellness',
          created_at: new Date().toISOString(),
          items: [
            { id: 'di-1', meal_type: 'breakfast', description: 'Oatmeal cooked with skimmed milk, topped with sliced almonds and fresh berries. One green tea.' },
            { id: 'di-2', meal_type: 'lunch', description: 'Brown rice, mixed vegetable curry, grilled paneer or chicken breast, and a green side salad.' },
            { id: 'di-3', meal_type: 'dinner', description: 'Multi-grain rotis, lentil soup (dal), and boiled spinach with low salt.' },
            { id: 'di-4', meal_type: 'snacks', description: 'Roasted chana or handful of mixed raw walnuts.' }
          ]
        },
        {
          id: 'diet-2',
          patient_id: 'paid-1',
          doctor_id: 'doc-id-2',
          title: 'High-Protein Performance Meal Plan (Premium)',
          goal: 'Muscle recovery, fat loss, and consistent daily energy levels',
          created_at: new Date().toISOString(),
          items: [
            { id: 'di-5', meal_type: 'breakfast', description: 'Scrambled eggs or tofu bhurji with spinach, 2 slices of whole-wheat toast, and black coffee.' },
            { id: 'di-6', meal_type: 'lunch', description: 'Quinoa bowl with grilled vegetables, chickpeas, olive oil dressing, and Greek yogurt.' },
            { id: 'di-7', meal_type: 'dinner', description: 'Baked salmon or lentil cutlets with steamed broccoli and sweet potato mash.' },
            { id: 'di-8', meal_type: 'snacks', description: 'Whey protein shake or protein bar, with sliced apples.' }
          ]
        }
      ];
      localStorage.setItem('nirogitanman_diet_plans', JSON.stringify(mockDietPlans));
    }
  }

  getData(key) {
    return JSON.parse(localStorage.getItem(`nirogitanman_${key}`) || '[]');
  }

  setData(key, data) {
    localStorage.setItem(`nirogitanman_${key}`, JSON.stringify(data));
  }
}

export const mockDb = isMockEnabled ? new MockDatabase() : null;
export const IS_MOCK = isMockEnabled;
