import { lazy } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';
import { RouteError } from '@/components/layout/RouteError';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';

// Lazy feature pages — code splitting per feature (spec §17).
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));

const LeadsListPage = lazy(() => import('@/features/leads/LeadsListPage'));
const LeadFormPage = lazy(() => import('@/features/leads/LeadFormPage'));
const LeadDetailPage = lazy(() => import('@/features/leads/LeadDetailPage'));

const ContactsListPage = lazy(() => import('@/features/contacts/ContactsListPage'));
const ContactFormPage = lazy(() => import('@/features/contacts/ContactFormPage'));
const ContactDetailPage = lazy(() => import('@/features/contacts/ContactDetailPage'));

const CompaniesListPage = lazy(() => import('@/features/companies/CompaniesListPage'));
const CompanyFormPage = lazy(() => import('@/features/companies/CompanyFormPage'));
const CompanyDetailPage = lazy(() => import('@/features/companies/CompanyDetailPage'));

const ServicesListPage = lazy(() => import('@/features/services/ServicesListPage'));
const ServiceFormPage = lazy(() => import('@/features/services/ServiceFormPage'));
const ServiceDetailPage = lazy(() => import('@/features/services/ServiceDetailPage'));

const PipelinePage = lazy(() => import('@/features/pipeline/PipelinePage'));

const OpportunitiesListPage = lazy(() => import('@/features/opportunities/OpportunitiesListPage'));
const OpportunityFormPage = lazy(() => import('@/features/opportunities/OpportunityFormPage'));
const OpportunityDetailPage = lazy(() => import('@/features/opportunities/OpportunityDetailPage'));

const QuotesListPage = lazy(() => import('@/features/quotes/QuotesListPage'));
const QuoteFormPage = lazy(() => import('@/features/quotes/QuoteFormPage'));
const QuoteDetailPage = lazy(() => import('@/features/quotes/QuoteDetailPage'));

const InvoicesListPage = lazy(() => import('@/features/invoices/InvoicesListPage'));
const InvoiceFormPage = lazy(() => import('@/features/invoices/InvoiceFormPage'));
const InvoiceDetailPage = lazy(() => import('@/features/invoices/InvoiceDetailPage'));

const ActivitiesPage = lazy(() => import('@/features/activities/ActivitiesPage'));

const CommunicationsPage = lazy(() => import('@/features/communications/CommunicationsPage'));
const WhatsAppPage = lazy(() => import('@/features/communications/WhatsAppPage'));
const EmailPage = lazy(() => import('@/features/communications/EmailPage'));

const UsersPage = lazy(() => import('@/features/users/UsersPage'));

function RequireAuth({ children }) {
  const { isBootstrapping, isAuthenticated } = useAuth();
  const location = useLocation();
  if (isBootstrapping) return <FullScreenLoader />;
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
}

function RedirectIfAuth({ children }) {
  const { isBootstrapping, isAuthenticated } = useAuth();
  if (isBootstrapping) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuth>
        <AuthLayout />
      </RedirectIfAuth>
    ),
    errorElement: <RouteError />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },

      { path: 'leads', element: <LeadsListPage /> },
      { path: 'leads/new', element: <LeadFormPage /> },
      { path: 'leads/:id', element: <LeadDetailPage /> },
      { path: 'leads/:id/edit', element: <LeadFormPage /> },

      { path: 'contacts', element: <ContactsListPage /> },
      { path: 'contacts/new', element: <ContactFormPage /> },
      { path: 'contacts/:id', element: <ContactDetailPage /> },
      { path: 'contacts/:id/edit', element: <ContactFormPage /> },

      { path: 'companies', element: <CompaniesListPage /> },
      { path: 'companies/new', element: <CompanyFormPage /> },
      { path: 'companies/:id', element: <CompanyDetailPage /> },
      { path: 'companies/:id/edit', element: <CompanyFormPage /> },

      { path: 'services', element: <ServicesListPage /> },
      { path: 'services/new', element: <ServiceFormPage /> },
      { path: 'services/:id', element: <ServiceDetailPage /> },
      { path: 'services/:id/edit', element: <ServiceFormPage /> },

      { path: 'pipeline', element: <PipelinePage /> },

      { path: 'opportunities', element: <OpportunitiesListPage /> },
      { path: 'opportunities/new', element: <OpportunityFormPage /> },
      { path: 'opportunities/:id', element: <OpportunityDetailPage /> },
      { path: 'opportunities/:id/edit', element: <OpportunityFormPage /> },

      { path: 'quotes', element: <QuotesListPage /> },
      { path: 'quotes/new', element: <QuoteFormPage /> },
      { path: 'quotes/:id', element: <QuoteDetailPage /> },
      { path: 'quotes/:id/edit', element: <QuoteFormPage /> },

      { path: 'invoices', element: <InvoicesListPage /> },
      { path: 'invoices/new', element: <InvoiceFormPage /> },
      { path: 'invoices/:id', element: <InvoiceDetailPage /> },
      { path: 'invoices/:id/edit', element: <InvoiceFormPage /> },

      { path: 'activities', element: <ActivitiesPage /> },

      { path: 'communications', element: <CommunicationsPage /> },
      { path: 'communications/email', element: <EmailPage /> },
      { path: 'communications/whatsapp', element: <WhatsAppPage /> },

      { path: 'settings/users', element: <UsersPage /> },

      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
