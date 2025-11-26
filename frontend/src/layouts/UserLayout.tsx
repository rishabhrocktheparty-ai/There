/**
 * User Layout Component
 * Wrapper that uses DashboardLayout for user-facing pages with error boundary
 */

import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const UserLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardLayout />
    </ErrorBoundary>
  );
};
