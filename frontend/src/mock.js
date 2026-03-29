// Mock data for Dangi Innovation Lab

export const mockData = {
  // Contact form submissions
  contactSubmissions: [],
  
  // Application submissions
  applicationSubmissions: [],
  
  // Newsletter subscriptions
  newsletterSubscriptions: [],
  
  // Statistics
  stats: {
    studentsServed: 250,
    mentors: 45,
    activeProjects: 32,
    communities: 15
  },
  
  // Programs
  programs: [
    {
      id: 1,
      title: 'Startups & Entrepreneurship',
      description: 'Transform your innovative ideas into viable business ventures with expert guidance and mentorship.',
      duration: '6 months',
      icon: 'Rocket'
    },
    {
      id: 2,
      title: 'Higher Education',
      description: 'Navigate the path to global universities with personalized roadmaps and application support.',
      duration: '6 months',
      icon: 'GraduationCap'
    },
    {
      id: 3,
      title: 'Research & Science',
      description: 'Conduct meaningful research with mentorship from global professionals and academics.',
      duration: '6 months',
      icon: 'Microscope'
    },
    {
      id: 4,
      title: 'Skill Development',
      description: 'Master in-demand skills through structured learning programs and hands-on projects.',
      duration: '6 months',
      icon: 'Code'
    },
    {
      id: 5,
      title: 'Social Innovation',
      description: 'Create solutions for community challenges through design thinking and collaborative innovation.',
      duration: '6 months',
      icon: 'Users'
    }
  ],
  
  // Mentorship benefits
  mentorshipBenefits: [
    {
      id: 1,
      title: 'Expert Guidance',
      description: 'Connect with experienced professionals who understand your journey'
    },
    {
      id: 2,
      title: 'Personalized Roadmaps',
      description: 'Get customized plans aligned with your goals and aspirations'
    },
    {
      id: 3,
      title: 'Global Network',
      description: 'Access a worldwide community of innovators and changemakers'
    },
    {
      id: 4,
      title: 'Career Acceleration',
      description: 'Fast-track your professional growth with targeted support'
    }
  ],
  
  // Transparency principles
  transparencyPrinciples: [
    {
      id: 1,
      title: 'No Cash Handling',
      description: 'All transactions are digital and traceable for complete accountability'
    },
    {
      id: 2,
      title: 'Documented Selection',
      description: 'Clear criteria and processes for all program selections and decisions'
    },
    {
      id: 3,
      title: 'Public Reporting',
      description: 'Regular updates on fund usage, program outcomes, and organizational activities'
    },
    {
      id: 4,
      title: 'Ethical Operations',
      description: 'Community-first approach with inclusive and fair practices'
    }
  ]
};

// Mock API functions
export const mockAPI = {
  submitContact: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockData.contactSubmissions.push({
          ...data,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        resolve({ success: true, message: 'Message sent successfully!' });
      }, 500);
    });
  },
  
  submitApplication: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockData.applicationSubmissions.push({
          ...data,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        resolve({ success: true, message: 'Application submitted successfully!' });
      }, 500);
    });
  },
  
  subscribeNewsletter: (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockData.newsletterSubscriptions.push({
          email,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        resolve({ success: true, message: 'Successfully subscribed!' });
      }, 500);
    });
  }
};
