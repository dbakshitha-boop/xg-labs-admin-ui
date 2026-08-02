export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface Image {
  id: string;
  url: string;
  alt: string;
}

export interface Step {
  id: string;
  step: string;
  title: string;
  description: string;
}

export interface ContextItem {
  id: string;
  label: string;
  description: string;
}

export interface CustomSectionItem {
  id: string;
  label: string;
  value: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CaseStudy {
  id: string;
  title: string;
  image: string;
  description: string;
}

export type FontFamily = 'sans' | 'serif' | 'mono';
export type ThemeMode = 'dark' | 'light' | 'midnight';

export interface PortfolioTheme {
  mode: ThemeMode;
  fontHeading: FontFamily;
  fontBody: FontFamily;
  accentColor: string;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  theme: PortfolioTheme;
  hero: {
    subtitle: string;
    title: string;
    tags: string;
    stats: Stat[];
    image: string;
  };
  context: ContextItem[];
  showcaseImages: string[];
  infoBar: {
    role: string;
    timeline: string;
  };
  brandDirection: {
    description: string;
    images: Image[];
  };
  quote: {
    text: string;
  };
  process: Step[];
  customSections: CustomSection[];
  impact: {
    stats: Stat[];
  };
  caseStudies: CaseStudy[];
  brands: Brand[];
  contact: {
    heading: string;
    subheading: string;
    email: string;
    phone: string;
  };
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  joinedAt: string;
  tags?: string[];
  source?: 'newsletter' | 'contact_form' | 'manual';
  
  // Enriched Profile Data
  name?: string;
  company?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  notes?: string;
  messageHistory?: {
    date: string;
    subject: string;
  }[];
}

export interface Campaign {
  id: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: string;
  scheduledFor?: string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  status: 'new' | 'read' | 'archived';
  submittedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string;
  author: string;
  excerpt: string;
  coverImage: string;
  content: string; // Markdown or HTML
  tags: string;
  theme: PortfolioTheme; // Reuse theme for consistency
  enableTableOfContents?: boolean;
  enableDropCap?: boolean;
  enableNewsletter?: boolean;
  authorTwitter?: string;
  authorLinkedin?: string;
  infoBar: {
    role: string;
    timeline: string;
  };
  quote: {
    text: string;
  };
  process: Step[];
  customSections: CustomSection[];
  impact: {
    stats: Stat[];
  };
  caseStudies: CaseStudy[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  website?: string;
  isFeatured: boolean; // Featured brands appear in the highlighted center row
}

export const initialBlogPost: BlogPost = {
  id: '1',
  title: 'The Future of Digital Design',
  slug: 'future-of-digital-design',
  status: 'published',
  publishedAt: new Date().toISOString().split('T')[0],
  author: 'Alex Morgan',
  excerpt: 'Exploring how AI and spatial computing are reshaping the way we interact with digital interfaces.',
  coverImage: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBtZWV0aW5nJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  enableTableOfContents: true,
  enableDropCap: true,
  enableNewsletter: true,
  content: `
## Introduction

Digital design is evolving at a rapid pace. From the early days of skeuomorphism to the flat design era, and now into the age of spatial computing and AI-generated interfaces, the landscape is constantly shifting.

### The Role of AI

Artificial Intelligence is no longer just a buzzword; it's a fundamental part of the designer's toolkit. Tools like Figma and various AI plugins are making it easier to prototype and iterate.

> "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs

### Spatial Computing

With the advent of devices like the Apple Vision Pro, we are entering a new dimension of interaction. Designers must now think in 3D, considering depth, lighting, and physics.

## Conclusion

The future is bright for designers who are willing to adapt and learn new technologies. Embracing change is the only way to stay relevant in this ever-evolving industry.
  `,
  tags: 'Design, Technology, AI',
  theme: {
    mode: 'light',
    fontHeading: 'serif',
    fontBody: 'sans',
    accentColor: '#000000',
  },
  infoBar: {
    role: '',
    timeline: '',
  },
  quote: {
    text: '',
  },
  process: [],
  customSections: [],
  impact: {
    stats: [],
  },
  caseStudies: [],
};

export const initialPortfolio: Portfolio = {
  id: '1',
  title: 'Sample Portfolio',
  slug: 'sample-portfolio',
  status: 'published',
  theme: {
    mode: 'dark',
    fontHeading: 'sans',
    fontBody: 'sans',
    accentColor: '#FFFFFF',
  },
  hero: {
    subtitle: 'PRODUCT EXPERIENCE + REBRAND',
    title: 'A bold product refresh that improved conversion and user clarity.',
    tags: 'MARKETING | STRATEGY',
    stats: [
      { id: '1', value: '52%', label: 'Increase in sign-ups' },
      { id: '2', value: '2.1x', label: 'Better onboarding completion' },
      { id: '3', value: '38%', label: 'Higher engagement' },
      { id: '4', value: '3', label: 'Months to rollout' },
    ],
    image: 'https://images.unsplash.com/photo-1626253934161-08cfea22e968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwcGFja2FnaW5nJTIwZGVzaWdufGVufDF8fHx8MTc2NTQzNzcyMHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  context: [
    {
      id: '1',
      label: 'The Challenge',
      description: 'The app struggled with a fragmented identity, low conversion clarity, and an outdated product experience. Users didn\'t understand the product quickly, leading to poor onboarding and low retention.'
    },
    {
      id: '2',
      label: 'The Goal',
      description: 'Create a modern identity, simplify the user journey, and develop a marketing system that brings consistency, clarity, and growth across all touchpoints.'
    },
    {
      id: '3',
      label: 'The Solution',
      description: 'We executed a complete rebrand, redesigned the core user flows, and established a scalable design system that unified the product and marketing teams under one clear vision.'
    }
  ],
  showcaseImages: [
    'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBtZWV0aW5nJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2V8ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080'
  ],
  infoBar: {
    role: 'Branding, UI/UX, Strategy',
    timeline: '4 Months • January to April',
  },
  brandDirection: {
    description: 'We created a minimal, friendly identity system that supports product clarity across marketing and the app. The visual language emphasizes warmth, simple shapes, and a confident typographic voice.',
    images: [
      { id: '1', url: 'https://images.unsplash.com/photo-1738915564083-764aea7a80cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMGRlc2lnbiUyMG1pbmltYWxpc3QlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NjU1MjUxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Brand Logo' },
      { id: '2', url: 'https://images.unsplash.com/photo-1758598304048-7bc68cf97c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWIlMjBpbnRlcmZhY2UlMjBtb2NrdXB8ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'UI Mockup' },
      { id: '3', url: 'https://images.unsplash.com/photo-1626253934161-08cfea22e968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwcGFja2FnaW5nJTIwZGVzaWdufGVufDF8fHx8MTc2NTQzNzcyMHww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Packaging' },
    ],
  },
  quote: {
    text: 'We aligned product messaging with performance creative so campaigns matched the app experience — reducing drop-off and increasing conversion efficiency.',
  },
  process: [
    { id: '1', step: '01', title: 'DISCOVER', description: 'Research, analytics audit, and interview stakeholders.' },
    { id: '2', step: '02', title: 'DEFINE', description: 'Brand pillars, UX architecture, and initial hypotheses.' },
    { id: '3', step: '03', title: 'DESIGN', description: 'Identity, UI, prototypes, and a visual assets.' },
    { id: '4', step: '04', title: 'DELIVER', description: 'Handoff, campaign launch, measurement plan.' },
  ],
  customSections: [],
  impact: {
    stats: [
      { id: '1', value: '52%', label: 'Increase in sign-ups' },
      { id: '2', value: '2.1x', label: 'More onboarding completion' },
      { id: '3', value: '38%', label: 'Increase in active users' },
      { id: '4', value: '3', label: 'Months to rollout' },
    ],
  },
  caseStudies: [
    { id: '1', title: 'How we doubled performance with creative-first testing', image: 'https://images.unsplash.com/photo-1758598304048-7bc68cf97c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWIlMjBpbnRlcmZhY2UlMjBtb2NrdXB8ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080', description: 'See the case study' },
    { id: '2', title: 'Boosting user engagement through personalized content strategies', image: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBtZWV0aW5nJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1NTI1MTIyfDA&ixlib=rb-4.1.0&q=80&w=1080', description: 'See the case study' },
    { id: '3', title: 'Streamlining our onboarding process for new users', image: 'https://images.unsplash.com/photo-1738915564083-764aea7a80cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMGRlc2lnbiUyMG1pbmltYWxpc3QlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NjU1MjUxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080', description: 'See the case study' },
  ],
  brands: [
    { id: 'b1', name: 'Partner', logo: 'https://placehold.co/200x200/333/fff?text=Partner', isFeatured: true },
    { id: 'b2', name: 'Ash', logo: 'https://placehold.co/200x200/333/fff?text=Ash', isFeatured: true },
    { id: 'b3', name: 'Go!', logo: 'https://placehold.co/200x200/333/fff?text=Go!', isFeatured: true },
  ],
  contact: {
    heading: 'Let\'s create work that drives real growth.',
    subheading: 'From strategy to creative, we help brands move with clarity, purpose, and measurable impact.',
    email: 'hello@xglabs.agency',
    phone: '+1 234 567 890',
  },
};