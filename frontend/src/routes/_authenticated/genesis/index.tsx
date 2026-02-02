import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/genesis/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/genesis/"!</div>
}
