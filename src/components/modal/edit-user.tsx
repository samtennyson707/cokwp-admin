import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { userUpdateFormSchema } from '@/lib/validation-schemas'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { updateProfile } from '@/services/profiles'
import type { TProfile } from '@/types/profile'

type EditUserModalProps = {
  user: TProfile
  onUpdated?: (user: TProfile) => void
}

export default function EditUserModal({ user, onUpdated }: EditUserModalProps) {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<z.input<typeof userUpdateFormSchema>>({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: null,
      avatar_url: null,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone ?? null,
        avatar_url: user.avatar_url ?? null,
      })
    }
  }, [open, user, form])

  function handleReset(): void {
    setOpen(false)
  }

  async function onSubmit(values: z.input<typeof userUpdateFormSchema>): Promise<void> {
    try {
      const updated = await updateProfile(user.id, values)
      onUpdated?.(updated)
      showSuccessToast('User updated successfully')
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit User</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input id="first_name" placeholder="John" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input id="last_name" placeholder="Doe" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input id="email" placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input id="phone" placeholder="+1234567890" type="tel" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input id="avatar_url" placeholder="https://..." type="url" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-2">Update User</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

