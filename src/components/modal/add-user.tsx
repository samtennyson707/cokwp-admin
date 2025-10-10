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
import { loginFormSchema } from '@/lib/validation-schemas'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import { useSessionStore } from '@/store/session'
import { Input } from "@/components/ui/input";

type MyModalProps = {

};

const formSchema = loginFormSchema
export function AddUserModal({ }: MyModalProps) {
  const { handleSignIn, handleAdminRegistration } = useSessionStore()
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'priya.shukla@cokwp.com',
      password: 'Chemistry@123',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // await handleSignIn(values.email, values.password)
      // showSuccessToast('Login successful')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      // showErrorToast(errorMessage)
    }
  }

  const handleRegisterUserClick = async () => {
    const email = form.getValues('email')
    const password = form.getValues('password')
    try {
      await handleAdminRegistration(email, password)
      showSuccessToast('User registration successful')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    }
  }
  return (
    <Dialog >
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
                <Button type='button' onClick={handleRegisterUserClick}>
                  Register User
                </Button>
              </div>
            </form>
          </Form>

        </div >

      </DialogContent >
    </Dialog >
  );
}
