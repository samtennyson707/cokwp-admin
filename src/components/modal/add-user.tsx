import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { userRegistrationFormSchema } from "@/lib/validation-schemas"
import { useSessionStore } from "@/store/session"
import { showErrorToast, showSuccessToast } from "@/lib/toast-util"
import { useLoading } from "@/hooks/use-loading"

export function AddUserModal() {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { loading, setLoading } = useLoading()
  const { handleUserRegistration } = useSessionStore()

  const form = useForm<z.infer<typeof userRegistrationFormSchema>>({
    resolver: zodResolver(userRegistrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    },
  })

  const handleReset = () => {
    form.reset()
    setShowPassword(false)
    setOpen(false) // ✅ close the modal here
  }

  async function onSubmit(values: z.infer<typeof userRegistrationFormSchema>) {
    try {
      setLoading(true)
      await handleUserRegistration(
        values.email,
        values.password,
        values.first_name,
        values.last_name
      )
      showSuccessToast("User registration successful")
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="johndoe@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button loading={loading} type="submit">
                Add New User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
