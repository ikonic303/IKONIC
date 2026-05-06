import { useRef, useLayoutEffect, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Phone, ArrowRight, Car, Truck, Van, Upload, Sparkles, Send, RefreshCw, Palette, Type, Image as ImageIcon, FileImage, Box, FileOutput, Wrench, Plus, X, ExternalLink, Download, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

// Stripe Payment Link — set VITE_STRIPE_PAYMENT_LINK in .env.local (test) or Vercel env vars (production)
// Success redirect URL in Stripe must be: https://YOUR-SITE.com/commercial-wraps?payment=success
const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string;

const benefits = [
  'Premium materials that last for years',
  'Perfect for building strong business vehicle branding',
  'Custom design tailored to your brand',
  'Protects your original paint',
  'Fast turnaround with expert installation'
];

const industries = [
  'Plumbers & Electricians',
  'Contractors',
  'Delivery Services',
  'Real Estate Teams',
  'Gyms & Fitness',
  'Cleaning Companies'
];

const wrapStyles = [
  { id: 'full', name: 'Full Wrap', desc: 'Complete vehicle transformation' },
  { id: 'partial', name: 'Partial Wrap', desc: 'Strategic branding coverage' },
  { id: 'decals', name: 'Spot Decals', desc: 'Logo and contact info only' }
];

const colorThemes = [
  { id: 'bold', name: 'Bold & Vibrant', colors: ['#FF3366', '#00D9FF', '#FFCC00'] },
  { id: 'professional', name: 'Professional', colors: ['#1a365d', '#2d3748', '#718096'] },
  { id: 'modern', name: 'Modern & Clean', colors: ['#000000', '#00FF9D', '#FFFFFF'] },
  { id: 'warm', name: 'Warm & Inviting', colors: ['#E07B39', '#F6AD55', '#FBD38D'] },
  { id: 'cool', name: 'Cool & Trustworthy', colors: ['#3182CE', '#63B3ED', '#BEE3F8'] }
];

const vehicleSides = [
  { id: 'left', name: 'Driver Side (Left)', label: 'LEFT' },
  { id: 'right', name: 'Passenger Side (Right)', label: 'RIGHT' },
  { id: 'front', name: 'Front', label: 'FRONT' },
  { id: 'rear', name: 'Rear/Back', label: 'REAR' }
];

const suggestedServices: {[key: string]: string[]} = {
  plumber: ['Leak Repair', 'Drain Cleaning', 'Water Heater Install', 'Pipe Replacement', 'Emergency Service'],
  electrician: ['Electrical Repair', 'Panel Upgrades', 'Lighting Install', 'EV Charging', 'Safety Inspections'],
  contractor: ['Remodeling', 'New Construction', 'Repairs', 'Free Estimates', 'Licensed & Insured'],
  cleaning: ['Residential Cleaning', 'Commercial Cleaning', 'Deep Cleaning', 'Move-In/Move-Out', 'Recurring Service'],
  hvac: ['AC Repair', 'Heating Service', 'Maintenance Plans', 'New Installations', '24/7 Emergency'],
  landscaping: ['Lawn Care', 'Tree Service', 'Hardscaping', 'Irrigation', 'Seasonal Cleanup'],
  auto: ['Oil Changes', 'Brake Service', 'Engine Repair', 'Diagnostics', 'Tire Service'],
  fitness: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Free Trial', 'Open 24/7'],
  dental: ['Cleanings', 'Whitening', 'Cosmetic Dentistry', 'Emergency Care', 'New Patients Welcome'],
  realty: ['Buyers Agent', 'Sellers Agent', 'Free Home Valuation', 'First-Time Buyers', 'Investment Properties'],
  default: ['Free Estimates', 'Licensed & Insured', 'Quality Guaranteed', 'Years of Experience', 'Satisfaction Guaranteed']
};

export default function CommercialWraps() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<{[key: string]: string}>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [newService, setNewService] = useState('');
  const [isPaid, setIsPaid] = useState(true); // Payment disabled — Stripe commented out

  const [ghlFormSubmitted, setGhlFormSubmitted] = useState(false);
  const ghlIframeRef = useRef<HTMLIFrameElement>(null);

  // Watch iframe height attribute — GHL sets it smaller when Thank You screen shows
  useEffect(() => {
    if (currentStep !== 9) return;
    setGhlFormSubmitted(false);

    if (!document.querySelector('script[src="https://crm.ikonic303.com/js/form_embed.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://crm.ikonic303.com/js/form_embed.js';
      document.body.appendChild(s);
    }

    // Poll iframe height — GHL changes it to ~300-500px on Thank You screen
    const interval = setInterval(() => {
      const iframe = ghlIframeRef.current;
      if (!iframe) return;
      const h = parseInt(iframe.getAttribute('height') || iframe.style.height || '1248');
      if (h < 700) {
        setGhlFormSubmitted(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentStep]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      // Restore saved form state from before Stripe redirect
      const saved = localStorage.getItem('wrapFormState');
      if (saved) {
        const { formData: savedForm, uploadedImage: savedImage, uploadedLogo: savedLogo } = JSON.parse(saved);
        if (savedForm) setFormData(savedForm);
        if (savedImage) setUploadedImage(savedImage);
        if (savedLogo) setUploadedLogo(savedLogo);
        localStorage.removeItem('wrapFormState');
      }
      setIsPaid(true);
      setCurrentStep(7);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    wrapStyle: 'full',
    colorTheme: 'bold',
    brandColors: '',
    logoDescription: '',
    tagline: '',
    additionalNotes: '',
    selectedSides: ['left', 'right'] as string[],
    services: [] as string[]
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(benefitsRef.current?.querySelectorAll('.benefit-card') || [],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(funnelRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: funnelRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleSide = (sideId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSides: prev.selectedSides.includes(sideId)
        ? prev.selectedSides.filter(s => s !== sideId)
        : [...prev.selectedSides, sideId]
    }));
  };

  const addService = (service: string) => {
    if (service && !formData.services.includes(service)) {
      setFormData(prev => ({ ...prev, services: [...prev.services, service] }));
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
  };

  const handleAddCustomService = () => {
    if (newService.trim()) {
      addService(newService.trim());
      setNewService('');
    }
  };

  const handleGenerateDesign = useCallback(async () => {
    if (!uploadedImage && formData.selectedSides.length === 0) return;

    setIsGenerating(true);

    const colorThemeName = colorThemes.find(c => c.id === formData.colorTheme)?.name || 'professional';

    try {
      const res = await fetch('/api/generate-wrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          wrapStyle: formData.wrapStyle,
          colorTheme: colorThemeName,
          brandColors: formData.brandColors,
          services: formData.services,
          tagline: formData.tagline,
          logo: uploadedLogo || null,
          logoDescription: formData.logoDescription || '',
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Generation failed');
      }

      const { url } = await res.json();
      // Store as a single design sheet under key 'sheet'
      setGeneratedDesigns({ sheet: url });
    } catch (error) {
      console.error('Error generating design:', error);
      setGeneratedDesigns({ sheet: uploadedImage ?? '' });
    }

    setIsGenerating(false);
    setCurrentStep(8);
  }, [uploadedImage, uploadedLogo, formData.businessName, formData.wrapStyle, formData.colorTheme, formData.brandColors, formData.services, formData.tagline, formData.logoDescription]);

  const handleDownloadDesign = useCallback((side: string, dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${formData.businessName.replace(/\s+/g, '_')}_WRAP_${side.toUpperCase()}.png`;
    link.click();
  }, [formData.businessName]);

  const handleEmailDesigns = useCallback(async () => {
    if (!formData.email) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          contactName: formData.contactName,
          businessName: formData.businessName,
          designs: generatedDesigns,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
      }
    } catch (e) {
      console.error('Email failed:', e);
    }
    setIsSendingEmail(false);
  }, [formData.email, formData.contactName, formData.businessName, generatedDesigns]);

  const handleSubmitToIkonic = useCallback(() => {
    // Prepare submission data with all files properly labeled
    const submissionData = {
      businessName: formData.businessName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      wrapStyle: formData.wrapStyle,
      colorTheme: formData.colorTheme,
      brandColors: formData.brandColors,
      logoDescription: formData.logoDescription,
      tagline: formData.tagline,
      services: formData.services,
      additionalNotes: formData.additionalNotes,
      selectedSides: formData.selectedSides,
      files: {
        vehicleReference: {
          name: `${formData.businessName.replace(/\s+/g, '_')}_VEHICLE_REFERENCE.jpg`,
          data: uploadedImage
        },
        logo: uploadedLogo ? {
          name: `${formData.businessName.replace(/\s+/g, '_')}_LOGO.svg`,
          data: uploadedLogo,
          note: 'Please provide vector version (AI, EPS, or SVG) for production'
        } : null,
        wrapDesigns: Object.entries(generatedDesigns).map(([side, design]) => ({
          side: side.toUpperCase(),
          filename: `${formData.businessName.replace(/\s+/g, '_')}_WRAP_${side.toUpperCase()}.svg`,
          data: design,
          note: 'Vector file for production - ' + vehicleSides.find(s => s.id === side)?.name
        }))
      },
      productionNotes: {
        vectorRequired: true,
        sides: formData.selectedSides.map(s => vehicleSides.find(vs => vs.id === s)?.name).join(', '),
        deliveryFormat: 'AI/EPS/SVG vector files with CMYK color profile',
        servicesToDisplay: formData.services
      }
    };
    
    console.log('Submitting to Ikonic:', submissionData);
    
    // Show success message with file details
    const fileList = formData.selectedSides.map(side => 
      `• ${formData.businessName.replace(/\s+/g, '_')}_WRAP_${side.toUpperCase()}.svg`
    ).join('\n');
    
    alert(`Thank you ${formData.contactName}! 

Your vehicle wrap design package has been submitted to the Ikonic team.

FILES INCLUDED:
${fileList}
${uploadedLogo ? '• ' + formData.businessName.replace(/\s+/g, '_') + '_LOGO.svg' : ''}

SERVICES TO DISPLAY:
${formData.services.map(s => '• ' + s).join('\n')}

We will prepare production-ready vector files and contact you at ${formData.email} within 24 hours.`);
    
    // Reset form
    setCurrentStep(1);
    setUploadedImage(null);
    setUploadedLogo(null);
    setGeneratedDesigns({});
    setNewService('');
    setIsPaid(false);
    setFormData({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      wrapStyle: 'full',
      colorTheme: 'bold',
      brandColors: '',
      logoDescription: '',
      tagline: '',
      additionalNotes: '',
      selectedSides: ['left', 'right'],
      services: []
    });
  }, [formData, uploadedImage, uploadedLogo, generatedDesigns]);

  const scrollToFunnel = () => {
    funnelRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="AI Commercial Vehicle Wrap Designer Denver | Ikonic Marketing"
        description="Design your commercial vehicle wrap with AI. Upload your vehicle photo and logo — get a custom wrap design instantly. Serving Denver and Colorado businesses."
        canonical="/commercial-wraps"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">COMMERCIAL VINYL WRAPS</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Turn Your Vehicles Into<br />
            <span className="text-mint">Moving Billboards</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Transform your company cars, vans, or trucks into high-impact marketing tools with our 
            commercial vinyl wrap services. Design your wrap with AI and send it directly to our team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToFunnel}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Design Your Wrap
            </button>
            <a 
              href="tel:+17206791230"
              className="btn-outline inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call for Quote
            </a>
          </div>
        </div>
      </section>

      {/* AI Design Funnel */}
      <section ref={funnelRef} id="design-funnel" className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-micro text-mint mb-4">AI VEHICLE WRAP DESIGNER</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
              Design Your Wrap in <span className="text-mint">Minutes</span>
            </h2>
            <p className="text-offwhite-dark max-w-2xl mx-auto">
              Upload a photo of your vehicle and your logo, select which sides to wrap, add your services, and our AI will generate 
              production-ready vector designs for the Ikonic team.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-1 md:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base ${
                    currentStep >= step ? 'bg-mint text-charcoal' : 'bg-charcoal border border-white/20 text-offwhite-dark'
                  }`}>
                    {step}
                  </div>
                  {step < 7 && (
                    <div className={`w-3 md:w-6 h-0.5 mx-0.5 md:mx-1 ${
                      currentStep > step ? 'bg-mint' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Upload Vehicle Photo */}
          {currentStep === 1 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-mint" />
                Step 1: Upload Your Vehicle Photo
              </h3>
              
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-mint/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="vehicle-upload"
                  />
                  <label htmlFor="vehicle-upload" className="cursor-pointer">
                    <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-10 h-10 text-mint" />
                    </div>
                    <p className="text-offwhite font-medium mb-2">Click to upload vehicle photo</p>
                    <p className="text-offwhite-dark text-sm">Take a clear photo of your vehicle from the side</p>
                    <p className="text-offwhite-dark text-xs mt-2">JPG, PNG up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Your vehicle" 
                    className="w-full max-h-80 object-contain rounded-xl"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-4 right-4 bg-charcoal/80 text-offwhite px-3 py-1 rounded-lg text-sm hover:bg-charcoal"
                  >
                    Change Photo
                  </button>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!uploadedImage}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Vehicle Sides */}
          {currentStep === 2 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-mint" />
                Step 2: Select Sides to Wrap
              </h3>
              
              <p className="text-offwhite-dark mb-4">
                Choose which sides of your vehicle you want wrapped. Select one, multiple, or all four sides. 
                Our team will create production-ready vector files for each selected side.
              </p>

              {/* Select All Button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    const allSelected = formData.selectedSides.length === vehicleSides.length;
                    setFormData(prev => ({
                      ...prev,
                      selectedSides: allSelected ? [] : vehicleSides.map(s => s.id)
                    }));
                  }}
                  className="text-sm text-mint hover:text-offwhite transition-colors flex items-center gap-2"
                >
                  {formData.selectedSides.length === vehicleSides.length ? (
                    <>Clear All Selections</>
                  ) : (
                    <>Select All 4 Sides</>
                  )}
                </button>
              </div>

              {/* Selected Count */}
              <div className="text-center mb-4">
                <span className="text-mint font-medium">{formData.selectedSides.length}</span>
                <span className="text-offwhite-dark"> of </span>
                <span className="text-offwhite-dark">{vehicleSides.length} sides selected</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {vehicleSides.map((side) => (
                  <button
                    key={side.id}
                    onClick={() => toggleSide(side.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      formData.selectedSides.includes(side.id)
                        ? 'border-mint bg-mint/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                      formData.selectedSides.includes(side.id) ? 'bg-mint border-mint' : 'border-white/30'
                    }`}>
                      {formData.selectedSides.includes(side.id) && <Check className="w-4 h-4 text-charcoal" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-offwhite font-medium">{side.name}</p>
                      <p className="text-offwhite-dark text-xs">Output: {formData.businessName || 'YOUR_BUSINESS'}_WRAP_{side.label}.svg</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-mint/10 border border-mint/30 rounded-xl">
                <p className="text-offwhite text-sm flex items-center gap-2">
                  <FileOutput className="w-4 h-4 text-mint" />
                  <strong>Vector Files:</strong> Each selected side will receive a production-ready SVG/AI file
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={formData.selectedSides.length === 0}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Design Preferences */}
          {currentStep === 3 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-mint" />
                Step 3: Design Your Wrap
              </h3>

              <div className="space-y-6">
                {/* Wrap Style */}
                <div>
                  <label className="block text-sm text-offwhite-dark mb-3">Wrap Style</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wrapStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({...formData, wrapStyle: style.id})}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.wrapStyle === style.id 
                            ? 'border-mint bg-mint/10' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <p className="text-offwhite font-medium">{style.name}</p>
                        <p className="text-offwhite-dark text-sm">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-sm text-offwhite-dark mb-3">Color Theme</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setFormData({...formData, colorTheme: theme.id})}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.colorTheme === theme.id 
                            ? 'border-mint bg-mint/10' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex justify-center gap-1 mb-2">
                          {theme.colors.map((color, i) => (
                            <div 
                              key={i} 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-offwhite text-xs">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Colors */}
                <div>
                  <label className="block text-sm text-offwhite-dark mb-2">Your Brand Colors (optional)</label>
                  <input
                    type="text"
                    value={formData.brandColors}
                    onChange={(e) => setFormData({...formData, brandColors: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                    placeholder="e.g., Blue #0066CC, White #FFFFFF"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="text-sm text-offwhite-dark mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Business Tagline / Contact Info
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                    placeholder="e.g., Call (720) 555-0123 | www.yourbusiness.com"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Services to Display */}
          {currentStep === 4 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-mint" />
                Step 4: Services to Display on Your Wrap
              </h3>
              
              <p className="text-offwhite-dark mb-6">
                Add the services your business offers. These will be displayed on your vehicle wrap to let potential customers know what you do.
              </p>

              {/* Selected Services */}
              {formData.services.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm text-offwhite-dark mb-3">Your Selected Services</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service) => (
                      <div 
                        key={service}
                        className="flex items-center gap-2 bg-mint/20 text-offwhite px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm">{service}</span>
                        <button
                          onClick={() => removeService(service)}
                          className="text-offwhite hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Service */}
              <div className="mb-6">
                <label className="block text-sm text-offwhite-dark mb-2">Add a Service</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomService()}
                    className="flex-1 px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                    placeholder="e.g., Emergency Repairs, Free Estimates..."
                  />
                  <button
                    onClick={handleAddCustomService}
                    disabled={!newService.trim()}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Suggested Services */}
              <div>
                <label className="block text-sm text-offwhite-dark mb-3">Quick Add - Common Services</label>
                <div className="space-y-4">
                  {Object.entries(suggestedServices).map(([category, services]) => (
                    <div key={category}>
                      <p className="text-offwhite-dark text-xs uppercase tracking-wider mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {services.map((service) => (
                          <button
                            key={service}
                            onClick={() => addService(service)}
                            disabled={formData.services.includes(service)}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${
                              formData.services.includes(service)
                                ? 'bg-mint/30 text-mint cursor-default'
                                : 'bg-charcoal-light border border-white/10 text-offwhite-dark hover:border-mint/50 hover:text-offwhite'
                            }`}
                          >
                            {formData.services.includes(service) ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" /> {service}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Plus className="w-3 h-3" /> {service}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Upload Logo */}
          {currentStep === 5 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-6 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-mint" />
                Step 5: Upload Your Logo
              </h3>
              
              <p className="text-offwhite-dark mb-6">
                Upload your logo file so our designers can place it accurately on your vehicle wrap rendering. 
                For best results, please provide a vector file (AI, EPS, or SVG).
              </p>
              
              {!uploadedLogo ? (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-mint/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.svg,.ai,.eps,.pdf"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileImage className="w-10 h-10 text-mint" />
                    </div>
                    <p className="text-offwhite font-medium mb-2">Click to upload your logo</p>
                    <p className="text-offwhite-dark text-sm">PNG, JPG, SVG, AI, EPS, or PDF</p>
                    <p className="text-mint text-xs mt-2 font-medium">Vector files (AI/EPS/SVG) preferred for production</p>
                  </label>
                </div>
              ) : (
                <div className="relative bg-charcoal-light rounded-xl p-8 text-center">
                  <img 
                    src={uploadedLogo} 
                    alt="Your logo" 
                    className="max-h-48 mx-auto object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setUploadedLogo(null)}
                    className="absolute top-4 right-4 bg-charcoal text-offwhite px-3 py-1 rounded-lg text-sm hover:bg-charcoal-light border border-white/20"
                  >
                    Change Logo
                  </button>
                </div>
              )}

              {/* Logo Description */}
              <div className="mt-6">
                <label className="block text-sm text-offwhite-dark mb-2">Logo Placement Instructions (optional)</label>
                <textarea
                  value={formData.logoDescription}
                  onChange={(e) => setFormData({...formData, logoDescription: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors resize-none"
                  rows={2}
                  placeholder="e.g., 'Place logo on both sides, centered. Add phone number below logo on rear.'"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Contact Info & Generate */}
          {currentStep === 6 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-mint" />
                Step 6: Your Contact Information
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-offwhite-dark mb-2">Business Name *</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                      placeholder="Your Business Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-offwhite-dark mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-offwhite-dark mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                      placeholder="you@business.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-offwhite-dark mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
                      placeholder="(720) 555-0123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-offwhite-dark mb-2">Additional Notes (optional)</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors resize-none"
                    rows={3}
                    placeholder="Any specific design requests or questions..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(9)}
                  disabled={!formData.businessName || !formData.contactName || !formData.email || !formData.phone}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Payment */}
          {currentStep === 7 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-mint" />
                Step 7: Payment
              </h3>

              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-offwhite font-medium text-lg">AI Vehicle Wrap Design</p>
                    <p className="text-offwhite-dark text-sm">{formData.selectedSides.length} side{formData.selectedSides.length > 1 ? 's' : ''} selected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-mint">FREE</p>
                    <p className="text-offwhite-dark text-xs">per design round</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-offwhite-dark text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint" />
                    Includes AI-generated mockups for all selected sides
                  </p>
                  <p className="text-offwhite-dark text-sm flex items-center gap-2 mt-1">
                    <Check className="w-4 h-4 text-mint" />
                    Production-ready vector files delivered to Ikonic
                  </p>
                  <p className="text-offwhite-dark text-sm flex items-center gap-2 mt-1">
                    <Check className="w-4 h-4 text-mint" />
                    One revision round included
                  </p>
                </div>
              </div>

              {/* Stripe Payment */}
              {!isPaid ? (
                <div className="space-y-4">
                  <p className="text-offwhite-dark text-sm">
                    You'll be redirected to Stripe's secure checkout. After payment, you'll return here automatically to generate your designs.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-charcoal-light rounded-lg">
                    <Check className="w-4 h-4 text-mint" />
                    <p className="text-offwhite-dark text-xs">Payments are processed securely by Stripe — we never see your card details</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-mint/10 border border-mint/30 rounded-xl">
                  <Check className="w-12 h-12 text-mint mx-auto mb-3" />
                  <p className="text-offwhite font-medium text-lg">FREE AI IMAGE GENERATOR COMMERCIAL WRAP</p>
                  <p className="text-offwhite-dark text-sm">Proceed to generate your wrap designs</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="btn-outline"
                >
                  Back
                </button>
                {!isPaid ? (
                  <a
                    href={STRIPE_PAYMENT_LINK}
                    className="btn-primary inline-flex items-center gap-2"
                    onClick={() => {
                      localStorage.setItem('wrapFormState', JSON.stringify({
                        formData,
                        uploadedImage,
                        uploadedLogo,
                      }));
                    }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    Pay $20.00 with Stripe
                  </a>
                ) : (
                  <button
                    onClick={handleGenerateDesign}
                    disabled={isGenerating}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Designs
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 9: CRM Form */}
          {currentStep === 9 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-mint" />
                One Last Step Before Your Design
              </h3>
              <p className="text-offwhite-dark mb-6">Fill out the form below so our team can follow up with your final wrap files.</p>
              <iframe
                ref={ghlIframeRef}
                src="https://crm.ikonic303.com/widget/form/R5hy9Jhsgeavr7pkl1vH"
                style={{ width: '100%', height: '1248px', border: 'none', borderRadius: '3px' }}
                id="inline-R5hy9Jhsgeavr7pkl1vH"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Funnel - Ikonic Mktng"
                data-height="1248"
                data-layout-iframe-id="inline-R5hy9Jhsgeavr7pkl1vH"
                data-form-id="R5hy9Jhsgeavr7pkl1vH"
                title="Funnel - Ikonic Mktng"
              />
              <div className="flex justify-between items-center mt-6">
                <button onClick={() => setCurrentStep(6)} className="btn-outline">Back</button>
                <div className="flex flex-col items-end gap-2">
                  {ghlFormSubmitted ? (
                    <button
                      onClick={() => setCurrentStep(8)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Generate My Wrap
                      <Sparkles className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <p className="text-offwhite-dark text-sm">Submit the form above to continue</p>
                      <button
                        onClick={() => setGhlFormSubmitted(true)}
                        className="text-mint text-xs underline opacity-60 hover:opacity-100 transition-opacity"
                      >
                        Form submitted? Click here
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Generate & Review */}
          {currentStep === 8 && Object.keys(generatedDesigns).length === 0 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-mint mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-offwhite mb-2">Ready to Generate</h3>
              <p className="text-offwhite-dark mb-6">Click below to generate your AI vehicle wrap designs.</p>
              <div className="flex justify-between mt-4">
                <button onClick={() => setCurrentStep(9)} className="btn-outline">Back</button>
                <button
                  onClick={handleGenerateDesign}
                  disabled={isGenerating}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />Generate Designs</>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 8 && Object.keys(generatedDesigns).length > 0 && (
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-mint" />
                Your Vehicle Wrap Designs
              </h3>

              <p className="text-offwhite-dark mb-6">
                Preview of your wrap designs. The Ikonic team will prepare production-ready vector files 
                for each selected side.
              </p>

              {/* Full Design Sheet */}
              {generatedDesigns.sheet && (
                <div className="bg-charcoal-light rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-offwhite font-medium">Full Wrap Design Sheet</p>
                    <button
                      onClick={() => handleDownloadDesign('DESIGN_SHEET', generatedDesigns.sheet)}
                      className="flex items-center gap-2 text-mint text-sm hover:text-mint/80 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <img
                    src={generatedDesigns.sheet}
                    alt="Vehicle wrap design sheet"
                    className="w-full rounded-lg border border-white/10"
                  />
                  <p className="text-offwhite-dark text-xs mt-2 font-mono">
                    {formData.businessName.replace(/\s+/g, '_')}_WRAP_DESIGN_SHEET.png
                  </p>
                </div>
              )}

              {/* Services to Display */}
              {formData.services.length > 0 && (
                <div className="mt-6 p-4 bg-charcoal-light rounded-xl">
                  <p className="text-offwhite-dark text-sm mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-mint" />
                    Services to Display on Wrap
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service) => (
                      <span 
                        key={service}
                        className="bg-mint/10 text-offwhite px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo Preview */}
              {uploadedLogo && (
                <div className="mt-6 p-4 bg-charcoal-light rounded-xl">
                  <p className="text-offwhite-dark text-sm mb-3">Your Logo (Source File)</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={uploadedLogo} 
                      alt="Your logo" 
                      className="h-16 object-contain bg-charcoal rounded-lg p-2"
                    />
                    <div>
                      <p className="text-offwhite-dark text-xs font-mono">
                        {formData.businessName.replace(/\s+/g, '_')}_LOGO.svg
                      </p>
                      <p className="text-mint text-xs mt-1">
                        Vector file for production use
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-charcoal-light rounded-xl">
                <h4 className="text-offwhite font-medium mb-2">Design Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-offwhite-dark">Business: <span className="text-offwhite">{formData.businessName}</span></p>
                  <p className="text-offwhite-dark">Style: <span className="text-offwhite">{wrapStyles.find(s => s.id === formData.wrapStyle)?.name}</span></p>
                  <p className="text-offwhite-dark">Theme: <span className="text-offwhite">{colorThemes.find(c => c.id === formData.colorTheme)?.name}</span></p>
                  <p className="text-offwhite-dark">Sides: <span className="text-offwhite">{formData.selectedSides.length}</span></p>
                  <p className="text-offwhite-dark">Services: <span className="text-offwhite">{formData.services.length}</span></p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-mint/10 border border-mint/30 rounded-xl">
                <p className="text-offwhite text-sm mb-2">
                  <strong>Files to be delivered to Ikonic:</strong>
                </p>
                <ul className="text-offwhite-dark text-sm space-y-1 font-mono">
                  {formData.selectedSides.map(side => (
                    <li key={side}>• {formData.businessName.replace(/\s+/g, '_')}_WRAP_{vehicleSides.find(s => s.id === side)?.label}.svg</li>
                  ))}
                  {uploadedLogo && <li>• {formData.businessName.replace(/\s+/g, '_')}_LOGO.svg</li>}
                </ul>
                <p className="text-offwhite-dark text-xs mt-3">
                  All files will be delivered as production-ready vector files (SVG/AI/EPS) with CMYK color profile.
                </p>
              </div>

              {/* Email Designs */}
              <div className="mt-6 p-4 bg-charcoal-light rounded-xl">
                <p className="text-offwhite font-medium mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-mint" />
                  Email Designs to Yourself
                </p>
                {emailSent ? (
                  <div className="flex items-center gap-2 text-mint text-sm">
                    <Check className="w-4 h-4" />
                    Designs sent to {formData.email}!
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <p className="text-offwhite-dark text-sm flex-1">
                      Sending to: <span className="text-offwhite">{formData.email}</span>
                    </p>
                    <button
                      onClick={handleEmailDesigns}
                      disabled={isSendingEmail}
                      className="btn-outline inline-flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {isSendingEmail ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" />Sending...</>
                      ) : (
                        <><Mail className="w-4 h-4" />Send Email</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Get Wrap Quote CTA */}
              <div className="mt-6 p-5 bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/40 rounded-xl">
                <p className="text-offwhite font-semibold mb-1">Love your design? Get an instant price quote!</p>
                <p className="text-offwhite-dark text-sm mb-4">We'll pre-fill your wrap details in our calculator so you get an accurate estimate in seconds.</p>
                <button
                  onClick={() => {
                    const coverageMap: Record<string, string> = {
                      full: 'Full Wrap',
                      partial: 'Partial Wrap',
                      decals: 'Spot Graphics / Lettering',
                    };
                    const params = new URLSearchParams({
                      coverage: coverageMap[formData.wrapStyle] || 'Full Wrap',
                      business: formData.businessName,
                    });
                    navigate(`/wrap-calculator?${params.toString()}`);
                  }}
                  className="btn-primary inline-flex items-center gap-2 w-full justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                  Get Your Wrap Quote →
                </button>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentStep(7)}
                  className="btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitToIkonic}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send to Ikonic
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
              Why Businesses Choose Us for Their Wraps?
            </h2>
          </div>
          
          <div ref={benefitsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="benefit-card flex items-start gap-4 p-6 bg-charcoal-light border border-white/10 rounded-xl"
              >
                <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-mint" />
                </div>
                <p className="text-offwhite">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
              Built for <span className="text-mint">Every Industry</span>
            </h2>
            <p className="text-offwhite-dark max-w-2xl mx-auto">
              Whether you need a wrap for one vehicle or an entire fleet, our solutions are built 
              to scale with your business.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 bg-charcoal border border-white/10 rounded-lg"
              >
                {index % 3 === 0 && <Car className="w-5 h-5 text-mint" />}
                {index % 3 === 1 && <Truck className="w-5 h-5 text-mint" />}
                {index % 3 === 2 && <Van className="w-5 h-5 text-mint" />}
                <span className="text-offwhite text-sm">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-6">
            Ready to Wrap Your Fleet?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Call us today for a free quote and consultation.
          </p>
          <a 
            href="tel:+17206791230"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            <Phone className="w-5 h-5" />
            Call (720) 679-1230
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
