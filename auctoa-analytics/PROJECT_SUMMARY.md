# Auctoa Analytics Dashboard - Code Summary

## Project Structure
```
src/
├── app/
│   ├── api/auctoa/chatbot-metrics/route.ts  # Supabase API endpoint
│   ├── chatbot/page.tsx                     # Chatbot analytics page
│   ├── login/page.tsx                       # Authentication page
│   ├── layout.tsx                           # Root layout
│   └── page.tsx                             # Main dashboard
├── components/
│   ├── ConditionalLayout.tsx                # Auth protection wrapper
│   ├── dashboard/                           # KPI cards & sections
│   ├── layout/                              # Header & sidebar
│   └── ui/                                  # Reusable UI components
├── lib/
│   ├── auctoa-data.ts                       # KPI definitions & data
│   ├── auth.ts                              # Simple authentication
│   ├── hooks/useAuctoaData.ts               # Data fetching hook
│   └── supabase.ts                          # Database connection
└── types/
    └── dashboard.ts                         # TypeScript types

```

## Key Features
- ✅ Real-time Supabase integration
- ✅ 8 enhanced chatbot KPIs
- ✅ Password protection (auctoa2025)
- ✅ Professional dashboard UI
- ✅ Geographic insights (German cities)
- ✅ Mobile responsive design

## Authentication Flow
1. All routes protected by ConditionalLayout
2. Unauthenticated users → redirect to /login
3. Password: "auctoa2025" 
4. Uses localStorage for session management

## Data Sources
- n8n_chat_histories (conversations)
- form_responses (property inquiries) 
- property_requests (assessments)
- form_config (portal settings)

## API Endpoint
GET /api/auctoa/chatbot-metrics
- Calculates 8 real-time KPIs
- Analyzes conversation quality
- Tracks conversion funnel
- Extracts geographic data

## Deployment Ready
- Environment variables needed:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - DASHBOARD_PASSWORD