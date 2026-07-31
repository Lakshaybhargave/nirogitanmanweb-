import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dbService } from '../dbService';
import { supabase } from '../supabaseClient';
import { 
  User, Activity, Calendar, ClipboardList, Shield, LogOut, CheckCircle2, 
  Pill, MessageSquare, Send, Sparkles, Plus, 
  Users, Heart, Award, ArrowUpCircle, RefreshCw, Info
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  
  // Doctor form states
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docExperience, setDocExperience] = useState('');
  const [docBio, setDocBio] = useState('');
  
  // Booking Wizard states
  const [selectedDocId, setSelectedDocId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    { id: '1', text: "Hello! I am your Nirogitanman Wellness Assistant. How can I help you improve your daily habits today?", isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Doctor Consultation & Prescribe states
  const [selectedApt, setSelectedApt] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [medName, setMedName] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [medStartDate, setMedStartDate] = useState('');
  const [medEndDate, setMedEndDate] = useState('');
  
  // Doctor Diet Plan form states
  const [dietTitle, setDietTitle] = useState('');
  const [dietGoal, setDietGoal] = useState('');
  const [dietBreakfast, setDietBreakfast] = useState('');
  const [dietLunch, setDietLunch] = useState('');
  const [dietDinner, setDietDinner] = useState('');
  const [dietSnacks, setDietSnacks] = useState('');

  const navigate = useNavigate();

  const loadData = async (currentUser) => {
    try {
      setLoading(true);
      const docsList = await dbService.getDoctors();
      setDoctors(docsList);

      const aptsList = await dbService.getAppointments(currentUser.role, currentUser.id);
      setAppointments(aptsList);

      const consList = await dbService.getConsultations(currentUser.role, currentUser.id);
      setConsultations(consList);

      if (currentUser.role === 'patient' || currentUser.role === 'paid_user') {
        const meds = await dbService.getMedicines(currentUser.id);
        setMedicines(meds);
        const diet = await dbService.getDietPlan(currentUser.id);
        setDietPlan(diet);
      }

      if (currentUser.role === 'admin') {
        const users = await dbService.getUsersAdmin();
        setAdminUsers(users);
      }

      if (currentUser.role === 'doctor') {
        const myDocProfile = docsList.find(d => d.user_id === currentUser.id);
        if (myDocProfile) {
          setDocSpecialty(myDocProfile.specialty);
          setDocExperience(myDocProfile.experience);
          setDocBio(myDocProfile.bio);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await dbService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        await loadData(currentUser);
      }
    }
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const path = location.pathname;
    if (path === '/doctors') {
      setActiveTab(user.role === 'admin' ? 'doctors' : 'booking');
    } else if (path === '/appointments') {
      setActiveTab('appointments');
    } else if (path === '/medicines') {
      setActiveTab('medicines');
    } else if (path === '/diet-plan') {
      setActiveTab('diet');
    } else if (path === '/chat') {
      setActiveTab('chat');
    } else if (path === '/doctor') {
      if (user.role === 'doctor') {
        setActiveTab('overview');
      } else {
        navigate('/dashboard');
      }
    } else if (path === '/admin') {
      if (user.role === 'admin') {
        setActiveTab('overview');
      } else {
        navigate('/dashboard');
      }
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname, user, navigate]);

  const handleTabClick = (tabId) => {
    if (tabId === 'overview') {
      if (user?.role === 'doctor') {
        navigate('/doctor');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (tabId === 'booking') {
      navigate('/doctors');
    } else if (tabId === 'diet') {
      navigate('/diet-plan');
    } else if (tabId === 'chat') {
      navigate('/chat');
    } else {
      navigate(`/${tabId}`);
    }
  };


  const handleLogout = async () => {
    await dbService.signOut();
    navigate('/');
  };

  const handleUpgradeUser = async () => {
    if (!user) return;
    const targetRole = user.role === 'patient' ? 'paid_user' : 'patient';
    const updated = await dbService.updateUserRoleAdmin(user.id, targetRole);
    if (updated) {
      setUser(updated);
      // Reload current session state
      localStorage.setItem('nirogitanman_session', JSON.stringify(updated));
      alert(`Role successfully changed to: ${targetRole.toUpperCase()}`);
      await loadData(updated);
    }
  };

  // --- Patient Actions ---
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDocId || !bookDate || !bookTime) {
      alert('Please fill out all appointment details');
      return;
    }
    try {
      await dbService.bookAppointment(user.id, selectedDocId, bookDate, bookTime);
      setBookingSuccess(true);
      setSelectedDocId('');
      setBookDate('');
      // Refresh list
      await loadData(user);
      setTimeout(() => setBookingSuccess(false), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Doctor Actions ---
  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();
    try {
      await dbService.createOrUpdateDoctorProfile(user.id, {
        specialty: docSpecialty,
        experience: docExperience,
        bio: docBio,
        availability: ['Monday', 'Wednesday', 'Friday']
      });
      alert('Doctor profile successfully updated.');
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateAptStatus = async (aptId, status) => {
    try {
      await dbService.updateAppointmentStatus(aptId, status);
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;
    try {
      await dbService.addConsultationNotes(
        selectedApt.id,
        user.id,
        selectedApt.patient_id,
        consultationNotes
      );
      alert('Consultation completed successfully.');
      setConsultationNotes('');
      setSelectedApt(null);
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;
    try {
      await dbService.addMedicine(selectedApt.patient_id, user.id, {
        name: medName,
        instructions: medInstructions,
        start_date: medStartDate,
        end_date: medEndDate
      });
      alert('Medicine prescribed successfully.');
      setMedName('');
      setMedInstructions('');
      setMedStartDate('');
      setMedEndDate('');
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveDietPlan = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;
    try {
      const items = [
        { meal_type: 'breakfast', description: dietBreakfast },
        { meal_type: 'lunch', description: dietLunch },
        { meal_type: 'dinner', description: dietDinner },
        { meal_type: 'snacks', description: dietSnacks }
      ];
      await dbService.createOrUpdateDietPlan(
        selectedApt.patient_id,
        user.id,
        dietTitle,
        dietGoal,
        items
      );
      alert('Diet plan created/updated successfully.');
      setDietTitle('');
      setDietGoal('');
      setDietBreakfast('');
      setDietLunch('');
      setDietDinner('');
      setDietSnacks('');
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Admin Actions ---
  const handleAdminUpdateRole = async (userId, targetRole) => {
    try {
      await dbService.updateUserRoleAdmin(userId, targetRole);
      alert('User role updated successfully');
      await loadData(user);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Chatbot Actions ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now().toString(), text: chatInput, isBot: false };
    // Capture current messages before state update for the API call
    const currentMessages = [...chatMessages, userMsg];

    setChatMessages(currentMessages);
    setChatInput('');
    setChatLoading(true);

    // Add a blank bot placeholder that we will fill in as chunks arrive
    const botMsgId = (Date.now() + 1).toString();
    setChatMessages(prev => [...prev, { id: botMsgId, text: '', isBot: true }]);

    try {
      const apiMessages = currentMessages.map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      }));

      // P0 FIX: attach Supabase JWT so server can verify the user
      const authHeaders = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${session.access_token}`;
          authHeaders['x-user-id'] = session.user.id;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ messages: apiMessages, stream: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Each SSE chunk may contain multiple "data: ..." lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              // Update the placeholder message in-place
              setChatMessages(prev =>
                prev.map(m => m.id === botMsgId ? { ...m, text: accumulated } : m)
              );
            }
          } catch {
            // Ignore non-JSON lines (e.g. comments, empty lines)
          }
        }
      }

      // Final fallback if nothing was streamed
      if (!accumulated) {
        setChatMessages(prev =>
          prev.map(m => m.id === botMsgId ? { ...m, text: "I'm sorry, I couldn't process that." } : m)
        );
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev =>
        prev.map(m => m.id === botMsgId
          ? { ...m, text: 'Error connecting to AI service. Please try again later.' }
          : m
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestedPrompt = (promptText) => {
    setChatInput(promptText);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-muted-main font-medium">Loading Nirogitanman Dashboard...</span>
        </div>
      </div>
    );
  }

  // Define sidebar menu options based on role
  const menuItems = {
    patient: [
      { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
      { id: 'profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
      { id: 'booking', label: 'Book Doctor', icon: <Calendar className="h-5 w-5" /> },
      { id: 'appointments', label: 'Appointments', icon: <ClipboardList className="h-5 w-5" /> },
      { id: 'medicines', label: 'Medicines', icon: <Pill className="h-5 w-5" /> },
      { id: 'diet', label: 'Diet Plan', icon: <ClipboardList className="h-5 w-5" /> },
      { id: 'chat', label: 'Wellness Chat', icon: <MessageSquare className="h-5 w-5" /> }
    ],
    paid_user: [
      { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
      { id: 'profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
      { id: 'booking', label: 'Book Doctor', icon: <Calendar className="h-5 w-5" /> },
      { id: 'appointments', label: 'Appointments', icon: <ClipboardList className="h-5 w-5" /> },
      { id: 'medicines', label: 'Medicines', icon: <Pill className="h-5 w-5" /> },
      { id: 'diet', label: 'Diet Plan', icon: <ClipboardList className="h-5 w-5" /> },
      { id: 'chat', label: 'Wellness Chat', icon: <MessageSquare className="h-5 w-5" /> }
    ],
    doctor: [
      { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
      { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" /> },
      { id: 'consultations', label: 'Patient Consults', icon: <ClipboardList className="h-5 w-5" /> },
      { id: 'profile', label: 'Doctor Profile', icon: <User className="h-5 w-5" /> }
    ],
    admin: [
      { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
      { id: 'users', label: 'Manage Users', icon: <Users className="h-5 w-5" /> },
      { id: 'doctors', label: 'Manage Doctors', icon: <Shield className="h-5 w-5" /> }
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <div className="flex h-screen bg-brand-bg text-text-main overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-main p-6 shadow-subtle shrink-0">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary mb-8">
          <Heart className="h-6 w-6 text-accent-main fill-accent-main" />
          <span>Nirogitanman</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {currentMenu.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-text-main hover:bg-teal-50/50 hover:text-primary'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-semibold text-red-600 hover:bg-red-50 mt-auto transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main content container */}
      <div className="flex flex-col flex-grow overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-border-main py-4 px-6 md:px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 border border-border-main rounded-[10px]"
            >
              <Activity className="h-5 w-5 text-primary" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {user.role === 'paid_user' ? 'Premium Dashboard' : `${user.role.toUpperCase()} Portal`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'paid_user' && (
              <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                <Award className="h-3.5 w-3.5" />
                <span>PREMIUM</span>
              </span>
            )}
            <img 
              src={user.avatar_url} 
              alt={user.full_name} 
              className="h-9 w-9 rounded-full object-cover border border-border-main"
            />
            <span className="text-sm font-semibold hidden sm:inline">{user.full_name}</span>
          </div>
        </header>

        {/* Dynamic Mobile Menu Drawer */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="w-64 h-full bg-white p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 font-bold text-2xl text-primary">
                <Heart className="h-6 w-6 text-accent-main fill-accent-main" />
                <span>Nirogitanman</span>
              </div>
              <nav className="flex flex-col gap-2">
                {currentMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabClick(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-semibold transition-all ${
                      activeTab === item.id 
                        ? 'bg-primary text-white' 
                        : 'text-text-main hover:bg-teal-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-semibold text-red-600 hover:bg-red-50 mt-auto"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Panels Scroll Area */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* ========================================================================= */}
          {/* PATIENT & PREMIUM USER - OVERVIEW TAB */}
          {/* ========================================================================= */}
          {(user.role === 'patient' || user.role === 'paid_user') && activeTab === 'overview' && (
            <div className="flex flex-col gap-6 text-left">
              {/* Welcome Message Card */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-[16px] shadow-subtle relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                  <h2 className="text-2xl md:text-3xl font-bold">Namaste, {user.full_name}!</h2>
                  <p className="text-teal-55 text-sm md:text-base text-gray-100 leading-relaxed">
                    Track your healthcare consults, look up wellness goals, and access your active medicine logs here.
                  </p>
                  {user.role === 'patient' && (
                    <button 
                      onClick={handleUpgradeUser}
                      className="mt-4 w-fit flex items-center gap-2 bg-accent-main hover:bg-accent-hover text-text-main font-bold py-2 px-5 rounded-[10px] text-xs transition-all shadow-sm"
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      <span>Unlock Premium Diet Plans & Wellness Advice</span>
                    </button>
                  )}
                  {user.role === 'paid_user' && (
                    <button 
                      onClick={handleUpgradeUser}
                      className="mt-4 w-fit flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 border border-white/20 rounded-[10px] text-xs transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Switch to Patient View (Demo Tool)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-2">
                  <div className="flex justify-between items-center text-muted-main text-sm font-semibold">
                    <span>Upcoming Appointment</span>
                    <Calendar className="h-5 w-5 text-accent-main" />
                  </div>
                  {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length > 0 ? (
                    <div>
                      <span className="block text-lg font-bold text-text-main">
                        {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')[0].appointment_date}
                      </span>
                      <span className="text-xs text-muted-main">
                        with {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')[0].doctor?.full_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-main text-sm mt-1">No active appointments scheduled.</span>
                  )}
                </div>

                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-2">
                  <div className="flex justify-between items-center text-muted-main text-sm font-semibold">
                    <span>Active Diet Plan</span>
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  {dietPlan ? (
                    <div>
                      <span className="block text-lg font-bold text-text-main truncate">{dietPlan.title}</span>
                      <span className="text-xs text-muted-main">{dietPlan.goal}</span>
                    </div>
                  ) : (
                    <span className="text-muted-main text-sm mt-1">General Wellness Plan Assigned.</span>
                  )}
                </div>

                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-2">
                  <div className="flex justify-between items-center text-muted-main text-sm font-semibold">
                    <span>Medicines Log</span>
                    <Pill className="h-5 w-5 text-success-main" />
                  </div>
                  <span className="block text-2xl font-bold text-text-main">
                    {medicines.length} Prescribed
                  </span>
                  <span className="text-xs text-muted-main">Always follow physician directions.</span>
                </div>
              </div>

              {/* Overview Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Upcoming Bookings list */}
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                  <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
                  <div className="flex flex-col gap-3">
                    {appointments.slice(0, 3).map(apt => (
                      <div key={apt.id} className="flex justify-between items-center p-4 bg-brand-bg rounded-[12px] border border-border-main">
                        <div>
                          <h4 className="font-bold text-sm">{apt.doctor?.full_name}</h4>
                          <span className="text-xs text-muted-main">{apt.appointment_date} @ {apt.appointment_time}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                          apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-sm text-muted-main text-center py-4">No appointments found.</p>
                    )}
                  </div>
                </div>

                {/* Wellness Summary */}
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-4">
                  <h3 className="text-lg font-bold">Nirogitanman Health Checklist</h3>
                  <div className="flex flex-col gap-3 text-sm">
                    <label className="flex items-center gap-3 p-3 bg-brand-bg rounded-[12px] border border-border-main cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" defaultChecked className="rounded border-border-main accent-primary h-4 w-4" />
                      <span>Take morning multivitamin / medicine</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-brand-bg rounded-[12px] border border-border-main cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded border-border-main accent-primary h-4 w-4" />
                      <span>Consume high protein breakfast (Oats/Eggs)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-brand-bg rounded-[12px] border border-border-main cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded border-border-main accent-primary h-4 w-4" />
                      <span>Perform 30 minutes of low impact cardio/stretch</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MY PROFILE TAB */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-[16px] border border-border-main shadow-subtle max-w-2xl mx-auto text-left flex flex-col gap-6">
              <h3 className="text-2xl font-bold mb-2">My Profile</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border-main">
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name} 
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary"
                />
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  <h4 className="text-xl font-bold">{user.full_name}</h4>
                  <span className="text-sm text-muted-main">{user.email}</span>
                  <span className="w-fit mx-auto sm:mx-0 mt-2 bg-teal-50 border border-teal-100 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Registration Date</span>
                  <span className="font-semibold text-text-main">{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Age</span>
                  <span className="font-semibold text-text-main">{user.age ? `${user.age} Years` : 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Gender</span>
                  <span className="font-semibold text-text-main">{user.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Blood Group</span>
                  <span className="font-semibold text-text-main">{user.blood_group || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Mobile</span>
                  <span className="font-semibold text-text-main">{user.phone || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Diet</span>
                  <span className="font-semibold text-text-main">{user.diet || 'Not specified'}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Address</span>
                  <span className="font-semibold text-text-main whitespace-pre-wrap">{user.address || 'Not specified'}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="block text-xs font-bold text-muted-main uppercase tracking-wider mb-1">Language Preference</span>
                  <span className="font-semibold text-text-main">English / Hindi</span>
                </div>
              </div>

              {/* Upgrade tool inside profile for testing roles */}
              <div className="bg-teal-50/50 border border-teal-100 p-6 rounded-[12px] mt-4 flex flex-col gap-4">
                <h4 className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-accent-main" />
                  <span>Platform Switcher (Class Demo Tool)</span>
                </h4>
                <p className="text-xs text-muted-main leading-relaxed">
                  Upgrade or downgrade this account state instantly to test Premium Diet Plans, advanced suggestions, or regular client features.
                </p>
                <button 
                  onClick={handleUpgradeUser}
                  className="w-full sm:w-fit bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-[10px]"
                >
                  {user.role === 'patient' ? 'Upgrade to Premium User Role' : 'Downgrade to Standard Patient Role'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOOK DOCTOR TAB */}
          {/* ========================================================================= */}
          {activeTab === 'booking' && (
            <div className="flex flex-col gap-6 text-left">
              <h3 className="text-2xl font-bold">Book a Medical Consultation</h3>

              {bookingSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-[12px] flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Appointment requested successfully! You can track status in the "Appointments" tab.</span>
                </div>
              )}

              {/* Doctors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle shadow-card-hover flex flex-col gap-4">
                    <img 
                      src={doc.image_url} 
                      alt={doc.full_name} 
                      className="w-full h-44 object-cover rounded-[12px] border border-border-main"
                    />
                    <div>
                      <h4 className="font-bold text-lg">{doc.full_name}</h4>
                      <span className="text-xs text-primary font-bold">{doc.specialty} • {doc.experience}</span>
                    </div>
                    <p className="text-muted-main text-xs leading-relaxed line-clamp-3">
                      {doc.bio}
                    </p>
                    <div className="mt-2">
                      <span className="block text-xs font-bold text-muted-main mb-1">Weekly Availability:</span>
                      <div className="flex flex-wrap gap-1">
                        {doc.availability.map((day, dIdx) => (
                          <span key={dIdx} className="bg-brand-bg border border-border-main text-text-main text-[10px] px-2 py-0.5 rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        // scroll to booking form
                        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-auto bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-[10px]"
                    >
                      Select Doctor
                    </button>
                  </div>
                ))}
              </div>

              {/* Booking Scheduler Wizard */}
              <div id="booking-form" className="bg-white p-8 rounded-[16px] border border-border-main shadow-subtle mt-6 max-w-xl">
                <h4 className="font-bold text-lg mb-4">Complete Your Booking</h4>
                <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold">Choose Doctor</label>
                    <select 
                      value={selectedDocId}
                      onChange={e => setSelectedDocId(e.target.value)}
                      className="w-full p-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="">-- Choose practitioner --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.full_name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold">Consultation Date</label>
                      <input 
                        type="date"
                        required
                        value={bookDate}
                        onChange={e => setBookDate(e.target.value)}
                        className="w-full p-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold">Preffered Time</label>
                      <select 
                        value={bookTime}
                        onChange={e => setBookTime(e.target.value)}
                        className="w-full p-2.5 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-[10px] text-sm mt-2 transition-all shadow-subtle"
                  >
                    Confirm Appointment Bookings
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* APPOINTMENTS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle text-left">
              <h3 className="text-2xl font-bold mb-6">Appointments History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-main text-muted-main uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4">Doctor / Specialty</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id} className="border-b border-border-main hover:bg-brand-bg/50">
                        <td className="py-4 px-4 font-bold">{apt.doctor?.full_name}</td>
                        <td className="py-4 px-4 text-muted-main">{apt.appointment_date}</td>
                        <td className="py-4 px-4 text-muted-main">{apt.appointment_time}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                            apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                            apt.status === 'completed' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted-main py-8">No appointment records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MEDICINES TAB */}
          {/* ========================================================================= */}
          {activeTab === 'medicines' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle text-left">
              <h3 className="text-2xl font-bold mb-6">Prescribed Medicine Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-main text-muted-main uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4">Medicine Name</th>
                      <th className="py-3 px-4">Instructions</th>
                      <th className="py-3 px-4">Prescribed By</th>
                      <th className="py-3 px-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map(med => (
                      <tr key={med.id} className="border-b border-border-main hover:bg-brand-bg/50">
                        <td className="py-4 px-4 font-bold text-primary">{med.name}</td>
                        <td className="py-4 px-4 text-muted-main">{med.instructions}</td>
                        <td className="py-4 px-4 text-text-main font-semibold">{med.doctor?.full_name}</td>
                        <td className="py-4 px-4 text-xs text-muted-main">
                          {med.start_date} to {med.end_date}
                        </td>
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted-main py-8">No prescribed medicines currently on file.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DIET PLAN TAB */}
          {/* ========================================================================= */}
          {activeTab === 'diet' && (
            <div className="flex flex-col gap-6 text-left">
              <h3 className="text-2xl font-bold">My Personal Diet Plan</h3>

              {user.role === 'patient' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-[12px] flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Showing General Wellness Diet Plan</h5>
                    <p className="text-xs text-amber-800 mt-1">
                      Upgrade your account to "Paid User" to receive personalized advanced recommendations designed specifically by our certified clinical nutritionists.
                    </p>
                  </div>
                </div>
              )}

              {user.role === 'paid_user' && (
                <div className="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-[12px] flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Premium Personalized Diet Plan Activated</h5>
                    <p className="text-xs text-teal-800 mt-1">
                      Designed with calorie tracking and macro-nutrient balances matching your active metabolic logs.
                    </p>
                  </div>
                </div>
              )}

              {/* Diet Meals Grid */}
              <div className="bg-white p-8 rounded-[16px] border border-border-main shadow-subtle">
                <div className="mb-6 pb-4 border-b border-border-main">
                  <span className="text-xs uppercase font-bold text-primary tracking-wider">Active Goal</span>
                  <h4 className="text-xl font-bold mt-1">
                    {dietPlan ? dietPlan.title : 'General Fitness & Energy Balance'}
                  </h4>
                  <p className="text-muted-main text-sm mt-1">
                    {dietPlan ? dietPlan.goal : 'Maintain normal BMI, improve glycemic response, and support gut health.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { meal: 'breakfast', title: 'Breakfast (Morning)', color: 'border-yellow-400' },
                    { meal: 'lunch', title: 'Lunch (Afternoon)', color: 'border-green-500' },
                    { meal: 'dinner', title: 'Dinner (Evening)', color: 'border-indigo-600' },
                    { meal: 'snacks', title: 'Snacks & Hydration', color: 'border-amber-500' }
                  ].map((mealConfig, mIdx) => {
                    const matchedItem = dietPlan?.items?.find(it => it.meal_type === mealConfig.meal) || 
                      (user.role === 'paid_user' ? 
                        // Premium User defaults
                        { description: `High-Protein Option: ${mealConfig.meal === 'breakfast' ? 'Avocado toast + 3 egg whites' : mealConfig.meal === 'lunch' ? 'Lean chicken/tofu quinoa salad' : mealConfig.meal === 'dinner' ? 'Grilled salmon/lentils with asparagus' : 'Almond shake with chia seeds'}` } :
                        // Standard Patient defaults
                        { description: `General Option: ${mealConfig.meal === 'breakfast' ? 'Oatmeal with sliced fruit' : mealConfig.meal === 'lunch' ? 'Rice, dal, mixed vegetable curry' : mealConfig.meal === 'dinner' ? '2 multigrain rotis, green salad' : 'Fruit salad or green tea'}` }
                      );

                    return (
                      <div key={mIdx} className={`p-5 bg-brand-bg rounded-[12px] border-l-4 ${mealConfig.color} border border-border-main`}>
                        <h5 className="font-bold text-sm capitalize text-text-main mb-2">{mealConfig.title}</h5>
                        <p className="text-sm text-muted-main leading-relaxed">
                          {matchedItem.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* WELLNESS CHATBOT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle flex flex-col h-[550px] text-left">
              <div className="pb-4 border-b border-border-main shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-accent-main fill-accent-main" />
                    <span>Nirogitanman Wellness Assistant</span>
                  </h3>
                  <p className="text-xs text-muted-main mt-0.5">Disclaimer: Provides general lifestyle tips only. Not a medical diagnostician.</p>
                </div>
                <span className="bg-teal-50 border border-teal-200 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  AI ONLINE
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-grow overflow-y-auto py-4 flex flex-col gap-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-[12px] text-sm leading-relaxed ${
                      msg.isBot 
                        ? 'bg-brand-bg text-text-main border border-border-main' 
                        : 'bg-primary text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-brand-bg p-3.5 rounded-[12px] border border-border-main flex gap-1">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Prompts */}
              <div className="shrink-0 flex flex-wrap gap-2 py-2 border-t border-border-main text-xs">
                <button 
                  onClick={() => handleSuggestedPrompt('Give me healthy breakfast ideas')}
                  className="bg-brand-bg hover:bg-teal-50 hover:text-primary border border-border-main py-1.5 px-3 rounded-full transition-colors font-medium text-muted-main"
                >
                  "Healthy breakfast ideas"
                </button>
                <button 
                  onClick={() => handleSuggestedPrompt('How can I improve my sleep routine?')}
                  className="bg-brand-bg hover:bg-teal-50 hover:text-primary border border-border-main py-1.5 px-3 rounded-full transition-colors font-medium text-muted-main"
                >
                  "Improve sleep routine"
                </button>
                <button 
                  onClick={() => handleSuggestedPrompt('What are some simple wellness habits?')}
                  className="bg-brand-bg hover:bg-teal-50 hover:text-primary border border-border-main py-1.5 px-3 rounded-full transition-colors font-medium text-muted-main"
                >
                  "Daily wellness habits"
                </button>
              </div>

              {/* Send Box */}
              <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask for dietary ideas or daily tips..."
                  className="flex-grow p-3 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary text-sm"
                />
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-hover text-white p-3 rounded-[10px] flex items-center justify-center transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DOCTOR VIEW - APPOINTMENTS TAB */}
          {/* ========================================================================= */}
          {user.role === 'doctor' && activeTab === 'appointments' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle text-left">
              <h3 className="text-2xl font-bold mb-6">Patient Consultation Queue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-main text-muted-main uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Appointment Date</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id} className="border-b border-border-main hover:bg-brand-bg/50">
                        <td className="py-4 px-4 font-bold flex items-center gap-2">
                          <img src={apt.patient?.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                          <span>{apt.patient?.full_name}</span>
                        </td>
                        <td className="py-4 px-4 text-muted-main">{apt.appointment_date}</td>
                        <td className="py-4 px-4 text-muted-main">{apt.appointment_time}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            apt.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            apt.status === 'completed' ? 'bg-teal-50 text-teal-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateAptStatus(apt.id, 'confirmed')}
                                className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold py-1.5 px-3 rounded"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => handleUpdateAptStatus(apt.id, 'cancelled')}
                                className="border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold py-1.5 px-3 rounded"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button 
                              onClick={() => {
                                setSelectedApt(apt);
                                setActiveTab('consultations');
                              }}
                              className="bg-accent-main hover:bg-accent-hover text-text-main text-[11px] font-bold py-1.5 px-3 rounded flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Prescribe & Consult</span>
                            </button>
                          )}
                          {apt.status === 'completed' && (
                            <span className="text-xs text-muted-main">Notes Written</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DOCTOR VIEW - CONSULTATIONS TAB */}
          {/* ========================================================================= */}
          {user.role === 'doctor' && activeTab === 'consultations' && (
            <div className="flex flex-col gap-6 text-left">
              <h3 className="text-2xl font-bold">Write Consultation & Recommendations</h3>
              
              {!selectedApt ? (
                <div className="bg-white p-6 rounded-[16px] border border-border-main text-center py-12">
                  <Calendar className="h-10 w-10 text-muted-main mx-auto mb-2" />
                  <h4 className="font-bold text-lg">No Patient Selected</h4>
                  <p className="text-muted-main text-sm max-w-xs mx-auto mt-1">
                    Please visit the "Appointments" tab and click "Prescribe & Consult" on an active confirmed booking slot.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Consultation Notes Form */}
                  <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                    <div className="mb-4 pb-3 border-b border-border-main flex items-center gap-3">
                      <img src={selectedApt.patient?.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                      <div>
                        <h4 className="font-bold">{selectedApt.patient?.full_name}</h4>
                        <span className="text-xs text-muted-main">Consultation Slot: {selectedApt.appointment_date}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveConsultation} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold">Doctor Clinical Notes</label>
                        <textarea
                          required
                          value={consultationNotes}
                          onChange={e => setConsultationNotes(e.target.value)}
                          placeholder="Describe symptoms, assessment, and medical directions..."
                          rows="6"
                          className="w-full p-3 bg-brand-bg border border-border-main rounded-[10px] focus:outline-none focus:border-primary text-sm"
                        ></textarea>
                      </div>
                      <button 
                        type="submit"
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-[10px] text-xs transition-all"
                      >
                        Submit Consultation Notes & Complete Call
                      </button>
                    </form>
                  </div>

                  {/* Recommendations Stack (Medicines + Diet) */}
                  <div className="flex flex-col gap-6">
                    {/* Add Medicine Prescribe form */}
                    <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                      <h4 className="font-bold text-sm uppercase text-primary tracking-wider mb-4">Prescribe Medicine</h4>
                      <form onSubmit={handleAddMedicine} className="flex flex-col gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <label className="font-semibold">Medicine Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Atorvastatin (10mg) or Vitamin D"
                            value={medName}
                            onChange={e => setMedName(e.target.value)}
                            className="p-2 bg-brand-bg border border-border-main rounded focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-semibold">Directions & Dosage</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Take 1 tablet daily after food"
                            value={medInstructions}
                            onChange={e => setMedInstructions(e.target.value)}
                            className="p-2 bg-brand-bg border border-border-main rounded focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Start Date</label>
                            <input 
                              type="date" 
                              required
                              value={medStartDate}
                              onChange={e => setMedStartDate(e.target.value)}
                              className="p-2 bg-brand-bg border border-border-main rounded focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">End Date</label>
                            <input 
                              type="date" 
                              required
                              value={medEndDate}
                              onChange={e => setMedEndDate(e.target.value)}
                              className="p-2 bg-brand-bg border border-border-main rounded focus:outline-none"
                            />
                          </div>
                        </div>
                        <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 rounded mt-2">
                          Add Prescription Record
                        </button>
                      </form>
                    </div>

                    {/* Create Diet Plan form */}
                    <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                      <h4 className="font-bold text-sm uppercase text-primary tracking-wider mb-4">Set Nutritional Plan</h4>
                      <form onSubmit={handleSaveDietPlan} className="flex flex-col gap-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Diet Title</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Heart Healthy / Low Sodium"
                              value={dietTitle}
                              onChange={e => setDietTitle(e.target.value)}
                              className="p-2 bg-brand-bg border border-border-main rounded"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Overall Goal</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Weight management"
                              value={dietGoal}
                              onChange={e => setDietGoal(e.target.value)}
                              className="p-2 bg-brand-bg border border-border-main rounded"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Breakfast Item</label>
                            <input type="text" required placeholder="Oats & berries" value={dietBreakfast} onChange={e => setDietBreakfast(e.target.value)} className="p-2 bg-brand-bg border border-border-main rounded" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Lunch Item</label>
                            <input type="text" required placeholder="Quinoa bowl & chicken" value={dietLunch} onChange={e => setDietLunch(e.target.value)} className="p-2 bg-brand-bg border border-border-main rounded" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Dinner Item</label>
                            <input type="text" required placeholder="Rotis & lentils" value={dietDinner} onChange={e => setDietDinner(e.target.value)} className="p-2 bg-brand-bg border border-border-main rounded" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-semibold">Snack Option</label>
                            <input type="text" required placeholder="Walnuts / Green tea" value={dietSnacks} onChange={e => setDietSnacks(e.target.value)} className="p-2 bg-brand-bg border border-border-main rounded" />
                          </div>
                        </div>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded mt-2">
                          Assign Custom Diet Plan
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* DOCTOR VIEW - PROFILE SETTINGS */}
          {/* ========================================================================= */}
          {user.role === 'doctor' && activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-[16px] border border-border-main shadow-subtle max-w-xl mx-auto text-left flex flex-col gap-6">
              <h3 className="text-xl font-bold">Manage Doctor Profile</h3>
              <form onSubmit={handleSaveDoctorProfile} className="flex flex-col gap-4 text-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold">Medical Specialty</label>
                  <input
                    type="text"
                    required
                    value={docSpecialty}
                    onChange={e => setDocSpecialty(e.target.value)}
                    placeholder="e.g. Cardiologist, Dermatologist, General Practitioner"
                    className="p-2.5 bg-brand-bg border border-border-main rounded-[10px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold">Experience Years</label>
                  <input
                    type="text"
                    required
                    value={docExperience}
                    onChange={e => setDocExperience(e.target.value)}
                    placeholder="e.g. 10 Years"
                    className="p-2.5 bg-brand-bg border border-border-main rounded-[10px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold">Professional Biography</label>
                  <textarea
                    required
                    value={docBio}
                    onChange={e => setDocBio(e.target.value)}
                    placeholder="Describe your medical background and care philosophy..."
                    rows="4"
                    className="p-2.5 bg-brand-bg border border-border-main rounded-[10px] text-sm"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-[10px]"
                >
                  Save Practice Credentials
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN - OVERVIEW TAB */}
          {/* ========================================================================= */}
          {user.role === 'admin' && activeTab === 'overview' && (
            <div className="flex flex-col gap-6 text-left">
              <h3 className="text-2xl font-bold">Admin Statistics Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                  <span className="text-muted-main text-xs uppercase font-bold tracking-wider">Total Users</span>
                  <span className="block text-3xl font-extrabold mt-1 text-primary">{adminUsers.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                  <span className="text-muted-main text-xs uppercase font-bold tracking-wider">Doctors Registered</span>
                  <span className="block text-3xl font-extrabold mt-1 text-secondary">{doctors.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                  <span className="text-muted-main text-xs uppercase font-bold tracking-wider">Appointments</span>
                  <span className="block text-3xl font-extrabold mt-1 text-accent-main">{appointments.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle">
                  <span className="text-muted-main text-xs uppercase font-bold tracking-wider">Database Mode</span>
                  <span className="block text-sm font-extrabold mt-2 text-success-main uppercase">
                    {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === 'mock_key_or_insert_real_key_here' ? 'LOCAL MOCK STORAGE' : 'SUPABASE CLOUD'}
                  </span>
                </div>
              </div>

              {/* Quick info alert */}
              <div className="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-[12px] flex items-center gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <span className="text-xs">
                  This console allows admins to audit database tables and toggle roles instantly. Perfect for presenting during viva, evaluations, or code review.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN - MANAGE USERS */}
          {/* ========================================================================= */}
          {user.role === 'admin' && activeTab === 'users' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle text-left">
              <h3 className="text-2xl font-bold mb-6">User Accounts & Access Levels</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-main text-muted-main uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Toggle Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => (
                      <tr key={u.id} className="border-b border-border-main hover:bg-brand-bg/50">
                        <td className="py-4 px-4 font-bold flex items-center gap-2">
                          <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                          <span>{u.full_name}</span>
                        </td>
                        <td className="py-4 px-4 text-muted-main">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            u.role === 'admin' ? 'bg-red-50 text-red-700' :
                            u.role === 'doctor' ? 'bg-indigo-50 text-indigo-700' :
                            u.role === 'paid_user' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-teal-50 text-teal-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex gap-2">
                          <button
                            onClick={() => handleAdminUpdateRole(u.id, 'patient')}
                            className="text-xs bg-brand-bg border border-border-main hover:bg-teal-50 py-1 px-2.5 rounded font-semibold text-text-main"
                          >
                            Patient
                          </button>
                          <button
                            onClick={() => handleAdminUpdateRole(u.id, 'paid_user')}
                            className="text-xs bg-brand-bg border border-border-main hover:bg-amber-50 py-1 px-2.5 rounded font-semibold text-text-main"
                          >
                            Paid
                          </button>
                          <button
                            onClick={() => handleAdminUpdateRole(u.id, 'doctor')}
                            className="text-xs bg-brand-bg border border-border-main hover:bg-indigo-50 py-1 px-2.5 rounded font-semibold text-text-main"
                          >
                            Doctor
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN - MANAGE DOCTORS */}
          {/* ========================================================================= */}
          {user.role === 'admin' && activeTab === 'doctors' && (
            <div className="bg-white p-6 rounded-[16px] border border-border-main shadow-subtle text-left">
              <h3 className="text-2xl font-bold mb-6">Registered Medical Practitioners</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-main text-muted-main uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4">Doctor Name</th>
                      <th className="py-3 px-4">Specialty</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doc => (
                      <tr key={doc.id} className="border-b border-border-main hover:bg-brand-bg/50">
                        <td className="py-4 px-4 font-bold flex items-center gap-2">
                          <img src={doc.image_url} alt="" className="h-8 w-8 rounded-full" />
                          <span>{doc.full_name}</span>
                        </td>
                        <td className="py-4 px-4 text-primary font-semibold">{doc.specialty}</td>
                        <td className="py-4 px-4 text-muted-main">{doc.experience}</td>
                        <td className="py-4 px-4 text-green-600 font-semibold uppercase text-xs">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
