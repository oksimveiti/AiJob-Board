import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  console.log("Demo user created:", demoUser.email);

  // Create sample job applications
  const jobApplications = [
    {
      userId: demoUser.id,
      companyName: "Stripe",
      jobTitle: "Senior Frontend Engineer",
      applicationDate: new Date("2024-08-15"),
      status: "OPENING",
      location: "San Francisco, CA",
      salary: "$180k - $250k",
      notes: "Found interesting role, checking if requirements match skills",
    },
    {
      userId: demoUser.id,
      companyName: "Tech Solutions Inc.",
      jobTitle: "Frontend Developer",
      applicationDate: new Date("2024-07-15"),
      status: "APPLIED",
      location: "Remote",
      salary: "$90k - $110k",
      jobPostingLink: "https://example.com/job/frontend",
    },
    {
      userId: demoUser.id,
      companyName: "Innovate Hub",
      jobTitle: "UX Designer",
      applicationDate: new Date("2024-07-10"),
      status: "INTERVIEW_SCHEDULED",
      location: "New York, NY",
      notes: "First interview with hiring manager.",
    },
    {
      userId: demoUser.id,
      companyName: "Data Corp",
      jobTitle: "Data Analyst",
      applicationDate: new Date("2024-06-20"),
      status: "INTERVIEWING",
      location: "San Francisco, CA",
      salary: "$85k",
      jobPostingLink: "https://example.com/job/data",
    },
    {
      userId: demoUser.id,
      companyName: "Global Systems",
      jobTitle: "Backend Engineer",
      applicationDate: new Date("2024-05-01"),
      status: "OFFER",
      location: "Remote",
      notes: "Received offer, negotiating terms.",
    },
    {
      userId: demoUser.id,
      companyName: "Creative Minds",
      jobTitle: "Graphic Designer",
      applicationDate: new Date("2024-07-01"),
      status: "REJECTED",
      location: "Austin, TX",
    },
  ];

  for (const app of jobApplications) {
    await prisma.jobApplication.create({
      data: app,
    });
  }

  console.log(`Created ${jobApplications.length} sample job applications`);

  // Create sample base resume
  const baseResume = await prisma.baseResume.create({
    data: {
      userId: demoUser.id,
      name: "My Base Resume",
      content: `John Doe
Vancouver, BC | john.doe@email.com | (555) 123-4567

Professional Summary
-------------------
Aspiring Web Developer with strong foundation in modern web technologies and a passion for creating user-centric applications. Background in customer service and technical support, bringing excellent problem-solving skills and attention to detail.

Technical Skills
---------------
• Frontend: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express.js, REST APIs
• Databases: PostgreSQL, MongoDB, Prisma ORM
• Tools: Git, GitHub, VS Code, Figma
• Soft Skills: Problem-solving, Communication, Team Collaboration

Education
---------
Diploma in Web and Mobile App Development
Langara College, Vancouver, BC
Expected Graduation: 2025

Projects
--------
AI Job Board Application
• Built full-stack job tracking application with AI-powered resume generation
• Implemented Kanban board with drag-and-drop functionality
• Integrated Ollama LLM for intelligent resume customization
• Technologies: Next.js, TypeScript, Express, Prisma, SQLite

E-commerce Platform
• Developed responsive online store with shopping cart and checkout
• Implemented user authentication and product management
• Technologies: React, Node.js, MongoDB

Work Experience
--------------
Technical Support Specialist
XYZ Tech Company | 2022 - 2024
• Provided technical assistance to 50+ customers daily
• Documented and resolved software issues
• Collaborated with development team on bug fixes
• Maintained 95% customer satisfaction rating

Customer Service Representative
ABC Retail | 2020 - 2022
• Managed customer inquiries and resolved issues efficiently
• Processed orders and maintained accurate records
• Trained new team members on company policies`,
    },
  });

  console.log("Created sample base resume");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
