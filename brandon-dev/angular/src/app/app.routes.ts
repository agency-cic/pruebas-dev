import { LayoutComponent } from './layouts/layout/layout.component';
import { VexRoutes } from '@vex/interfaces/vex-route.interface';
import { AuthGuard } from './core/auth/auth.guard';

export const appRoutes: VexRoutes = [
  {path: 'login', loadComponent: () => import('./pages/pages/auth/login/login.component').then((m) => m.LoginComponent),},
  {path: 'register',loadComponent: () =>import('./pages/pages/auth/register/register.component').then((m) => m.RegisterComponent)},
  {path: 'forgot-password',loadComponent: () =>import('./pages/pages/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent)},
  {path: 'coming-soon',loadComponent: () =>import('./pages/pages/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent)},
  {path: '',component: LayoutComponent,children: [
      {path: 'dashboards/analytics',redirectTo: '/',pathMatch: 'full'},
      {path: '',loadComponent: () => import('./pages/dashboards/dashboard-analytics/dashboard-analytics.component').then((m) => m.DashboardAnalyticsComponent,),canActivate: [AuthGuard]},
      {path: 'dash',loadChildren: () => import('./pages/apps/chat/chat.routes'),canActivate: [AuthGuard]},
      {path: 'apps',children: [
          {path: 'chat', loadChildren: () => import('./pages/apps/chat/chat.routes'),canActivate: [AuthGuard]},
          {path: 'mail', loadChildren: () => import('./pages/apps/mail/mail.routes'),data: {toolbarShadowEnabled: true,scrollDisabled: true},canActivate: [AuthGuard]},
          {path: 'social', loadChildren: () => import('./pages/apps/social/social.routes'),canActivate: [AuthGuard]},
          {path: 'contacts', loadChildren: () => import('./pages/apps/contacts/contacts.routes'),canActivate: [AuthGuard]},
          {path: 'calendar', loadComponent: () => import('./pages/apps/calendar/calendar.component').then((m) => m.CalendarComponent),data: {toolbarShadowEnabled: true},canActivate: [AuthGuard]},
          {path: 'aio-table', loadComponent: () => import('./pages/apps/aio-table/aio-table.component').then((m) => m.AioTableComponent),data: {toolbarShadowEnabled: false,canActivate: [AuthGuard]}},
          {path: 'help-center', loadChildren: () => import('./pages/apps/help-center/help-center.routes'),canActivate: [AuthGuard]},
          {path: 'scrumboard', loadChildren: () => import('./pages/apps/scrumboard/scrumboard.routes'),canActivate: [AuthGuard]},
          {path: 'editor',loadComponent: () => import('./pages/apps/editor/editor.component').then((m) => m.EditorComponent ), data: {scrollDisabled: true},canActivate: [AuthGuard]}
        ]
      },
      {path: 'pages', children: [
          {path: 'pricing', loadComponent: () => import('./pages/pages/pricing/pricing.component').then((m) => m.PricingComponent),canActivate: [AuthGuard]},
          {path: 'faq',loadComponent: () =>import('./pages/pages/faq/faq.component').then((m) => m.FaqComponent),canActivate: [AuthGuard]},
          {path: 'guides',loadComponent: () =>import('./pages/pages/guides/guides.component').then((m) => m.GuidesComponent),canActivate: [AuthGuard]},
          {path: 'invoice',loadComponent: () =>import('./pages/pages/invoice/invoice.component').then((m) => m.InvoiceComponent),canActivate: [AuthGuard]},
          {path: 'error-404',loadComponent: () =>import('./pages/pages/errors/error-404/error-404.component').then((m) => m.Error404Component),canActivate: [AuthGuard]},
          {path: 'error-500',loadComponent: () =>import('./pages/pages/errors/error-500/error-500.component').then((m) => m.Error500Component),canActivate: [AuthGuard]}
        ]
      },
      {path: 'ui',children: [
          {path: 'components',loadChildren: () =>import('./pages/ui/components/components.routes'),canActivate: [AuthGuard]},
          {path: 'forms/form-elements',loadComponent: () =>import('./pages/ui/forms/form-elements/form-elements.component').then((m) => m.FormElementsComponent),canActivate: [AuthGuard]},
          {path: 'forms/form-wizard',loadComponent: () =>import('./pages/ui/forms/form-wizard/form-wizard.component').then((m) => m.FormWizardComponent),canActivate: [AuthGuard]},
          {path: 'icons',loadChildren: () => import('./pages/ui/icons/icons.routes'),canActivate: [AuthGuard]},
          {path: 'page-layouts',loadChildren: () =>import('./pages/ui/page-layouts/page-layouts.routes'),canActivate: [AuthGuard]}
        ]
      },
      {path: 'documentation',loadChildren: () => import('./pages/documentation/documentation.routes'),canActivate: [AuthGuard]},
      {path: '**',loadComponent: () =>import('./pages/pages/errors/error-404/error-404.component').then((m) => m.Error404Component),canActivate: [AuthGuard]}
    ]
  }
];
