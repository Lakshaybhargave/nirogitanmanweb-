import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Heart, Activity, ShieldCheck, ClipboardCheck, ArrowRight, Star, HelpCircle } from 'lucide-react';

export default function Home() {
  const services = [
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: 'Online Doctor Consultations',
      desc: 'Seamlessly schedule virtual meetings with certified specialists, select dates, and receive detailed medical feedback.'
    },
    {
      icon: <ClipboardCheck className="h-8 w-8 text-secondary" />,
      title: 'Personalized Diet Plans',
      desc: 'Get curated meal recommendations, daily dietary goals, and fitness insights tailormade for your body metrics (Premium).'
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-accent-main" />,
      title: 'Medicine Logbooks',
      desc: 'Keep records of prescribed dosages, frequencies, start/end dates, and doctor instructions in one single dashboard.'
    },
    {
      icon: <Heart className="h-8 w-8 text-success-main" />,
      title: 'AI Wellness Assistant',
      desc: 'Engage with our smart chatbot to retrieve healthy food ideas, sleeping guides, and lifestyle coaching.'
    }
  ];

  const steps = [
    { num: '01', title: 'Register & Log In', desc: 'Create your secure account and select your health profile.' },
    { num: '02', title: 'Consult a Doctor', desc: 'Pick your preferred healthcare professional and choose a convenient time slot.' },
    { num: '03', title: 'Receive Prescription & Diets', desc: 'Get your official digital records, medicine guidelines, and nutritional goals.' },
    { num: '04', title: 'Follow & Track Progress', desc: 'Track your routines on our responsive mobile-ready web portal.' }
  ];

  const faqs = [
    { q: 'Is Nirogitanman a replacement for emergency healthcare?', a: 'No, Nirogitanman is designed for general wellness advice, routine consultations, and record tracking. For medical emergencies, please visit your nearest hospital immediately.' },
    { q: 'What additional benefits do Paid Users get?', a: 'Paid Users gain access to highly customized diet plans designed by specialists, extended chatbot queries, and history analysis tools.' },
    { q: 'Can I cancel or reschedule my appointments?', a: 'Yes, patients can manage, cancel, or reschedule active bookings from their patient dashboard.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-text-main">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-primary py-1.5 px-4 rounded-full text-sm font-semibold w-fit">
            <Activity className="h-4 w-4" />
            <span>Digital-First Healthcare & Wellness</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-main leading-tight">
            Your Trusted Partner in <span className="text-primary">Holistic Health</span> & Wellness
          </h1>
          <p className="text-muted-main text-lg max-w-lg">
            Nirogitanman combines professional doctor teleconsultation, personalized diet tracking, and wellness AI assistants to help you build and maintain a healthier lifestyle.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link 
              to="/signup" 
              className="bg-primary hover:bg-primary-hover text-white py-3.5 px-8 rounded-[10px] font-bold transition-all shadow-subtle flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/login?redirect=booking" 
              className="bg-white border border-border-main hover:bg-gray-50 text-text-main py-3.5 px-8 rounded-[10px] font-bold transition-all"
            >
              Book Consultation
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-[16px] transform rotate-3"></div>
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600" 
            alt="Healthcare professionals smiling" 
            className="relative z-10 w-full h-[350px] md:h-[450px] object-cover rounded-[16px] shadow-subtle border border-border-main"
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-main">Our Comprehensive Services</h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
          <p className="text-muted-main max-w-xl">
            Everything you need to plan, track, and sustain your health and wellness goals, accessible from any device.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((srv, idx) => (
            <div 
              key={idx} 
              className="bg-brand-bg p-8 rounded-[16px] border border-border-main shadow-subtle shadow-card-hover flex flex-col gap-5 text-left"
            >
              <div className="p-3 bg-white w-fit rounded-[12px] shadow-sm">
                {srv.icon}
              </div>
              <h3 className="text-xl font-semibold text-text-main">{srv.title}</h3>
              <p className="text-muted-main text-sm leading-relaxed">{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600" 
            alt="Healthy yoga lifestyle" 
            className="w-full h-[400px] object-cover rounded-[16px] shadow-subtle border border-border-main"
          />
        </div>
        <div className="flex flex-col gap-6 text-left order-1 lg:order-2">
          <h2 className="text-3xl md:text-4xl font-bold text-text-main">About Nirogitanman</h2>
          <div className="h-1 w-16 bg-primary rounded"></div>
          <p className="text-muted-main leading-relaxed">
            Nirogitanman translates to "Healthy Body and Mind." We believe that wellness isn't just about treating illnesses—it's about proactively nourishing your life.
          </p>
          <p className="text-muted-main leading-relaxed">
            By connecting users to verified medical professionals, creating customized high-protein or heart-healthy nutritional pathways, and giving you logs to track prescriptions, we aim to put your health metrics directly in your hands.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border-l-4 border-primary pl-4">
              <span className="block text-2xl font-bold text-primary">100%</span>
              <span className="text-sm text-muted-main">Verified Practitioners</span>
            </div>
            <div className="border-l-4 border-secondary pl-4">
              <span className="block text-2xl font-bold text-secondary">Offline-Enabled</span>
              <span className="text-sm text-muted-main">Reliable Classroom Demos</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-main">How Nirogitanman Works</h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st, idx) => (
            <div key={idx} className="flex flex-col gap-4 text-left relative">
              <span className="text-5xl font-extrabold text-teal-100">{st.num}</span>
              <h3 className="text-xl font-bold text-text-main mt-[-10px]">{st.title}</h3>
              <p className="text-muted-main text-sm leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-main">Success Stories</h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              text: "The telemedicine portal is so fast. Booking an appointment took me less than 2 minutes, and the diet recommendations changed my gym recovery completely.",
              name: "Ankit Roy",
              role: "Paid User",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
            },
            {
              text: "Keeping track of my grandparents' blood pressure medicines has never been easier. The dashboard records the doctor instructions clearly.",
              name: "Sanya Gupta",
              role: "Regular Patient",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            },
            {
              text: "As a doctor, the consultation workflow is straightforward. I can quickly prescribe medicines and update custom diet plans for my patients.",
              name: "Dr. Sarah Mathews",
              role: "Cardiologist",
              avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[16px] border border-border-main shadow-subtle flex flex-col gap-6 text-left">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent-main text-accent-main" />
                ))}
              </div>
              <p className="text-text-main italic text-sm leading-relaxed">"{item.text}"</p>
              <div className="flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <span className="text-xs text-muted-main">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 text-left">
          <div className="text-center flex flex-col items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-text-main">Frequently Asked Questions</h2>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border-main rounded-[12px] p-6 bg-brand-bg">
                <h4 className="font-bold text-lg text-text-main flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-muted-main text-sm mt-3 leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
