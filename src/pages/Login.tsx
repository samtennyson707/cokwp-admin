import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { showErrorToast, showSuccessToast } from '@/lib/toast-util'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { loginFormSchema } from '@/lib/validation-schemas'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useSessionStore } from '@/store/session'
import { useLoading } from '@/hooks/use-loading'

const formSchema = loginFormSchema

export default function Login() {
  const { handleSignIn } = useSessionStore()
  const [showPassword, setShowPassword] = useState(false);
  const { loading: loadingLogin, setLoading: setLoadingLogin } = useLoading()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoadingLogin(true)
      await handleSignIn(values.email, values.password)
      showSuccessToast('Login successful')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showErrorToast(errorMessage)
    } finally {
      setLoadingLogin(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      {/* <FormLabel htmlFor="email">Email</FormLabel> */}
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
                <Button loading={loadingLogin} type="submit" className="w-full">
                  Login
                </Button>
                {/* <Button loading={loadingRegister} type='button' onClick={handleRegisterAdminClick}>
                  Register Admin
                </Button> */}
              </div>
            </form>
          </Form>
        </CardContent>

        {/* <CardContent>
          {renderAdminCredentialForTesting()}
        </CardContent> */}
      </Card>
    </div>
  )
}
