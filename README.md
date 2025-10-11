# Work It Out - Insurance Quote Comparison Platform

A modern insurance quote comparison platform built with Next.js, allowing users to compare insurance quotes from leading New Zealand providers.

## Features

- 🔍 **Multi-Insurance Types**: Health, Life, Income Protection, Mortgage, and Trauma insurance
- 📊 **Quote Comparison**: Compare quotes from multiple NZ insurance providers
- 🎯 **Smart Forms**: Dynamic multi-step forms with conditional logic
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🤖 **AI Integration**: AI-powered recommendations and assistance
- 📈 **Analytics**: Comprehensive visitor and conversion tracking
- 🔧 **Admin Dashboard**: Complete admin interface for managing leads and analytics

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Prisma ORM with SQLite (development)
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT integration
- **Analytics**: Custom tracking system
- **Deployment**: Firebase/Vercel ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd work-it-out
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY="your_openai_api_key"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:9002"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) to view the application.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── health/         # Health insurance pages
│   │   ├── life/           # Life insurance pages
│   │   ├── income/         # Income protection pages
│   │   ├── mortgage/       # Mortgage insurance pages
│   │   └── trauma/         # Trauma insurance pages
│   ├── components/         # Reusable React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── quote/          # Quote wizard components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utility functions and configurations
│   ├── services/           # External service integrations
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── docs/                   # Project documentation
```

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Key Features

### Quote Wizard
Multi-step forms for different insurance types with:
- Dynamic question flows
- Progress tracking
- Form validation
- Mobile-responsive design

### Admin Dashboard
Comprehensive admin interface featuring:
- Lead management
- Analytics and reporting
- User management
- A/B testing tools
- API configuration

### Analytics System
Built-in tracking for:
- Visitor behavior
- Form interactions
- Conversion rates
- Real-time statistics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.