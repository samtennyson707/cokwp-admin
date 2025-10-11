import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import Login from "@/pages/Login";
import { EyeOff, Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from "react";
import { userRegistrationFormSchema } from '@/lib/validation-schemas'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { useSessionStore } from '@/store/session'
import { Input } from "@/components/ui/input";

type MyModalProps = {

};

const formSchema = userRegistrationFormSchema
export function AddUserModal({ }: MyModalProps) {
  const { handleUserRegistration } = useSessionStore()
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  })

  const handleReset = () => {
    form.reset()
    setShowPassword(false)
    // close modal
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await handleUserRegistration(values.email, values.password, values.first_name, values.last_name)
      showSuccessToast('User registration successful')
      handleReset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-6 rounded-lg bg-card">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {/* Add user form goes here */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormControl>
                        <Input
                          id="first_name"
                          placeholder="John"
                          type="text"
                          autoComplete="first_name"
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          id="last_name"
                          placeholder="Doe"
                          type="text"
                          autoComplete="last_name"
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            placeholder="******"
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"}
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
                <Button type='submit'>
                  Add New User
                </Button>
              </div>
            </form>
          </Form>

        </div >

      </DialogContent >
    </Dialog >
  );
}
