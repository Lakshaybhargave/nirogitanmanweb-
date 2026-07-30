import { supabase, IS_MOCK, mockDb } from './supabaseClient';

export const dbService = {
  // --- AUTH SERVICES ---
  async signUp(email, password, fullName, role, additionalInfo = {}) {
    if (IS_MOCK) {
      const profiles = mockDb.getData('profiles');
      if (profiles.some(p => p.email === email)) {
        throw new Error('User already exists');
      }
      const newId = 'user-' + Math.random().toString(36).substr(2, 9);
      const newProfile = {
        id: `mock-user-${Date.now()}`,
        full_name: fullName,
        email,
        role,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        created_at: new Date().toISOString(),
        age: additionalInfo.age || null,
        gender: additionalInfo.gender || null,
        blood_group: additionalInfo.bloodGroup || null,
        phone: additionalInfo.phone || null,
        diet: additionalInfo.diet || null,
        address: additionalInfo.address || null
      };
      profiles.push(newProfile);
      mockDb.setData('profiles', profiles);
      localStorage.setItem('nirogitanman_session', JSON.stringify(newProfile));
      return { data: { user: { id: newId } }, error: null };
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            age: additionalInfo.age || null,
            gender: additionalInfo.gender || null,
            blood_group: additionalInfo.bloodGroup || null,
            phone: additionalInfo.phone || null,
            diet: additionalInfo.diet || null,
            address: additionalInfo.address || null
          }
        }
      });
      return { data, error };
    }
  },

  async signIn(email, password) {
    if (IS_MOCK) {
      const profiles = mockDb.getData('profiles');
      const user = profiles.find(p => p.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      // In mock mode, we accept any password as long as the user exists
      localStorage.setItem('nirogitanman_session', JSON.stringify(user));
      return { data: { user: { id: user.id }, session: { user } }, error: null };
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    }
  },

  async signOut() {
    if (IS_MOCK) {
      localStorage.removeItem('nirogitanman_session');
      return { error: null };
    } else {
      const { error } = await supabase.auth.signOut();
      return { error };
    }
  },

  async getCurrentUser() {
    if (IS_MOCK) {
      const session = localStorage.getItem('nirogitanman_session');
      return session ? JSON.parse(session) : null;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile || null;
    }
  },

  // --- DOCTOR SERVICES ---
  async getDoctors() {
    if (IS_MOCK) {
      return mockDb.getData('doctors');
    } else {
      const { data, error } = await supabase.from('doctors').select('*');
      return data || [];
    }
  },

  async createOrUpdateDoctorProfile(userId, doctorData) {
    if (IS_MOCK) {
      const doctors = mockDb.getData('doctors');
      const profiles = mockDb.getData('profiles');
      const docProfile = profiles.find(p => p.id === userId);
      const doctorIndex = doctors.findIndex(d => d.user_id === userId);
      
      const updatedDoctor = {
        id: doctorIndex >= 0 ? doctors[doctorIndex].id : 'doc-id-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        full_name: docProfile?.full_name || 'Dr. Doctor',
        specialty: doctorData.specialty,
        experience: doctorData.experience,
        bio: doctorData.bio,
        availability: doctorData.availability || ['Monday', 'Tuesday', 'Wednesday'],
        image_url: doctorData.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        created_at: new Date().toISOString()
      };

      if (doctorIndex >= 0) {
        doctors[doctorIndex] = updatedDoctor;
      } else {
        doctors.push(updatedDoctor);
      }
      mockDb.setData('doctors', doctors);
      return updatedDoctor;
    } else {
      const { data, error } = await supabase
        .from('doctors')
        .upsert({ user_id: userId, ...doctorData })
        .select()
        .single();
      return data;
    }
  },

  // --- APPOINTMENTS ---
  async getAppointments(role, userId) {
    if (IS_MOCK) {
      const appointments = mockDb.getData('appointments');
      const doctors = mockDb.getData('doctors');
      const profiles = mockDb.getData('profiles');
      
      if (role === 'doctor') {
        const doctor = doctors.find(d => d.user_id === userId);
        if (!doctor) return [];
        return appointments
          .filter(a => a.doctor_id === doctor.id)
          .map(a => ({
            ...a,
            patient: profiles.find(p => p.id === a.patient_id) || { full_name: 'Unknown Patient' }
          }));
      } else if (role === 'admin') {
        return appointments.map(a => {
          const doc = doctors.find(d => d.id === a.doctor_id);
          return {
            ...a,
            patient: profiles.find(p => p.id === a.patient_id) || { full_name: 'Unknown Patient' },
            doctor: doc ? { ...doc, full_name: doc.full_name } : { full_name: 'Unknown Doctor' }
          };
        });
      } else {
        // Patient or Paid User
        return appointments
          .filter(a => a.patient_id === userId)
          .map(a => {
            const doc = doctors.find(d => d.id === a.doctor_id);
            return {
              ...a,
              doctor: doc ? { ...doc, full_name: doc.full_name } : { full_name: 'Unknown Doctor' }
            };
          });
      }
    } else {
      let query = supabase.from('appointments').select(`
        *,
        patient:profiles!patient_id(full_name, email, avatar_url),
        doctor:doctors!doctor_id(id, specialty, profiles!user_id(full_name))
      `);
      
      if (role === 'doctor') {
        const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', userId).single();
        if (!doc) return [];
        query = query.eq('doctor_id', doc.id);
      } else if (role !== 'admin') {
        query = query.eq('patient_id', userId);
      }
      
      const { data, error } = await query;
      return (data || []).map(a => ({
        ...a,
        doctor: a.doctor ? { ...a.doctor, full_name: a.doctor.profiles?.full_name || 'Doctor' } : null
      }));
    }
  },

  async bookAppointment(patientId, doctorId, date, time) {
    if (IS_MOCK) {
      const appointments = mockDb.getData('appointments');
      const newApt = {
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: date,
        appointment_time: time,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      appointments.push(newApt);
      mockDb.setData('appointments', appointments);
      return newApt;
    } else {
      const { data, error } = await supabase
        .from('appointments')
        .insert({ patient_id: patientId, doctor_id: doctorId, appointment_date: date, appointment_time: time, status: 'pending' })
        .select()
        .single();
      return data;
    }
  },

  async updateAppointmentStatus(appointmentId, status) {
    if (IS_MOCK) {
      const appointments = mockDb.getData('appointments');
      const idx = appointments.findIndex(a => a.id === appointmentId);
      if (idx >= 0) {
        appointments[idx].status = status;
        mockDb.setData('appointments', appointments);
        return appointments[idx];
      }
      return null;
    } else {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();
      return data;
    }
  },

  // --- CONSULTATIONS & NOTES ---
  async getConsultations(role, userId) {
    if (IS_MOCK) {
      const consultations = mockDb.getData('consultations');
      const doctors = mockDb.getData('doctors');
      const profiles = mockDb.getData('profiles');

      if (role === 'doctor') {
        const doctor = doctors.find(d => d.user_id === userId);
        if (!doctor) return [];
        return consultations
          .filter(c => c.doctor_id === doctor.id)
          .map(c => ({
            ...c,
            patient: profiles.find(p => p.id === c.patient_id) || { full_name: 'Unknown Patient' }
          }));
      } else {
        return consultations
          .filter(c => c.patient_id === userId)
          .map(c => {
            const doc = doctors.find(d => d.id === c.doctor_id);
            return {
              ...c,
              doctor: doc ? { ...doc, full_name: doc.full_name } : { full_name: 'Unknown Doctor' }
            };
          });
      }
    } else {
      let query = supabase.from('consultations').select(`
        *,
        patient:profiles!patient_id(full_name, email),
        doctor:doctors!doctor_id(id, specialty, profiles!user_id(full_name))
      `);
      if (role === 'doctor') {
        const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', userId).single();
        if (!doc) return [];
        query = query.eq('doctor_id', doc.id);
      } else if (role !== 'admin') {
        query = query.eq('patient_id', userId);
      }
      const { data } = await query;
      return (data || []).map(c => ({
        ...c,
        doctor: c.doctor ? { ...c.doctor, full_name: c.doctor.profiles?.full_name } : null
      }));
    }
  },

  async addConsultationNotes(appointmentId, doctorUserId, patientId, notes) {
    if (IS_MOCK) {
      const consultations = mockDb.getData('consultations');
      const doctors = mockDb.getData('doctors');
      const doctor = doctors.find(d => d.user_id === doctorUserId);
      if (!doctor) throw new Error('Doctor not found');

      // Update appointment status to completed
      await this.updateAppointmentStatus(appointmentId, 'completed');

      const newConsultation = {
        id: 'con-' + Math.random().toString(36).substr(2, 9),
        appointment_id: appointmentId,
        doctor_id: doctor.id,
        patient_id: patientId,
        notes,
        created_at: new Date().toISOString()
      };
      consultations.push(newConsultation);
      mockDb.setData('consultations', consultations);
      return newConsultation;
    } else {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', doctorUserId).single();
      if (!doc) throw new Error('Doctor not found');

      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);

      const { data, error } = await supabase
        .from('consultations')
        .insert({ appointment_id: appointmentId, doctor_id: doc.id, patient_id: patientId, notes })
        .select()
        .single();
      return data;
    }
  },

  // --- MEDICINE RECORDS ---
  async getMedicines(patientId) {
    if (IS_MOCK) {
      const medicines = mockDb.getData('medicines');
      const doctors = mockDb.getData('doctors');
      return medicines
        .filter(m => m.patient_id === patientId)
        .map(m => {
          const doc = doctors.find(d => d.id === m.doctor_id);
          return {
            ...m,
            doctor: doc ? { full_name: doc.full_name } : { full_name: 'Unknown Doctor' }
          };
        });
    } else {
      const { data } = await supabase
        .from('medicines')
        .select(`
          *,
          doctor:doctors!doctor_id(id, profiles!user_id(full_name))
        `)
        .eq('patient_id', patientId);
      return (data || []).map(m => ({
        ...m,
        doctor: m.doctor ? { full_name: m.doctor.profiles?.full_name } : null
      }));
    }
  },

  async addMedicine(patientId, doctorUserId, medicineData) {
    if (IS_MOCK) {
      const medicines = mockDb.getData('medicines');
      const doctors = mockDb.getData('doctors');
      const doctor = doctors.find(d => d.user_id === doctorUserId);
      if (!doctor) throw new Error('Doctor not found');

      const newMedicine = {
        id: 'med-' + Math.random().toString(36).substr(2, 9),
        patient_id: patientId,
        doctor_id: doctor.id,
        name: medicineData.name,
        instructions: medicineData.instructions,
        start_date: medicineData.start_date,
        end_date: medicineData.end_date,
        created_at: new Date().toISOString()
      };
      medicines.push(newMedicine);
      mockDb.setData('medicines', medicines);
      return newMedicine;
    } else {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', doctorUserId).single();
      if (!doc) throw new Error('Doctor not found');

      const { data, error } = await supabase
        .from('medicines')
        .insert({
          patient_id: patientId,
          doctor_id: doc.id,
          name: medicineData.name,
          instructions: medicineData.instructions,
          start_date: medicineData.start_date,
          end_date: medicineData.end_date
        })
        .select()
        .single();
      return data;
    }
  },

  // --- DIET PLAN SERVICES ---
  async getDietPlan(patientId) {
    if (IS_MOCK) {
      const dietPlans = mockDb.getData('diet_plans');
      return dietPlans.find(d => d.patient_id === patientId) || null;
    } else {
      const { data } = await supabase
        .from('diet_plans')
        .select(`
          *,
          items:diet_plan_items(*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      return data && data.length > 0 ? data[0] : null;
    }
  },

  async createOrUpdateDietPlan(patientId, doctorUserId, title, goal, items) {
    if (IS_MOCK) {
      const dietPlans = mockDb.getData('diet_plans');
      const doctors = mockDb.getData('doctors');
      const doctor = doctors.find(d => d.user_id === doctorUserId);
      if (!doctor) throw new Error('Doctor not found');

      const existingIndex = dietPlans.findIndex(d => d.patient_id === patientId);
      
      const newPlan = {
        id: existingIndex >= 0 ? dietPlans[existingIndex].id : 'diet-' + Math.random().toString(36).substr(2, 9),
        patient_id: patientId,
        doctor_id: doctor.id,
        title,
        goal,
        created_at: new Date().toISOString(),
        items: items.map((it, index) => ({
          id: 'di-' + Math.random().toString(36).substr(2, 9) + index,
          meal_type: it.meal_type,
          description: it.description
        }))
      };

      if (existingIndex >= 0) {
        dietPlans[existingIndex] = newPlan;
      } else {
        dietPlans.push(newPlan);
      }
      mockDb.setData('diet_plans', dietPlans);
      return newPlan;
    } else {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', doctorUserId).single();
      if (!doc) throw new Error('Doctor not found');

      // Create new plan
      const { data: plan, error: planError } = await supabase
        .from('diet_plans')
        .insert({ patient_id: patientId, doctor_id: doc.id, title, goal })
        .select()
        .single();
      
      if (planError) throw planError;

      // Insert items
      const insertItems = items.map(item => ({
        diet_plan_id: plan.id,
        meal_type: item.meal_type,
        description: item.description
      }));
      
      const { error: itemsError } = await supabase.from('diet_plan_items').insert(insertItems);
      if (itemsError) throw itemsError;

      return { ...plan, items: insertItems };
    }
  },

  // --- ADMIN & USER MANAGEMENT ---
  async getUsersAdmin() {
    if (IS_MOCK) {
      return mockDb.getData('profiles');
    } else {
      const { data } = await supabase.from('profiles').select('*');
      return data || [];
    }
  },

  async updateUserRoleAdmin(userId, role) {
    if (IS_MOCK) {
      const profiles = mockDb.getData('profiles');
      const idx = profiles.findIndex(p => p.id === userId);
      if (idx >= 0) {
        profiles[idx].role = role;
        mockDb.setData('profiles', profiles);
        return profiles[idx];
      }
      return null;
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      return data;
    }
  }
};
