import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, GraduationCap, Microscope, Code, Users, ArrowRight, CheckCircle, Clock, Target, Globe } from 'lucide-react';
import { mockData } from '../mock';
import SEO from '../components/SEO';

const Programs = () => {
  const pageUrl = `${window.location.origin}/programs`;
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;
  const [activeSection, setActiveSection] = useState('innovation-journey');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const sectionNav = [
    { id: 'innovation-journey', label: 'Innovation Journey' },
    { id: 'cohort-program', label: 'Cohort Sprint' },
    { id: 'focus-areas', label: 'Focus & Support' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const current = sectionNav.reduce((active, section) => {
        const element = document.getElementById(section.id);
        if (!element) return active;

        const top = element.getBoundingClientRect().top;
        if (top <= window.innerHeight * 0.3) {
          return section.id;
        }

        return active;
      }, 'innovation-journey');

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const response = await fetch(`${BACKEND_URL}/api/events`);
        const data = await response.json();

        if (data.success) {
          setUpcomingEvents(data.data || []);
        } else {
          setEventsError(data.message || 'Failed to load events');
          setUpcomingEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError('Unable to load events at this time');
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [BACKEND_URL]);

  const pillars = [
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Open to innovators regardless of background, geography, or prior experience.'
    },
    {
      icon: Target,
      title: 'Priority Scope',
      description: 'Open to all projects while maintaining a focus on high-impact sectors and community need.'
    },
    {
      icon: Rocket,
      title: 'Agility',
      description: 'Rapid prototyping and real-world testing are prioritized over theoretical research.'
    }
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Problem Sourcing',
      action: 'Crowdsourcing critical pain points from the public, non-profits, and affected communities.',
      outcome: 'A curated list of actionable problem statements that can be solved with technology.'
    },
    {
      step: '02',
      title: 'The Hackathon',
      action: 'A 48–72 hour virtual sprint to generate ideas, form teams, and build initial prototypes.',
      outcome: 'Rapidly developed MVP concepts ready for deeper refinement.'
    },
    {
      step: '03',
      title: 'The Cohort',
      action: 'A 4–6 week intensive program pairing teams with mentors for product development.',
      outcome: 'Market-ready or pilot-ready solutions with a clear launch path.'
    }
  ];

  const focusAreas = [
    'Education & Learning',
    'Civic Tech & Governance',
    'Health & Wellbeing',
    'Climate Resilience',
    'Digital Inclusion'
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Programs - DIL Innovation Lab',
    description: 'Upcoming events, deadlines, and program details for Dangi Innovation Lab.',
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Dangi Innovation Lab',
      logo: {
        '@type': 'ImageObject',
        url: `${pageUrl}/logo.png`
      }
    },
    hasPart: [
      ...upcomingEvents.map((eventItem) => ({
        '@type': 'Event',
        name: eventItem.title,
        eventStatus: 'https://schema.org/EventScheduled',
        startDate: eventItem.date,
        description: eventItem.details || eventItem.type,
        location: eventItem.location
          ? { '@type': 'Place', name: eventItem.location }
          : { '@type': 'VirtualLocation', url: pageUrl },
        url: eventItem.ctaUrl || pageUrl
      }))
    ]
  };

  const infrastructure = [
    {
      icon: Globe,
      title: 'Virtual Workspace',
      description: 'Slack or Discord for community interaction, networking, and event coordination.'
    },
    {
      icon: Code,
      title: 'Open Collaboration',
      description: 'GitHub for open-source code collaboration, issue tracking, and technical review.'
    },
    {
      icon: Microscope,
      title: 'Project Management',
      description: 'Trello or Notion for clear milestones, deliverables, and cohort progress tracking.'
    }
  ];

  const cohortTimeline = [
    {
      week: 'Week 1',
      phase: 'Validation & Architecture',
      details: 'Finalize system architecture, define the tech stack, and validate the solution against the problem statement.'
    },
    {
      week: 'Week 2–3',
      phase: 'Core Development Sprint',
      details: 'Build the primary product features and integrate essential data models or AI components.'
    },
    {
      week: 'Week 4',
      phase: 'Testing & QA',
      details: 'Stress-test the prototype, fix bugs, and gather initial user feedback.'
    },
    {
      week: 'Week 5',
      phase: 'Refinement & Scaling',
      details: 'Polish the interface, optimize backend performance, and prepare deployment documentation.'
    },
    {
      week: 'Week 6',
      phase: 'Demo Day & Handoff',
      details: 'Pitch the finalized solution to partners and outline the next-stage deployment plan.'
    }
  ];

  const graduationCriteria = [
    'A fully functional, tested prototype.',
    'Open-source documentation or a clear deployment roadmap.',
    'A final presentation demonstrating impact on the initial problem statement.'
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who can apply for DIL programs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Members of underserved communities are prioritized. Applicants should be 16+ and committed to the 6-month learning cycle.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does a program cycle run?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DIL programs follow a structured 6-month cycle with mentorship, learning modules, and milestone-based progress reviews.'
        }
      },
      {
        '@type': 'Question',
        name: 'What support is provided during the program?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Participants receive mentorship, personalized roadmaps, curated learning resources, and community support.'
        }
      }
    ]
  };

  const iconMap = {
    Rocket: Rocket,
    GraduationCap: GraduationCap,
    Microscope: Microscope,
    Code: Code,
    Users: Users
  };

  return (
    <div className="page-container">
      <SEO
        title="Programs | Dangi Innovation Lab"
        description="Explore Dangi Innovation Lab programs, structured 6-month innovation cycles, and community-first learning tracks."
        url={pageUrl}
        canonical={pageUrl}
        jsonLd={[schemaData, faqJsonLd]}
      />

      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Programs</h1>
          <p className="page-subtitle">
            Structured innovation paths for community-led problem solving and prototype launch.
          </p>
        </div>
      </section>

      <section className="program-nav-section">
        <div className="container">
          <div className="program-nav">
            {sectionNav.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`program-nav-item${activeSection === section.id ? ' active' : ''}`}
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="innovation-journey" className="content-section">
        <div className="container">
          <div className="program-card">
            <div className="program-icon">
              <Rocket size={36} />
            </div>
            <h2 className="program-title">Mission</h2>
            <p className="program-description">
              To bridge the gap between real-world problems and scalable technical solutions through community-driven innovation.
            </p>
            <ul className="content-list">
              <li>An online non-profit lab designed to crowdsource complex problem statements.</li>
              <li>Built to turn ideas into functional prototypes via hackathons and mentorship.</li>
              <li>Focused on social and technical breakthroughs with measurable impact.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="how-content">
            <div className="how-card">
              <div className="how-number">6</div>
              <h3 className="how-title">Innovation Journey</h3>
              <p className="how-description">
                A 6-month framework designed to move from discovery through prototype development, learning, and launch readiness.
              </p>
              <ul className="content-list">
                <li>Problem sourcing from communities and partners.</li>
                <li>Hackathon sprints to develop MVP concepts.</li>
                <li>Structured learning with mentorship and feedback.</li>
              </ul>
            </div>
            <div className="how-card">
              <div className="how-number">4–6</div>
              <h3 className="how-title">Cohort Sprint</h3>
              <p className="how-description">
                A focused sprint inside the larger program where top teams turn early prototypes into pilot-ready products.
              </p>
              <ul className="content-list">
                <li>Dedicated mentorship and weekly milestones.</li>
                <li>Rapid development, testing, and deployment planning.</li>
                <li>A final demo and handoff to partners or incubators.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="section-title-center">Core Pillars</h2>
          <div className="programs-grid">
            {pillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div key={pillar.title} className="program-card">
                  <div className="program-icon">
                    <PillarIcon size={36} />
                  </div>
                  <h3 className="program-title">{pillar.title}</h3>
                  <p className="program-description">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="section-title-center">Innovation Pipeline</h2>
          <div className="programs-grid">
            {pipelineSteps.map((step) => (
              <div key={step.step} className="program-card">
                <div className="program-icon">
                  <span className="feature-number">{step.step}</span>
                </div>
                <h3 className="program-title">{step.title}</h3>
                <p className="program-description"><strong>Action:</strong> {step.action}</p>
                <p className="program-description"><strong>Outcome:</strong> {step.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="focus-areas" className="content-section">
        <div className="container">
          <div className="program-card">
            <h2 className="program-title">Initial Focus Areas</h2>
            <p className="program-description">
              We are shaping the lab around sectors with the greatest potential for community impact. These initial focus areas are designed to guide early cohorts while remaining open to high-value projects from any domain.
            </p>
            <ul className="content-list">
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <p className="content-text">
              Primary focus areas will be finalized through community input and partner collaboration.
            </p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="section-title-center">Technical Infrastructure</h2>
          <div className="programs-grid">
            {infrastructure.map((item) => {
              const InfraIcon = item.icon;
              return (
                <div key={item.title} className="program-card">
                  <div className="program-icon">
                    <InfraIcon size={36} />
                  </div>
                  <h3 className="program-title">{item.title}</h3>
                  <p className="program-description">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="cohort-program" className="how-section">
        <div className="container">
          <h2 className="section-title-center">The Cohort Program: From MVP to Launch</h2>
          <p className="content-text">
            A 4–6 week intensive program that transitions early prototypes into viable, scalable solutions.
          </p>
          <div className="how-content">
            {cohortTimeline.map((item) => (
              <div key={item.week} className="how-card">
                <div className="how-number">{item.week}</div>
                <h3 className="how-title">{item.phase}</h3>
                <p className="how-description">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="section-title-center">Graduation Criteria</h2>
          <ul className="content-list">
            {graduationCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Program Tracks */}
      <section className="programs-section">
        <div className="container">
          <h2 className="section-title-center">Program Tracks</h2>
          <div className="programs-grid">
            {mockData.programs.map((program) => {
              const IconComponent = iconMap[program.icon];
              return (
                <div key={program.id} className="program-card">
                  <div className="program-icon">
                    <IconComponent size={36} />
                  </div>
                  <h3 className="program-title">{program.title}</h3>
                  <p className="program-description">{program.description}</p>
                  <div className="program-duration">
                    <Clock size={16} />
                    <span>{program.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="eligibility-section">
        <div className="container">
          <h2 className="section-title-center">Who Can Apply?</h2>
          <div className="eligibility-content">
            <div className="eligibility-card">
              <Target size={32} className="eligibility-icon" />
              <h3 className="eligibility-title">Primary Eligibility</h3>
              <ul className="eligibility-list">
                <li>Members of underserved communities (priority)</li>
                <li>Age 16 and above</li>
                <li>Committed to 6-month program duration</li>
                <li>Access to internet and basic computer skills</li>
                <li>Clear goals and willingness to learn</li>
              </ul>
            </div>
            <div className="eligibility-card">
              <Users size={32} className="eligibility-icon" />
              <h3 className="eligibility-title">Community-Priority Policy</h3>
              <p className="eligibility-text">
                DIL prioritizes members of underserved communities in all program selections. We believe in 
                strengthening community opportunity first while remaining open to collaboration with like-minded 
                individuals who share our values.
              </p>
              <p className="eligibility-text">
                Limited spots may be available for non-community members in exceptional cases, based on 
                alignment with our mission and available capacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Provided */}
      <section className="support-section">
        <div className="container">
          <h2 className="section-title-center">What You'll Receive</h2>
          <div className="support-grid">
            <div className="support-item">
              <h4 className="support-title">Mentorship</h4>
              <p className="support-text">
                One-on-one guidance from experienced professionals who understand your journey and goals
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Roadmaps</h4>
              <p className="support-text">
                Personalized action plans with clear milestones and checkpoints throughout the 6 months
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Learning Programs</h4>
              <p className="support-text">
                Structured curriculum and resources tailored to your track and learning style
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Digital Funding Support</h4>
              <p className="support-text">
                Guidance on accessing scholarships, grants, and funding opportunities (where applicable)
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Global Exposure</h4>
              <p className="support-text">
                Connect with international advisors and opportunities beyond geographical boundaries
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Community Network</h4>
              <p className="support-text">
                Lifetime access to our alumni network and community of innovators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Calendar */}
      <section className="event-calendar-section">
        <div className="container">
          <div className="event-calendar-header">
            <h2 className="section-title-center">Upcoming Events & Deadlines</h2>
            <p className="event-calendar-subtitle">
              Keep track of applications, workshops, and live sessions for the next cycle.
            </p>
          </div>

          <div className="event-calendar-grid">
            {eventsLoading ? (
              <article className="event-card">
                <p className="event-type">Loading</p>
                <h3 className="event-title">Loading upcoming events</h3>
                <p className="event-date">Please wait while we load the latest schedule.</p>
              </article>
            ) : eventsError ? (
              <article className="event-card">
                <p className="event-type">Unavailable</p>
                <h3 className="event-title">Unable to load events</h3>
                <p className="event-details">{eventsError}</p>
              </article>
            ) : upcomingEvents.length === 0 ? (
              <article className="event-card">
                <p className="event-type">No events yet</p>
                <h3 className="event-title">Upcoming events will appear here</h3>
                <p className="event-details">Add event details from the admin panel to publish deadlines, workshops, and announcements.</p>
              </article>
            ) : (
              upcomingEvents.map((eventItem) => (
                <article key={eventItem._id} className="event-card">
                  <p className="event-type">{eventItem.type || 'Event'}</p>
                  <h3 className="event-title">{eventItem.title}</h3>
                  <p className="event-date">{new Date(eventItem.date).toLocaleDateString()}</p>
                  {eventItem.location ? <p className="event-details">{eventItem.location}</p> : null}
                  <p className="event-details">{eventItem.details}</p>
                  {eventItem.ctaUrl ? (
                    <a href={eventItem.ctaUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                      Learn more
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Begin Your Journey?</h2>
            <p className="cta-description">
              Applications for the next cohort open soon. Join a community committed to your growth.
            </p>
            <Link to="/contact" className="btn-primary">
              Apply Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
