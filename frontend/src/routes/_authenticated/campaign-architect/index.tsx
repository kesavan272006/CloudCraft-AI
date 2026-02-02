import { createFileRoute } from '@tanstack/react-router'
import { GenesisCanvas } from '@/features/genesis/GenesisCanvas'

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})

function CampaignArchitectPage() {
  return <GenesisCanvas />
}
