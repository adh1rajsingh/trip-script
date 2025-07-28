# TripScript

A modern trip planning application built with Next.js that helps users discover, map, and organize their travels in one intuitive platform.

## Live Demo

- [**Live Site**](https://trip-script.adh1raj.me/)

## Demo Video

[![TripScript Demo](https://res.cloudinary.com/dskj7wqn8/image/upload/v1753674969/Your_Trips_mbg999.png)](https://res.cloudinary.com/dskj7wqn8/video/upload/v1753674790/My_Movie_bk8b2n.mp4)

*Click the image above to watch the demo video*

> **Note**: My goal was to finish a full-stack project and deploy it to submit to the Boot.dev hackathon and practice the backend skills I learned at Boot.dev, so I mainly worked on the backend with the goal to learn Nextjs and also practice React. The UI (Tailwind) and some React stuff was done by my good friend Claude. It also helped me in many small bits and pieces in structuring and understanding Next.js. This project is very much incomplete from my vision, and I will constantly be working on it to make it better. I Hope you like it!

## Features

- **User Authentication**: Secure authentication powered by Clerk
- **Trip Management**: Create, view, and delete trips with ease
- **Interactive Itinerary Builder**: Day-by-day trip planning with date-specific activities
- **Place Management**: Add and remove places from your itinerary
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Real-time Updates**: Instant UI updates when managing trip data

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **UI Components**: Lucide React Icons
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tripscript.git
   cd tripscript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your_postgresql_connection_string"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   CLERK_WEBHOOK_SIGNING_SECRET="your_webhook_secret"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes
│   │   ├── dashboard/     # User dashboard
│   │   └── trips/         # Trip management pages
│   ├── actions/           # Server actions
│   ├── api/               # API routes (webhooks)
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── db/                    # Database configuration and schema
└── middleware.ts          # Route protection middleware
```
## Database Schema

The application uses a relational database with the following main entities:

- **Users**: Integrated with Clerk authentication
- **Trips**: User's travel plans with destinations and dates
- **Itinerary Items**: Individual places/activities within trips

## Server Actions

- **Trip Management**: Create and delete trips
- **Itinerary Management**: Add and remove places from daily itineraries
- **Real-time Updates**: Automatic page revalidation after data changes

### Future Features
- [ ] **Enhanced UI/UX**: Add loading states and better error handling
- [ ] **Trip Editing**: Allow users to edit trip details (dates, destination)
- [ ] **Drag & Drop**: Reorder itinerary items within days
- [ ] **Trip Sharing**: Share trip itineraries with others
- [ ] **Maps Integration**: Google Maps/Mapbox integration for location visualization
- [ ] **AI Recommendations**: AI-powered place suggestions based on destination
- [ ] **Photo Upload**: Add photos to places and trips
- [ ] **Weather Integration**: Show weather forecasts for trip dates
- [ ] **Collaborative Planning**: Ability for users to invite and work with friends
- [ ] **Export Options**: PDF/print-friendly itinerary exports
- [ ] **Mobile App**: React Native mobile application
- [ ] **Offline Support**: PWA capabilities for offline trip viewing

### Technical Enhancements
- [ ] **Performance**: Image optimization and lazy loading
- [ ] **Testing**: Unit and integration test coverage
- [ ] **Monitoring**: Error tracking and analytics
- [ ] **SEO**: Enhanced metadata and social sharing
- [ ] **Accessibility**: WCAG compliance improvements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Clerk](https://clerk.com/)
- Database ORM by [Drizzle](https://orm.drizzle.team/)
- Hosted on [Vercel](https://vercel.com/docs)
- AI - Claude Sonnet 4