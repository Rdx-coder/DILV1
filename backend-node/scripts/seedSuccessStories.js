#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dil_db';

const sampleStories = [
  {
    title: 'From Ideas to Impact: Priya\'s Scholarship Journey',
    slug: 'priya-scholarship-journey',
    category: 'success-story',
    status: 'published',
    author: 'Priya Rajpurohit',
    excerpt: 'How DIL mentorship transformed my university application and led to a full scholarship at a global institution.',
    content: `<h2>The Beginning</h2>
<p>When I first joined the DIL program, I had a dream but no clear path. I wanted to pursue higher education abroad, but the process seemed overwhelming and the competition fierce.</p>

<h2>The Mentorship Effect</h2>
<p>My mentor, a professor from IIT, spent 6 months helping me craft my story. We worked on:</p>
<ul>
<li>Identifying my unique strengths and background</li>
<li>Structuring a compelling narrative for applications</li>
<li>Preparing for interviews with confidence</li>
<li>Understanding different scholarship opportunities globally</li>
</ul>

<h2>The Results</h2>
<p>I applied to 8 universities and received acceptance letters from 6, including a full scholarship offer from a top-rated institution. Today, I'm not just a student abroad—I'm mentoring others from my district who dream of the same.</p>

<h2>The Real Gift</h2>
<p>What DIL gave me wasn't just a scholarship. It gave me confidence, a structured path, and a supportive community that believed in my potential even when I didn't.</p>`,
    seoTitle: 'Priya\'s Full Scholarship Success Story - DIL Mentorship Impact',
    seoDescription: 'Discover how mentorship through DIL transformed Priya\'s university application and secured a full global scholarship.',
    coverImage: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800',
    coverImageAlt: 'Priya studying with confidence and determination',
    tags: ['scholarship', 'education', 'mentorship', 'success']
  },
  {
    title: 'Building a Startup from Scratch: Aman\'s 12-Week Journey',
    slug: 'aman-startup-journey',
    category: 'success-story',
    status: 'published',
    author: 'Aman Kumar',
    excerpt: 'How structured accountability and founder mentorship turned a rough idea into a viable MVP serving 400+ early users.',
    content: `<h2>The Idea</h2>
<p>We had an idea to solve a local problem—connecting skilled artisans with direct buyers, removing middlemen and increasing fair value to creators. But we had no experience building products, no tech background, and limited funding.</p>

<h2>Joining the DIL Startup Track</h2>
<p>The program gave us what we needed most: structure and accountability. Every week, we had to show progress. Every two weeks, we presented to founder mentors who had built and scaled companies.</p>

<h2>Key Milestones</h2>
<ul>
<li><strong>Week 3:</strong> Validated our idea with 50 potential users</li>
<li><strong>Week 6:</strong> Built our first MVP using no-code tools</li>
<li><strong>Week 9:</strong> Launched soft beta with 100 users</li>
<li><strong>Week 12:</strong> Reached 400 signups with strong retention</li>
</ul>

<h2>The Lesson</h2>
<p>Building a startup is 10% idea and 90% execution. DIL provided the execution framework—weekly deadlines, mentor feedback, peer pressure (in the best way), and community support that made the difference.</p>

<h2>Today</h2>
<p>We're now in conversations with impact investors and planning our Series Pre-A. We wouldn't be here without the structured 12-week journey.</p>`,
    seoTitle: 'Aman\'s DIL Startup Success: From Idea to 400 Users in 12 Weeks',
    seoDescription: 'Learn how weekly accountability and founder mentorship transformed a rough idea into a thriving startup prototype.',
    coverImage: 'https://images.pexels.com/photos/7974/pexels-photo-7974.jpeg?auto=compress&cs=tinysrgb&w=800',
    coverImageAlt: 'Team collaborating on startup ideas',
    tags: ['startup', 'entrepreneurship', 'innovation', 'mentorship']
  },
  {
    title: 'Launching a Community Initiative: Neha\'s Digital Literacy Project',
    slug: 'neha-digital-literacy-impact',
    category: 'success-story',
    status: 'published',
    author: 'Neha Sharma',
    excerpt: 'From DIL community member to founder of a regional digital literacy initiative serving 500+ girls.',
    content: `<h2>The Spark</h2>
<p>During my DIL journey, I noticed a gap. While I had access to digital tools and education, many girls in my region were completely disconnected. No internet access, no devices, no awareness of what was possible in the digital world.</p>

<h2>The DIL Community Connection</h2>
<p>What made it possible was the global network I found in DIL. Through the program, I connected with:</p>
<ul>
<li>Tech volunteers willing to teach remotely</li>
<li>Organizations with devices to donate</li>
<li>Fellow community leaders trying to solve similar problems</li>
<li>Mentors who guided my thinking on sustainability and scale</li>
</ul>

<h2>The Initiative</h2>
<p>We launched "Digital Bridge" in 2024. In the first 8 months:</p>
<ul>
<li>5 community centers equipped with devices and connectivity</li>
<li>500+ girls trained in basic digital literacy, coding basics, and online safety</li>
<li>50+ girls now pursuing tech internships and formal education</li>
<li>3 local partner organizations contributing to sustainability</li>
</ul>

<h2>The Bigger Picture</h2>
<p>This wouldn't exist without DIL introducing me to the right collaborators at the right time. The program taught me that massive impact comes from connecting the right people with a shared mission.</p>`,
    seoTitle: 'Neha\'s Community Impact: Digital Literacy for 500+ Girls',
    seoDescription: 'How DIL connections empowered Neha to launch a regional digital literacy initiative transforming girls\' lives.',
    coverImage: 'https://images.pexels.com/photos/3808056/pexels-photo-3808056.jpeg?auto=compress&cs=tinysrgb&w=800',
    coverImageAlt: 'Girls learning digital skills in a community center',
    tags: ['community', 'impact', 'digital-literacy', 'women-empowerment']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Check if stories already exist
    const existingCount = await Blog.countDocuments({ category: 'success-story' });
    console.log(`Found ${existingCount} existing success stories.`);

    // Delete existing sample stories (optional - uncomment to reset)
    // await Blog.deleteMany({ category: 'success-story' });
    // console.log('✓ Cleared existing success stories');

    // Add new stories
    for (const story of sampleStories) {
      const existing = await Blog.findOne({ slug: story.slug });
      if (!existing) {
        const created = await Blog.create(story);
        console.log(`✓ Created: "${created.title}"`);
      } else {
        console.log(`⊘ Already exists: "${story.title}"`);
      }
    }

    console.log('\n✓ Success stories seeding complete!');
    console.log('Stories are now visible on:');
    console.log('  - /success-stories page');
    console.log('  - Home page testimonials section');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
