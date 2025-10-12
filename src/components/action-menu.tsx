import * as React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface ActionMenuItem {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
}

export interface ActionMenuProps {
  items: readonly ActionMenuItem[]
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export function ActionMenu({ items, trigger, onOpenChange }: ActionMenuProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Actions</Button>}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 min-w-[160px] rounded-md border bg-white p-1 shadow-md text-sm">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <DropdownMenuItem disabled={item.disabled} onSelect={item.onSelect} className="cursor-pointer select-none rounded-sm px-2 py-1.5 outline-none hover:bg-gray-100 text-xs text-black">
              {item.label}
            </DropdownMenuItem>
            {index < items.length - 1 && <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


