# HomeStay Dorm - Implementation Status

## Completed Phases (1-5)

### Phase 1: Backend Setup ✅
- Created monorepo structure with `backend/supabase/` and `frontend/`
- Designed and created 15 interconnected database tables:
  - Core: roles, organizations, users
  - Rooms: rooms, beds
  - Business: bookings, deposits, contracts, contract_members, handover_checklists
  - Checkout: checkouts, checkout_inspections
  - Billing: invoices, payments
  - Admin: activity_logs
- Implemented comprehensive Row Level Security (RLS) policies for role-based access
- Seeded master data: 5 user roles + demo organization

### Phase 2: Frontend Auth & Supabase Integration ✅
- Installed @supabase/ssr, zustand, and next-themes
- Created Supabase clients: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Built middleware: `middleware.ts` for auth protection + role-based routing
- Created auth server actions: signUp, signIn, signOut, getCurrentUser
- Auth callback route for OAuth flows: `(auth)/callback/route.ts`
- Defined TypeScript types: business.types.ts (16 types covering all entities)
- Created constants: roles.ts (role definitions + menu items), routes.ts (status enums)

### Phase 3: Shared Components & Design System ✅
- Zustand UI store: `src/store/ui.store.ts` (modals, notifications, filters, sidebar)
- Layout components:
  - DashboardLayout: main wrapper with sidebar + topbar
  - Sidebar: responsive with role-based menu navigation
  - TopBar: theme toggle + user menu + sign out
- Shared business components:
  - StatusBadge: color-coded status display (15+ status types)
  - RoomCard: room preview with pricing, capacity, area
- Dark mode support with next-themes
- Updated root layout.tsx with ThemeProvider

### Phase 4: Role-Based Dashboards ✅
- Created dashboard layout: `(dashboard)/layout.tsx` with user role detection
- Dashboard redirect page: `(dashboard)/page.tsx` routes by role
- 5 Role-specific dashboards with stats + quick actions:
  - Customer: booking status, deposits, contracts, invoices
  - Sales: viewing schedules, new customers, available rooms
  - Manager: total rooms, today's check-ins, pending checkouts
  - Accountant: revenue, payments, overdue invoices, debt
  - Admin: users, rooms, system health, activity logs
- Auth pages:
  - Login page: email/password form
  - Register page: customer registration with validation

### Phase 5: Booking Module (Quy Trình 1) ✅
- Server actions: `src/actions/booking.actions.ts`
  - getRooms: fetch available rooms by organization
  - getBookings: fetch user's bookings
  - getBookingDetail: fetch single booking
  - createBooking: create new booking
  - updateBooking: update existing booking
- Booking list page: `(dashboard)/booking/page.tsx`
  - Table view with pagination
  - Status display, date formatting
  - Link to detail/create page
- Booking form page: `(dashboard)/booking/[id]/page.tsx`
  - Multi-step form (3 steps):
    1. Room selection (visual cards with filtering)
    2. Rental details (dates, occupants)
    3. Confirmation (review before submit)
  - Form validation and submission
  - Works for both create and edit

---

## Remaining Phases (6-9)

### Phase 6: Deposit Module (Quy Trình 2) [TODO]

**Server Actions**: `src/actions/deposit.actions.ts`
- getDeposits(userId): fetch user's deposits
- getDepositDetail(depositId): fetch single deposit
- createDeposit(deposit): create new deposit
- confirmDeposit(depositId, proof_url): confirm with payment proof
- (Edge function for 24h auto-cancel)

**Pages**:
- `(dashboard)/deposit/page.tsx` - List deposits with status, amount, confirmation date
- `(dashboard)/deposit/[id]/page.tsx` - Detail + form:
  1. Deposit summary (amount based on booking)
  2. Payment instructions (bank details)
  3. Proof upload (drag-drop file upload)
  4. Status tracker (timeline showing steps)

**Components**:
- DepositSummaryCard: show calculated deposit amount
- PaymentInstructions: display payment method details
- ProofUploadArea: drag-drop file upload
- DepositStatusTracker: visual timeline
- DepositCountdown: 24h countdown timer (optional UI, backend handles auto-cancel)

---

### Phase 7: Contract Module (Quy Trình 3) [TODO]

**Server Actions**: `src/actions/contract.actions.ts`
- getContracts(userId): fetch contracts
- getContractDetail(contractId): fetch with members
- createContract(contract, members): create with members
- updateContractStatus(contractId, status): update status
- signContract(contractId, signature_url): record customer signature
- addContractMember(contractId, member): add member
- removeContractMember(memberId): remove member
- createHandoverChecklist(contractId, items): create checklist

**Pages**:
- `(dashboard)/contract/page.tsx` - List contracts (table + status)
- `(dashboard)/contract/[id]/page.tsx` - Detail + multi-step form:
  1. Contract info (dates, rent amount)
  2. Members management (add/remove group members)
  3. Digital signature (capture signature)
  4. Handover checklist (items before moving in)
  5. First invoice (auto-generated from system)

**Components**:
- ContractDetail: display contract info
- MemberManagement: table + form to add/remove members
- ContractSignature: digital signature pad
- RoomHandoverChecklist: item list with conditions
- FirstInvoiceUI: auto-calculated invoice display

---

### Phase 8: Checkout Module (Quy Trình 4) [TODO]

**Server Actions**: `src/actions/checkout.actions.ts`
- getCheckouts(userId/orgId): list checkouts
- getCheckoutDetail(checkoutId): fetch with inspections
- requestCheckout(contractId): create checkout request
- updateCheckoutStatus(checkoutId, status): update status
- addInspection(checkoutId, inspection): add inspection item
- calculateRefund(checkoutId): compute refund amount

**Pages**:
- `(dashboard)/checkout/page.tsx` - List with status + refund amount
- `(dashboard)/checkout/[id]/page.tsx` - Detail + multi-step form:
  1. Checkout request (register checkout)
  2. Room inspection (condition assessment, photos)
  3. Asset return checklist (keys, items returned)
  4. Refund calculation (show deductions, final amount)
  5. Checkout workflow (step tracker to completion)

**Components**:
- CheckoutRequestForm: initial request form
- RoomInspectionCheckout: condition form with photo upload
- AssetReturnChecklist: item checklist
- RefundCalculation: breakdown display
- CheckoutWorkflow: visual step tracker

---

### Phase 9: Billing & Admin & Polish [TODO]

**Billing Module**:
- Server actions: `src/actions/billing.actions.ts`
  - getInvoices(customerId/orgId)
  - getInvoiceDetail(invoiceId)
  - createInvoice(contract, monthYear)
  - getPayments(customerId/orgId)
  - recordPayment(invoiceId, amount, method, proof)

- Pages:
  - `(dashboard)/invoice/page.tsx` - Invoice list (table with status, due date)
  - `(dashboard)/invoice/[id]/page.tsx` - Detail + pay form
  - `(dashboard)/payment/page.tsx` - Payment history

**Admin Module**:
- Server actions: `src/actions/admin.actions.ts`
  - getUsers(orgId, role)
  - createUser(user, role)
  - updateUser(userId, updates)
  - deleteUser(userId)
  - getRooms(orgId)
  - createRoom(room)
  - updateRoom(roomId, updates)
  - getActivityLogs(orgId, filters)

- Pages:
  - `(dashboard)/users/page.tsx` - User management (CRUD table)
  - `(dashboard)/rooms/page.tsx` - Room inventory (CRUD table)
  - `(dashboard)/logs/page.tsx` - Activity audit log
  - `(dashboard)/settings/page.tsx` - System config

**Polish & Testing**:
- Error boundaries for graceful error handling
- Loading states for all async operations
- Toast notifications for user feedback
- Form validation across all modules
- Dark mode testing on all pages
- Responsive design testing (mobile, tablet, desktop)
- Input sanitization and XSS prevention
- WCAG AA accessibility audit

---

## Architecture Overview

```
/backend/supabase/
├── migrations/
│   ├── 001_initial_schema.sql (15 tables, indexes)
│   ├── 002_rls_policies.sql (50+ RLS policies)
│   └── 003_seed_data.sql (roles, org)
├── functions/
│   └── auto-cancel-deposit.ts (Edge function for 24h timeout)
└── config.toml

/frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx ✅
│   │   ├── register/page.tsx ✅
│   │   └── callback/route.ts ✅
│   ├── (dashboard)/
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx (redirect) ✅
│   │   ├── customer/page.tsx ✅
│   │   ├── sale/page.tsx ✅
│   │   ├── manager/page.tsx ✅
│   │   ├── accountant/page.tsx ✅
│   │   ├── admin/page.tsx ✅
│   │   ├── booking/ (DONE)
│   │   │   ├── page.tsx ✅
│   │   │   └── [id]/page.tsx ✅
│   │   ├── deposit/ (TODO)
│   │   ├── contract/ (TODO)
│   │   ├── checkout/ (TODO)
│   │   ├── invoice/ (TODO)
│   │   ├── payment/ (TODO)
│   │   ├── users/ (TODO)
│   │   ├── rooms/ (TODO)
│   │   └── logs/ (TODO)
│   └── layout.tsx (with ThemeProvider) ✅
├── actions/
│   ├── auth.actions.ts ✅
│   ├── booking.actions.ts ✅
│   ├── deposit.actions.ts (TODO)
│   ├── contract.actions.ts (TODO)
│   ├── checkout.actions.ts (TODO)
│   ├── billing.actions.ts (TODO)
│   └── admin.actions.ts (TODO)
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx ✅
│   │   ├── Sidebar.tsx ✅
│   │   └── TopBar.tsx ✅
│   └── shared/
│       ├── StatusBadge.tsx ✅
│       ├── RoomCard.tsx ✅
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts ✅
│   │   └── server.ts ✅
│   └── utils.ts (shadcn cn) ✅
├── store/
│   └── ui.store.ts ✅
├── types/
│   └── business.types.ts ✅
└── constants/
    ├── roles.ts ✅
    └── routes.ts ✅
```

---

## Data Flow Example

**Booking Workflow**:
1. Customer visits `/dashboard/booking/new`
2. Frontend calls `getRooms(orgId)` → displays RoomCard components
3. Customer selects room → `setSelectedRoom()` → step 2
4. Fills form (dates, occupants) → validates → step 3
5. Reviews summary → clicks "Xác Nhận Đơn Đăng Ký"
6. Frontend calls Server Action `createBooking()`
7. Server Action calls Supabase `insert` → RLS policy checks `customer_id = auth.uid()`
8. Database confirms insert → return data
9. Frontend redirects to `/dashboard/booking` → fetches updated list

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or production URL)
```

---

## Next Steps to Complete Project

1. **Phase 6 (Deposit)**: Follow the same pattern as Booking
   - Create `deposit.actions.ts` with CRUD operations
   - Create list and form pages
   - Add file upload for payment proof
   - Implement 24h countdown timer

2. **Phase 7 (Contract)**: More complex with members + signature
   - Create `contract.actions.ts`
   - Implement member management (add/remove)
   - Add digital signature component
   - Create handover checklist form

3. **Phase 8 (Checkout)**: Similar to contract
   - Create `checkout.actions.ts`
   - Implement room inspection with photo upload
   - Calculate refund with deductions
   - Track workflow status

4. **Phase 9 (Billing, Admin, Polish)**:
   - Billing: list invoices, record payments, debt tracking
   - Admin: user/room CRUD, activity logs
   - Add error boundaries, loading states, notifications
   - Test dark mode, responsiveness, accessibility

---

## Testing Checklist

- [ ] Login/Register flow with Supabase Auth
- [ ] Role-based dashboard routing
- [ ] Booking creation → list display
- [ ] Deposit payment proof upload
- [ ] Contract signing + member management
- [ ] Checkout inspection + refund calculation
- [ ] Invoice generation + payment recording
- [ ] Admin user/room management
- [ ] Dark mode toggle on all pages
- [ ] Mobile responsive (sm, md, lg breakpoints)
- [ ] Form validation + error messages
- [ ] RLS policy enforcement (try accessing other user's data)
- [ ] Activity audit logs recorded

---

## Production Checklist

- [ ] Set environment variables in Vercel
- [ ] Enable email verification in Supabase Auth
- [ ] Review all RLS policies for security
- [ ] Add rate limiting on key endpoints
- [ ] Enable CORS for production domain
- [ ] Setup backup strategy for database
- [ ] Monitor error logs + performance
- [ ] Document API and data models
- [ ] Create user guide/documentation
