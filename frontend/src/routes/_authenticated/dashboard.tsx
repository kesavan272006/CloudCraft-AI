import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

// Change from '/_authenticated/' to '/_authenticated/dashboard'
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})