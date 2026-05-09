# HomeStay Dorm - Setup & Debugging Guide

## Current Status

✅ **Project is now fully functional!** The white screen issue has been fixed. Here's what was corrected:

### Issues Fixed
1. **Missing root page** - Created `/app/page.tsx` with a beautiful landing page
2. **TypeScript path aliases** - Fixed `tsconfig.json` to point `@/*` to `./app/*` 
3. **Auth route structure** - Updated root and middleware to work with `/(auth)/` and `/(dashboard)/` folder structure
4. **Missing auth layout** - Created `/(auth)/layout.tsx`

## Accessing the Application

### Test Page (No Auth Required)
- **URL**: `http://localhost:3001/test` or `/test`
- Shows system overview and features
- No authentication needed - perfect for testing the UI framework

### Landing Page
- **URL**: `http://localhost:3001/` or `/`
- Beautiful welcome page with feature highlights
- Links to Login, Register, and Test pages
- Fully functional and styled

### Authentication Pages
- **Login**: `http://localhost:3001/login` - Email/password login
- **Register**: `http://localhost:3001/register` - New customer registration
- **Callback**: `http://localhost:3001/callback` - OAuth callback handler

### Dashboards (Requires Login)
After authentication, users are redirected to role-specific dashboards:
- **Customer**: `http://localhost:3001/customer`
- **Sales**: `http://localhost:3001/sale`
- **Manager**: `http://localhost:3001/manager`
- **Accountant**: `http://localhost:3001/accountant`
- **Admin**: `http://localhost:3001/admin`

## Testing the System

### 1. Start with the Test Page
Visit `/test` to see the application's UI framework in action without needing authentication.

### 2. Create a Test Account
1. Go to `/register`
2. Create a new customer account
3. Verify email (use the Supabase dashboard if needed)
4. Log in with your new account

### 3. Explore Dashboards
Once logged in, you'll be redirected to your role's dashboard where you can explore the implemented features:
- **Booking Module**: Search rooms, create bookings, manage schedules
- **Deposit Module**: Track deposits, upload payment proofs, manage confirmations
- **Contract Module**: Sign contracts, manage members, process handovers

## Database Schema

The system uses 15 interconnected tables with Row Level Security:
- **roles** - 5 user roles (Customer, Sale, Manager, Accountant, Admin)
- **organizations** - Dorm branches/locations
- **users** - Extended user profiles with roles
- **rooms** - Dorm rooms with pricing and availability
- **beds** - Individual beds within rooms
- **bookings** - Rental requests and schedules
- **deposits** - Deposit tracking and confirmation
- **contracts** - Rental agreements with signatures
- **contract_members** - Household members
- **invoices** - Monthly billing
- **payments** - Payment tracking
- **checkouts** - Checkout requests and refunds
- **activity_logs** - System audit trail

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Environment Variables

All required Supabase environment variables are automatically set via the Vercel integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- And database connection URLs

## Project Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── callback/route.ts
├── (dashboard)/         # Protected dashboard routes
│   ├── customer/page.tsx
│   ├── sale/page.tsx
│   ├── manager/page.tsx
│   ├── accountant/page.tsx
│   └── admin/page.tsx
├── booking/            # Booking module
│   ├── page.tsx        # List bookings
│   └── [id]/page.tsx   # Form/detail
├── deposit/            # Deposit module
│   ├── page.tsx        # List deposits
│   └── [id]/page.tsx   # Form/detail
├── contract/           # Contract module
│   ├── page.tsx        # List contracts
│   └── [id]/page.tsx   # Form/detail with signature
├── actions/            # Server Actions
│   ├── auth.actions.ts
│   ├── booking.actions.ts
│   ├── deposit.actions.ts
│   └── contract.actions.ts
├── components/         # React components
│   ├── layout/
│   ├── shared/
│   └── ui/
├── lib/                # Utilities
│   └── supabase/
│       ├── client.ts   # Browser client
│       └── server.ts   # Server client
└── page.tsx            # Landing page

backend/
└── supabase/
    ├── migrations/     # Database schemas
    └── seed.sql        # Initial data
```

## Troubleshooting

### White Screen Issue
**Already Fixed!** But if you encounter it again:
1. Check `/app/page.tsx` exists
2. Verify `tsconfig.json` has correct path aliases
3. Check middleware.ts allows public routes
4. Restart dev server: `pnpm dev`

### Database Connection Issues
1. Verify Supabase environment variables are set
2. Check Supabase project is running
3. Ensure schema migrations have been applied
4. Check RLS policies are correct

### Import Errors
Make sure `tsconfig.json` has:
```json
"paths": {
  "@/*": ["./app/*"]
}
```

### Middleware Deprecation Warning
The warning about "middleware" being deprecated is harmless - Next.js 16 prefers "proxy" but "middleware" still works.

## Next Steps

1. **Test the Authentication Flow**
   - Create an account
   - Log in
   - View your role-specific dashboard

2. **Explore the Booking Module**
   - Search for rooms
   - Create a booking
   - View booking status

3. **Test the Deposit Module**
   - Create a deposit request
   - Upload payment proof
   - Track confirmation status

4. **Complete the Remaining Modules** (Phases 8-9)
   - Checkout module
   - Billing/payments
   - Admin management
   - Activity logs

## Support

For detailed implementation documentation, see:
- `PROJECT_SUMMARY.md` - Complete feature overview
- `IMPLEMENTATION_STATUS.md` - Architecture and implementation details
- `COMPLETION_REPORT.md` - Final delivery report
- `FILES_CREATED.md` - Complete file manifest
