import {
  LayoutDashboard,
  Inbox,
  UtensilsCrossed,
  Calculator,
  Grid,
  Users,
  Settings,
  Building,
  Layers,
  CheckCircle2,
  CreditCard,
  Briefcase,
  LifeBuoy,
  BellRing,
  BarChart3,
  Tag
} from 'lucide-react';
import { ROUTES } from './routes';



export const SUPER_ADMIN_NAVIGATION = [
  { label: 'Dashboard', path: ROUTES.SUPER_ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Coupons', path: ROUTES.SUPER_ADMIN.COUPONS, icon: Tag },
  { label: 'Restaurant', path: ROUTES.SUPER_ADMIN.RESTAURANTS, icon: Building },
  { label: 'Plans', path: ROUTES.SUPER_ADMIN.PLANS, icon: Layers },
  { label: 'Subscription', path: ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, icon: CheckCircle2 },
  { label: 'Billing & Payments', path: ROUTES.SUPER_ADMIN.BILLING, icon: CreditCard },
  { label: 'Leads/CRM', path: ROUTES.SUPER_ADMIN.LEADS, icon: Briefcase },
  { label: 'Support Ticket', path: ROUTES.SUPER_ADMIN.TICKETS, icon: LifeBuoy },
  { label: 'Notifications', path: ROUTES.SUPER_ADMIN.NOTIFICATIONS, icon: BellRing },
  { label: 'Reports & Analytics', path: ROUTES.SUPER_ADMIN.REPORTS, icon: BarChart3 }
];
