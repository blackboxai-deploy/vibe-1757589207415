import { ClinicInfo, FAQ } from "@/types";

export const clinicInfo: ClinicInfo = {
  name: "SmileCare Dental",
  address: "123 Dental Avenue, Smile City, SC 12345",
  phone: "(555) 123-SMILE",
  hours: {
    monday: "8:00 AM - 6:00 PM",
    tuesday: "8:00 AM - 6:00 PM", 
    wednesday: "8:00 AM - 6:00 PM",
    thursday: "8:00 AM - 6:00 PM",
    friday: "8:00 AM - 6:00 PM",
    saturday: "9:00 AM - 3:00 PM",
    sunday: "Emergency Only"
  },
  services: [
    "General Dentistry",
    "Dental Cleanings & Checkups",
    "Fillings & Restorations", 
    "Root Canal Therapy",
    "Tooth Extractions",
    "Cosmetic Dentistry",
    "Teeth Whitening",
    "Veneers & Crowns",
    "Orthodontics",
    "Braces (Metal & Clear)",
    "Invisalign",
    "Pediatric Dentistry",
    "Emergency Dental Care",
    "Oral Surgery",
    "Dental Implants"
  ],
  insuranceAccepted: [
    "Delta Dental",
    "Blue Cross Blue Shield",
    "Aetna",
    "Cigna", 
    "MetLife",
    "Guardian",
    "Humana",
    "UnitedHealthcare",
    "Most PPO plans"
  ],
  emergencyHours: "24/7 Emergency Line: (555) 911-HELP"
};

export const faqDatabase: FAQ[] = [
  // Hours & Location
  {
    id: "hours-1",
    question: "What are your hours?",
    answer: "We're open Monday through Friday from 8 AM to 6 PM, and Saturday from 9 AM to 3 PM. We also have a 24/7 emergency line at (555) 911-HELP for urgent dental issues.",
    category: "hours",
    keywords: ["hours", "time", "open", "closed", "schedule", "when"]
  },
  {
    id: "location-1", 
    question: "Where are you located?",
    answer: "We're located at 123 Dental Avenue in Smile City, SC 12345. We have ample parking and are wheelchair accessible.",
    category: "location",
    keywords: ["location", "address", "where", "directions", "parking"]
  },
  {
    id: "emergency-1",
    question: "Do you handle dental emergencies?",
    answer: "Yes! We provide 24/7 emergency dental care. Call our emergency line at (555) 911-HELP for severe pain, trauma, or urgent issues. For non-urgent after-hours concerns, you can schedule a same-day appointment during business hours.",
    category: "emergency",
    keywords: ["emergency", "urgent", "pain", "after hours", "24/7", "trauma"]
  },

  // Services
  {
    id: "services-1",
    question: "What services do you offer?",
    answer: "We offer comprehensive dental care including cleanings, fillings, root canals, crowns, cosmetic dentistry, orthodontics including Invisalign, pediatric dentistry, oral surgery, and dental implants. We handle everything from routine checkups to complex procedures.",
    category: "services", 
    keywords: ["services", "treatment", "procedures", "what do you do", "offerings"]
  },
  {
    id: "services-2",
    question: "Do you do teeth whitening?",
    answer: "Yes! We offer both in-office professional teeth whitening and take-home whitening kits. In-office treatments typically take about an hour and can lighten teeth several shades. I can schedule you for a consultation to discuss the best option for your needs.",
    category: "services",
    keywords: ["whitening", "bleaching", "white teeth", "cosmetic", "brighten"]
  },
  {
    id: "services-3",
    question: "Do you offer Invisalign?",
    answer: "Absolutely! We're certified Invisalign providers and offer both traditional braces and clear aligners. We'll do a comprehensive orthodontic consultation to determine the best treatment option for your specific needs and timeline.",
    category: "services",
    keywords: ["invisalign", "braces", "orthodontics", "straight teeth", "alignment", "clear aligners"]
  },

  // Insurance & Payment
  {
    id: "insurance-1",
    question: "Do you accept my insurance?", 
    answer: "We accept most major dental insurance plans including Delta Dental, Blue Cross Blue Shield, Aetna, Cigna, MetLife, Guardian, Humana, and UnitedHealthcare. We can verify your benefits before your appointment. We also offer flexible payment plans for uninsured patients.",
    category: "insurance",
    keywords: ["insurance", "coverage", "payment", "cost", "benefits", "accept"]
  },
  {
    id: "pricing-1",
    question: "How much do cleanings cost?",
    answer: "A standard cleaning typically ranges from $75-$150 depending on your specific needs. With insurance, most patients pay little to nothing for preventive care like cleanings and checkups. I can schedule you for a consultation where we'll provide exact pricing based on your insurance coverage.",
    category: "pricing", 
    keywords: ["cost", "price", "cleaning", "how much", "expensive", "affordable"]
  },
  {
    id: "insurance-2",
    question: "Do you have payment plans?",
    answer: "Yes! We offer flexible payment plans and financing options through CareCredit for patients without insurance or for procedures not fully covered. We also accept cash, check, and all major credit cards. We'll work with you to make dental care affordable.",
    category: "insurance",
    keywords: ["payment plan", "financing", "carecredit", "afford", "monthly payments"]
  },

  // Appointments
  {
    id: "appointments-1",
    question: "How do I schedule an appointment?",
    answer: "You can schedule right now through our AI assistant, call us at (555) 123-SMILE, or use our online booking system. For urgent needs, we often have same-day appointments available. What type of appointment would you like to schedule?",
    category: "services",
    keywords: ["schedule", "appointment", "book", "make appointment", "when can I come in"]
  },
  {
    id: "appointments-2", 
    question: "Do you have same-day appointments?",
    answer: "Yes! We reserve time slots each day for urgent and same-day appointments. If you're experiencing pain or have an urgent need, we can usually see you within 24 hours. Emergency cases are seen immediately.",
    category: "services",
    keywords: ["same day", "urgent", "today", "ASAP", "quick", "soon"]
  },

  // Specific Procedures
  {
    id: "procedures-1",
    question: "I need a root canal. Do you do those?",
    answer: "Yes, our dentists are experienced in root canal therapy. Most root canals can be completed in 1-2 visits and are much more comfortable than people expect. We use modern techniques and excellent anesthesia to ensure you're comfortable throughout the procedure.",
    category: "services",
    keywords: ["root canal", "endodontic", "tooth infection", "tooth pain"]
  },
  {
    id: "procedures-2",
    question: "Do you see children?", 
    answer: "Absolutely! We love treating young patients and have extensive experience in pediatric dentistry. We create a fun, comfortable environment for children and offer specialized care for kids from toddlers through teens. We recommend first visits around age 2-3 or when all baby teeth are present.",
    category: "services",
    keywords: ["children", "kids", "pediatric", "young", "child", "baby teeth"]
  }
];

export const getAnswerForQuestion = (userInput: string): FAQ | null => {
  const input = userInput.toLowerCase();
  
  // Find FAQ that matches keywords
  for (const faq of faqDatabase) {
    for (const keyword of faq.keywords) {
      if (input.includes(keyword.toLowerCase())) {
        return faq;
      }
    }
  }
  
  return null;
};

export const serviceTypes = [
  "General Checkup",
  "Dental Cleaning", 
  "Tooth Pain/Emergency",
  "Cosmetic Consultation",
  "Orthodontics Consultation",
  "Root Canal",
  "Tooth Extraction",
  "Teeth Whitening",
  "Crown/Bridge Work",
  "Dental Implant Consultation",
  "Pediatric Dental Visit",
  "Other"
];