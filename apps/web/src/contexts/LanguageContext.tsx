'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.language': 'বাংলা',

    // Hero Section
    'hero.title': 'Your Health,',
    'hero.titleHighlight': 'Your Control',
    'hero.subtitle': 'Access your medical records, book appointments, and communicate with your healthcare team - all from one secure platform designed for patients in Bangladesh.',
    'hero.getStarted': 'Get Started Free',
    'hero.learnMore': 'Learn More',
    'hero.trustedBy': 'Trusted by patients across Bangladesh',

    // Features Section
    'features.title': 'Everything You Need',
    'features.subtitle': 'Manage your health journey with powerful features designed for you',

    'features.records.title': 'Medical Records',
    'features.records.desc': 'Access your complete medical history, lab results, prescriptions, and imaging reports anytime, anywhere.',

    'features.appointments.title': 'Easy Appointments',
    'features.appointments.desc': 'Book appointments with your doctors, receive reminders, and manage your schedule effortlessly.',

    'features.vitals.title': 'Track Vitals',
    'features.vitals.desc': 'Log blood pressure, glucose, weight, and more. View trends and share insights with your healthcare team.',

    'features.messaging.title': 'Secure Messaging',
    'features.messaging.desc': 'Communicate directly with your doctors through encrypted, HIPAA-compliant messaging.',

    'features.medications.title': 'Medication Reminders',
    'features.medications.desc': 'Never miss a dose with smart medication reminders and refill notifications.',

    'features.family.title': 'Family Access',
    'features.family.desc': 'Manage health records for your family members with appropriate access controls.',

    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Getting started is simple',
    'howItWorks.step1.title': 'Create Account',
    'howItWorks.step1.desc': 'Sign up with your email and verify your identity securely.',
    'howItWorks.step2.title': 'Connect Provider',
    'howItWorks.step2.desc': 'Link your account to your healthcare provider.',
    'howItWorks.step3.title': 'Access Records',
    'howItWorks.step3.desc': 'View and manage all your health information in one place.',

    // Security Section
    'security.title': 'Your Privacy is Our Priority',
    'security.subtitle': 'We use bank-level encryption and comply with international healthcare data standards to keep your information safe.',
    'security.encryption': 'End-to-End Encryption',
    'security.gdpr': 'GDPR Compliant',
    'security.hipaa': 'HIPAA Standards',
    'security.audit': 'Regular Security Audits',

    // CTA Section
    'cta.title': 'Ready to Take Control of Your Health?',
    'cta.subtitle': 'Join thousands of patients who trust Stratosphere for their healthcare needs.',
    'cta.button': 'Create Free Account',
    'cta.noCard': 'No credit card required',

    // Footer
    'footer.description': 'Empowering patients with secure access to their health information.',
    'footer.product': 'Product',
    'footer.features': 'Features',
    'footer.security': 'Security',
    'footer.pricing': 'Pricing',
    'footer.company': 'Company',
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.careers': 'Careers',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.gdpr': 'GDPR',
    'footer.rights': '© 2024 Stratosphere Health. All rights reserved.',
    'footer.madeWith': 'Made with care for patients in Bangladesh',
  },
  bn: {
    // Navigation
    'nav.login': 'লগইন',
    'nav.signup': 'সাইন আপ',
    'nav.language': 'English',

    // Hero Section
    'hero.title': 'আপনার স্বাস্থ্য,',
    'hero.titleHighlight': 'আপনার নিয়ন্ত্রণে',
    'hero.subtitle': 'আপনার মেডিকেল রেকর্ড অ্যাক্সেস করুন, অ্যাপয়েন্টমেন্ট বুক করুন এবং আপনার স্বাস্থ্যসেবা দলের সাথে যোগাযোগ করুন - বাংলাদেশের রোগীদের জন্য ডিজাইন করা একটি সুরক্ষিত প্ল্যাটফর্ম থেকে।',
    'hero.getStarted': 'বিনামূল্যে শুরু করুন',
    'hero.learnMore': 'আরও জানুন',
    'hero.trustedBy': 'বাংলাদেশ জুড়ে রোগীদের বিশ্বস্ত',

    // Features Section
    'features.title': 'আপনার প্রয়োজনীয় সবকিছু',
    'features.subtitle': 'আপনার জন্য ডিজাইন করা শক্তিশালী বৈশিষ্ট্যগুলির সাথে আপনার স্বাস্থ্য যাত্রা পরিচালনা করুন',

    'features.records.title': 'মেডিকেল রেকর্ড',
    'features.records.desc': 'যেকোনো সময়, যেকোনো জায়গা থেকে আপনার সম্পূর্ণ চিকিৎসা ইতিহাস, ল্যাব রিপোর্ট, প্রেসক্রিপশন এবং ইমেজিং রিপোর্ট অ্যাক্সেস করুন।',

    'features.appointments.title': 'সহজ অ্যাপয়েন্টমেন্ট',
    'features.appointments.desc': 'আপনার ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন, রিমাইন্ডার পান এবং সহজেই আপনার সময়সূচী পরিচালনা করুন।',

    'features.vitals.title': 'ভাইটাল ট্র্যাক করুন',
    'features.vitals.desc': 'রক্তচাপ, গ্লুকোজ, ওজন এবং আরও অনেক কিছু লগ করুন। ট্রেন্ড দেখুন এবং আপনার স্বাস্থ্যসেবা দলের সাথে শেয়ার করুন।',

    'features.messaging.title': 'সুরক্ষিত মেসেজিং',
    'features.messaging.desc': 'এনক্রিপ্টেড, HIPAA-কমপ্লায়েন্ট মেসেজিংয়ের মাধ্যমে সরাসরি আপনার ডাক্তারদের সাথে যোগাযোগ করুন।',

    'features.medications.title': 'ওষুধের রিমাইন্ডার',
    'features.medications.desc': 'স্মার্ট ওষুধ রিমাইন্ডার এবং রিফিল নোটিফিকেশনের সাথে কোনো ডোজ মিস করবেন না।',

    'features.family.title': 'পরিবারের অ্যাক্সেস',
    'features.family.desc': 'উপযুক্ত অ্যাক্সেস নিয়ন্ত্রণ সহ আপনার পরিবারের সদস্যদের স্বাস্থ্য রেকর্ড পরিচালনা করুন।',

    // How It Works
    'howItWorks.title': 'কিভাবে কাজ করে',
    'howItWorks.subtitle': 'শুরু করা সহজ',
    'howItWorks.step1.title': 'অ্যাকাউন্ট তৈরি করুন',
    'howItWorks.step1.desc': 'আপনার ইমেইল দিয়ে সাইন আপ করুন এবং নিরাপদে আপনার পরিচয় যাচাই করুন।',
    'howItWorks.step2.title': 'প্রোভাইডার সংযুক্ত করুন',
    'howItWorks.step2.desc': 'আপনার স্বাস্থ্যসেবা প্রদানকারীর সাথে আপনার অ্যাকাউন্ট লিঙ্ক করুন।',
    'howItWorks.step3.title': 'রেকর্ড অ্যাক্সেস করুন',
    'howItWorks.step3.desc': 'এক জায়গায় আপনার সমস্ত স্বাস্থ্য তথ্য দেখুন এবং পরিচালনা করুন।',

    // Security Section
    'security.title': 'আপনার গোপনীয়তা আমাদের অগ্রাধিকার',
    'security.subtitle': 'আমরা ব্যাংক-লেভেল এনক্রিপশন ব্যবহার করি এবং আপনার তথ্য সুরক্ষিত রাখতে আন্তর্জাতিক স্বাস্থ্যসেবা ডেটা মান মেনে চলি।',
    'security.encryption': 'এন্ড-টু-এন্ড এনক্রিপশন',
    'security.gdpr': 'GDPR কমপ্লায়েন্ট',
    'security.hipaa': 'HIPAA মান',
    'security.audit': 'নিয়মিত সিকিউরিটি অডিট',

    // CTA Section
    'cta.title': 'আপনার স্বাস্থ্যের নিয়ন্ত্রণ নিতে প্রস্তুত?',
    'cta.subtitle': 'হাজার হাজার রোগীদের সাথে যোগ দিন যারা তাদের স্বাস্থ্যসেবার জন্য Stratosphere বিশ্বাস করেন।',
    'cta.button': 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন',
    'cta.noCard': 'কোনো ক্রেডিট কার্ড প্রয়োজন নেই',

    // Footer
    'footer.description': 'রোগীদের তাদের স্বাস্থ্য তথ্যে নিরাপদ অ্যাক্সেস দিয়ে ক্ষমতায়িত করা।',
    'footer.product': 'প্রোডাক্ট',
    'footer.features': 'বৈশিষ্ট্য',
    'footer.security': 'নিরাপত্তা',
    'footer.pricing': 'মূল্য',
    'footer.company': 'কোম্পানি',
    'footer.about': 'আমাদের সম্পর্কে',
    'footer.contact': 'যোগাযোগ',
    'footer.careers': 'ক্যারিয়ার',
    'footer.legal': 'আইনি',
    'footer.privacy': 'গোপনীয়তা নীতি',
    'footer.terms': 'সেবার শর্তাবলী',
    'footer.gdpr': 'GDPR',
    'footer.rights': '© ২০২৪ Stratosphere Health. সর্বস্বত্ব সংরক্ষিত।',
    'footer.madeWith': 'বাংলাদেশের রোগীদের জন্য যত্ন সহকারে তৈরি',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'bn')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
