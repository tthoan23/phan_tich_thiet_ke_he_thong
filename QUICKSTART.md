# HomeStay Dorm - Quick Start Guide

## What's Been Built

✅ **Complete Backend** - 15 database tables with RLS policies  
✅ **Auth System** - Supabase integration with role-based routing  
✅ **Design System** - Sidebar, TopBar, StatusBadge, RoomCard  
✅ **Dashboards** - 5 role-specific dashboards  
✅ **Booking Module** - Full room search, booking form, list  

## Getting Started

### 1. Environment Setup

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Run Development Server

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

### 3. Test the System

**Register a new customer:**
- Go to http://localhost:3000/auth/register
- Fill form with email, name, password
- Go to http://localhost:3000/auth/login
- Login with credentials

**Browse dashboards:**
- Customer will see customer dashboard
- Navigate to "Lịch Sử Đăng Ký" → "Đăng Ký Mới"
- Select a room → fill dates → confirm booking
- View booking in list

**Test role-based access:**
- Only staff (Manager, Accountant, Admin roles) can see their specialized dashboards
- RLS policies restrict data access at database level

## File Structure Reference

```
Essential Files to Know:

Authentication:
- src/actions/auth.actions.ts → signUp, signIn, getCurrentUser
- middleware.ts → Auth protection + role routing
- src/lib/supabase/ → Client setup

Booking (Complete Example):
- src/actions/booking.actions.ts → CRUD operations
- src/(dashboard)/booking/page.tsx → List view
- src/(dashboard)/booking/[id]/page.tsx → Form + detail
- src/components/shared/RoomCard.tsx → Reusable card

Layout:
- src/components/layout/DashboardLayout.tsx → Main wrapper
- src/components/layout/Sidebar.tsx → Navigation
- src/components/layout/TopBar.tsx → Header + menu

State:
- src/store/ui.store.ts → Zustand for UI state (modals, notifications)

Types:
- src/types/business.types.ts → All TypeScript interfaces
- src/constants/roles.ts → Role definitions
- src/constants/routes.ts → Route constants + status enums
```

## Implementing the Next Module (Deposit)

### Step 1: Create Server Actions
`src/actions/deposit.actions.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { Deposit } from '@/types/business.types'

export async function getDeposits(userId: string): Promise<Deposit[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('deposits')
    .select('*')
    .eq('customer_id', userId)
  return data || []
}

export async function createDeposit(deposit: Omit<Deposit, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deposits')
    .insert([deposit])
    .select()
  if (error) return { error: error.message }
  return { data: data?.[0] }
}

// Add other CRUD operations...
```

### Step 2: Create List Page
`src/(dashboard)/deposit/page.tsx`
- Similar pattern to booking list
- Table with deposit amounts, payment status, dates
- Link to create/detail form

### Step 3: Create Form Page
`src/(dashboard)/deposit/[id]/page.tsx`
- Multi-step form (similar to booking):
  1. Deposit summary (auto-calculated from booking)
  2. Payment instructions (bank details)
  3. File upload for payment proof
  4. Status tracker (timeline)

### Step 4: Add Component for File Upload
`src/components/shared/ProofUploadArea.tsx`
- Use Vercel Blob for file storage (optional)
- Drag-drop or click to upload
- Show upload progress

### Step 5: Add Components for Timeline
`src/components/shared/DepositStatusTracker.tsx`
- Visual timeline showing: Requested → Confirmed → Refunded

## Database Queries You Might Need

All table structures are defined in `/backend/supabase/migrations/001_initial_schema.sql`

Common queries:
```sql
-- Get customer's bookings
SELECT * FROM bookings WHERE customer_id = auth.uid()

-- Get room with beds
SELECT b.* FROM beds b
JOIN rooms r ON b.room_id = r.id
WHERE r.status = 'AVAILABLE'

-- Get invoices not paid
SELECT * FROM invoices 
WHERE customer_id = auth.uid() AND status != 'PAID'

-- Record payment
INSERT INTO payments (customer_id, invoice_id, amount, payment_date)
VALUES (...)

-- All queries are protected by RLS policies
-- RLS automatically filters by organization + user role
```

## Common Patterns

### Server Action Pattern
```typescript
// src/actions/module.actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getItems(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  return data || []
}

export async function createItem(item: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('table_name')
    .insert([item])
    .select()
  
  if (error) return { error: error.message }
  return { data: data?.[0] }
}
```

### Component Pattern
```typescript
// src/components/shared/ItemCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ItemCardProps {
  item: any
  onAction?: () => void
}

export function ItemCard({ item, onAction }: ItemCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  )
}
```

### Page Pattern
```typescript
// src/(dashboard)/module/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function ModuleListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      const { getItems } = await import('@/actions/module.actions')
      const user = await getCurrentUser()
      const data = await getItems(user.id)
      setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Items</h1>
        <Link href="/dashboard/module/new">
          <Button>Create New</Button>
        </Link>
      </div>

      {/* Render items */}
    </div>
  )
}
```

## Troubleshooting

**Auth not working?**
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Confirm Supabase project is created and configured
- Check middleware.ts is in root directory (not in src/)

**RLS policies denying access?**
- View audit logs in Supabase dashboard
- Policies check `auth.uid()` matches user record
- Verify user has correct organization_id
- Check role-based conditions (e.g., r.code = 'ADMIN')

**Data not showing?**
- Open browser DevTools → Network
- Check API calls are being made
- Verify Supabase session cookie is set
- Check RLS policies allow read access

**Components not rendering?**
- Check imports match file paths
- Verify component exists at path
- Check for TypeScript errors
- Run `pnpm build` to catch missing deps

## Next Priority Tasks

1. **Deposit Module** - Follow steps above, add file upload + countdown
2. **Contract Module** - Add digital signature component + member management
3. **Checkout Module** - Add inspection form + photo upload + refund calculation
4. **Billing & Admin** - Invoice management + user/room admin CRUD
5. **Polish** - Error boundaries, notifications, validation, accessibility

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For implementation questions, refer to:
- `IMPLEMENTATION_STATUS.md` - Full architecture overview
- `src/types/business.types.ts` - All data types defined
- Booking module (`src/actions/booking.actions.ts` + pages) - Complete working example
- Database schema (`backend/supabase/migrations/001_initial_schema.sql`)
