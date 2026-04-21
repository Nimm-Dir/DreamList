import { useDndContext } from '@dnd-kit/core'

type Over = ReturnType<typeof useDndContext>['over']
type Active = ReturnType<typeof useDndContext>['active']

function containerIdFromOver(over: Over): string | null {
  if (!over) return null
  const data = over.data?.current as { containerId?: string } | undefined
  if (data?.containerId) return data.containerId
  return typeof over.id === 'string' ? over.id : String(over.id)
}

function containerIdFromActive(active: Active): string | null {
  if (!active) return null
  const data = active.data?.current as { containerId?: string } | undefined
  return data?.containerId ?? null
}

export function useCrossContainerHighlight(myContainerId: string): boolean {
  const { over, active } = useDndContext()
  if (!over || !active) return false
  const overContainer = containerIdFromOver(over)
  const activeContainer = containerIdFromActive(active)
  if (!overContainer || !activeContainer) return false
  return overContainer === myContainerId && activeContainer !== myContainerId
}
