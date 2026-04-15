import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Lightbulb, GraduationCap, TrendingUp, CalendarDays } from 'lucide-react';
import { mockData } from '../mock';
import SEO from '../components/SEO';

const Home = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  const blogImageFallback = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c3316"/><stop offset="100%" stop-color="#1a1c1b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#d9fb06" font-size="52" font-family="Arial, sans-serif">Dangi Innovation Lab</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#f3f8df" font-size="28" font-family="Arial, sans-serif">Blog Update</text></svg>'
  )}`;
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);

  const impactMetrics = [
    {
      label: 'Program Completion Rate',
      value: '89%',
      progress: 89,
      context: 'Learners who complete full cycle'
    },
    {
      label: 'Scholarship Conversion',
      value: '62%',
      progress: 62,
      context: 'Applicants receiving offers'
    },
    {
      label: 'Mentorship Satisfaction',
      value: '94%',
      progress: 94,
      context: 'Participants rating 4+ stars'
    },
    {
      label: 'Community Retention',
      value: '78%',
      progress: 78,
      context: 'Alumni active after 1 year'
    }
  ];

  const trustBadges = [
    {
      name: 'Education Partner Network',
      category: 'Partner',
      detail: 'Collaborating with institutions and mentors across regions.'
    },
    {
      name: 'Transparent Operations Standard',
      category: 'Certification',
      detail: 'Structured reporting and documented decision trails for programs.'
    },
    {
      name: 'Community Impact Recognition 2025',
      category: 'Award',
      detail: 'Recognized for measurable outcomes in underserved communities.'
    },
    {
      name: 'Digital Safety Commitment',
      category: 'Compliance',
      detail: 'Secure-first handling of submissions, mentorship, and member data.'
    }
  ];

  const faqItems = [
    {
      question: 'Who can apply for DIL programs?',
      answer: 'We prioritize underserved communities globally. Applicants should be committed to the full learning cycle and community contribution.'
    },
    {
      question: 'How does mentorship work?',
      answer: 'Each participant receives structured guidance through mentor check-ins, milestone planning, and practical feedback sessions.'
    },
    {
      question: 'Are programs online or in-person?',
      answer: 'DIL follows a digital-first model, so sessions, workshops, and resources are delivered online for global accessibility.'
    },
    {
      question: 'How are applicants selected?',
      answer: 'Selections are made through documented criteria that consider motivation, fit, and potential impact, with transparency in decisions.'
    },
    {
      question: 'Is there any fee to join?',
      answer: 'Core opportunities are community-focused and designed to lower access barriers. Any specific requirements are shared clearly per program cycle.'
    },
    {
      question: 'How can mentors or partners contribute?',
      answer: 'Professionals and organizations can support through mentorship, workshops, or strategic collaboration in areas aligned with our mission.'
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [blogsRes, storiesRes, eventsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/blogs?limit=3&page=1`),
          fetch(`${BACKEND_URL}/api/blogs?category=success-story&limit=3`),
          fetch(`${BACKEND_URL}/api/events`)
        ]);

        const blogsData = await blogsRes.json();
        const storiesData = await storiesRes.json();
        const eventsData = await eventsRes.json();

        if (blogsData.success) {
          setLatestBlogs(blogsData.blogs || []);
        }
        if (storiesData.success) {
          setSuccessStories(storiesData.blogs || []);
        }
        if (eventsData.success && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
          setUpcomingEvent(eventsData.data[0]);
          setUpcomingCount(eventsData.data.length);
        } else {
          setUpcomingEvent(null);
          setUpcomingCount(0);
        }
      } catch (_error) {
        setLatestBlogs([]);
        setSuccessStories([]);
        setUpcomingEvent(null);
        setUpcomingCount(0);
        setEventError('Unable to fetch upcoming events');
      } finally {
        setEventLoading(false);
      }
    };

    if (BACKEND_URL) {
      fetchContent();
    }
  }, [BACKEND_URL]);

  return (
    <div className="page-container">
      <SEO
        title="Dangi Innovation Lab | Community Programs and Upcoming Events"
        description="Dangi Innovation Lab empowers underserved communities through structured programs, mentorship, and timely event updates."
        url={`${FRONTEND_URL}/`}
        canonical={`${FRONTEND_URL}/`}
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img 
            src="https://images.pexels.com/photos/7437499/pexels-photo-7437499.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Community collaboration"
            className="hero-image"
            fetchPriority="high"
            loading="eager"
            width="1920"
            height="1280"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Building globally empowered underserved communities
          </h1>
          <p className="hero-subtitle">
            Through innovation, education, and leadership
          </p>
          <div className="hero-buttons">
            <Link to="/programs" className="btn-primary hero-cta-primary">
              Apply for Programs <ArrowRight size={18} />
            </Link>
            <Link to="/mentorship" className="btn-secondary hero-cta-secondary">
              Become a Mentor
            </Link>
            <Link to="/support" className="btn-secondary hero-cta-secondary">
              Support Our Mission
            </Link>
          </div>
          <p className="hero-cta-note">Limited seats each cycle. Early applications get priority review.</p>

          <div className="hero-event-teaser" aria-label="Upcoming event preview">
            <div className="hero-event-teaser-body">
              <div className="hero-event-topline">
                <CalendarDays size={18} />
                <span>{upcomingCount > 1 ? `${upcomingCount} upcoming events` : 'Upcoming event'}</span>
              </div>
              {eventLoading ? (
                <p className="hero-event-description">Loading event schedule...</p>
              ) : upcomingEvent ? (
                <>
                  <h2 className="hero-event-title">{upcomingEvent.title}</h2>
                  <p className="hero-event-meta">
                    {new Date(upcomingEvent.startDate).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                    {upcomingEvent.endDate ? ` — ${new Date(upcomingEvent.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
                  </p>
                </>
              ) : (
                <p className="hero-event-description">
                  No scheduled events yet. Find deadlines and announcements on Programs.
                </p>
              )}
            </div>
            <Link to="/programs#upcoming-events" className="btn-secondary hero-event-button">
              View upcoming events <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <h2 className="section-title">Welcome to Dangi Innovation Lab</h2>
            <p className="intro-text">
              Dangi Innovation Lab (DIL) is a non-profit, community-driven innovation and education organization 
              dedicated to empowering underserved communities worldwide. Operating as a 100% digital-first platform, 
              we connect students, innovators, and professionals globally.
            </p>
            <p className="intro-text">
              Our mission is simple: to unlock potential through structured mentorship, innovation programs, 
              and a global network of changemakers who believe in collective growth.
            </p>
          </div>
        </div>
      </section>

      {/* Core Focus Areas */}
      <section className="focus-section">
        <div className="container">
          <h2 className="section-title-center">Our Core Focus Areas</h2>
          <div className="focus-grid">
            <div className="focus-card">
              <div className="focus-icon">
                <GraduationCap size={32} />
              </div>
              <h3 className="focus-title">Education</h3>
              <p className="focus-description">
                Personalized learning pathways and guidance for higher education opportunities globally
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <Lightbulb size={32} />
              </div>
              <h3 className="focus-title">Innovation</h3>
              <p className="focus-description">
                Foster creative problem-solving and breakthrough ideas through structured programs
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <TrendingUp size={32} />
              </div>
              <h3 className="focus-title">Startups</h3>
              <p className="focus-description">
                Transform ideas into viable ventures with mentorship and strategic guidance
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <Users size={32} />
              </div>
              <h3 className="focus-title">Community</h3>
              <p className="focus-description">
                Build a global network of professionals committed to collective growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title-center">How DIL Works</h2>
          <div className="how-content">
            <div className="how-card">
              <div className="how-number">01</div>
              <h3 className="how-title">Online-First Model</h3>
              <p className="how-description">
                All programs, mentorship sessions, and resources are delivered digitally, ensuring accessibility 
                for community members worldwide.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">02</div>
              <h3 className="how-title">6-Month Innovation Cycles</h3>
              <p className="how-description">
                Structured programs that combine learning, mentorship, and practical application to achieve 
                meaningful outcomes.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">03</div>
              <h3 className="how-title">Global Mentorship Network</h3>
              <p className="how-description">
                Connect with experienced professionals and advisors who provide guidance tailored to your goals.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">04</div>
              <h3 className="how-title">Transparent & Ethical</h3>
              <p className="how-description">
                Community-driven governance with complete transparency in operations, fund usage, and decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.studentsServed}+</div>
              <div className="stat-label">Students Served</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.mentors}+</div>
              <div className="stat-label">Active Mentors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.activeProjects}+</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.communities}+</div>
              <div className="stat-label">Global Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Dashboard Section */}
      <section className="impact-dashboard-section">
        <div className="container">
          <div className="impact-dashboard-header">
            <h2 className="section-title">Impact Dashboard</h2>
            <p className="impact-dashboard-subtitle">
              A quick view of community outcomes across mentorship, scholarships, and startup support.
            </p>
          </div>

          <div className="impact-dashboard-grid">
            <article className="impact-dashboard-highlight">
              <h3>Annual Snapshot</h3>
              <p>
                Over the last 12 months, DIL supported <strong>{mockData.stats.studentsServed} learners</strong> with
                direct mentorship, enabled <strong>{mockData.stats.activeProjects} projects</strong>, and expanded into
                <strong> {mockData.stats.communities} communities</strong>.
              </p>
            </article>

            <div className="impact-dashboard-metrics">
              {impactMetrics.map((metric) => (
                <article key={metric.label} className="impact-metric-card">
                  <div className="impact-metric-top">
                    <h3>{metric.label}</h3>
                    <span>{metric.value}</span>
                  </div>
                  <div className="impact-progress-track" aria-hidden="true">
                    <div className="impact-progress-fill" style={{ width: `${metric.progress}%` }} />
                  </div>
                  <p>{metric.context}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="testimonials-header">
            <h2 className="section-title">Stories from Our Alumni</h2>
            <p className="testimonials-subtitle">
              Real journeys from learners and innovators who transformed ideas into measurable impact.
            </p>
            <Link to="/success-stories" className="btn-secondary testimonials-cta">View all stories</Link>
          </div>
          <div className="testimonials-grid">
            {successStories.length > 0 ? (
              successStories.map((story) => (
                <article key={story._id} className="testimonial-card">
                  {story.coverImage && (
                    <img
                      src={story.coverImage}
                      alt={story.coverImageAlt || story.title}
                      className="testimonial-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="testimonial-content">
                    <h3 className="testimonial-name">{story.title}</h3>
                    <p className="testimonial-role">{story.author}</p>
                    <p className="testimonial-quote">{story.excerpt}</p>
                    <Link to={`/blog/${story.slug}`} className="testimonial-read-more">
                      Read full story →
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="testimonials-empty">Success stories coming soon...</p>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="trust-badges-section">
        <div className="container">
          <div className="trust-badges-header">
            <h2 className="section-title">Trusted by Community and Partners</h2>
            <p className="trust-badges-subtitle">
              Built on transparent operations, verified collaborations, and impact-focused execution.
            </p>
          </div>

          <div className="trust-badges-grid">
            {trustBadges.map((badge) => (
              <article key={badge.name} className="trust-badge-card">
                <p className="trust-badge-type">{badge.category}</p>
                <h3 className="trust-badge-name">{badge.name}</h3>
                <p className="trust-badge-detail">{badge.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="home-faq-section">
        <div className="container">
          <div className="home-faq-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="home-faq-subtitle">
              Answers to common questions about programs, mentorship, and applications.
            </p>
          </div>

          <div className="home-faq-grid">
            {faqItems.map((item) => (
              <article key={item.question} className="home-faq-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs */}
      {latestBlogs.length > 0 ? (
        <section className="home-latest-blog-section">
          <div className="container">
            <div className="home-latest-blog-header">
              <h2 className="section-title">Latest from Our Blog</h2>
              <Link to="/blog" className="btn-secondary">View All</Link>
            </div>
            <div className="home-latest-blog-grid">
              {latestBlogs.map((blog) => (
                <article key={blog._id} className="home-latest-blog-card">
                  <Link to={`/blog/${blog.slug}`}>
                    <img
                      src={blog.coverImage || blogImageFallback}
                      alt={blog.coverImageAlt || blog.title}
                      className="home-latest-blog-image"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = blogImageFallback;
                      }}
                    />
                  </Link>
                  <div className="home-latest-blog-content">
                    <p className="home-latest-blog-meta">
                      <span>{blog.category}</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </p>
                    <h3>
                      <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>
                    <p>
                      {blog.excerpt || String(blog.content || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 130)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-description">
              Join a community of innovators, learners, and changemakers committed to collective growth.
            </p>
            <div className="cta-buttons">
              <Link to="/programs" className="btn-primary">
                Explore Programs <ArrowRight size={20} />
              </Link>
              <Link to="/support" className="btn-secondary">
                Support Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
