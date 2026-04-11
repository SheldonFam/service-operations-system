import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../schemas/login.schema'
import type { LoginFormValues } from '../schemas/login.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { mapSignInError } from '@/lib/utils'
import { Snowflake } from 'lucide-react'
import { Spinner } from '@/components/Spinner'

export function LoginPage() {
  const { user, signIn, loading: authLoading } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (authLoading) {
    return <Spinner fullScreen />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setError('root', { message: mapSignInError(error) })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Snowflake aria-hidden="true" className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sejuk Sejuk Service</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} aria-describedby={errors.root ? 'login-error' : undefined}>
            <fieldset disabled={isSubmitting} className="space-y-4">
              <FormField label="Email" error={errors.email?.message} required>
                {(fieldProps) => (
                  <Input
                    type="email"
                    placeholder="you@sejuk.com"
                    autoComplete="email"
                    {...register('email')}
                    {...fieldProps}
                  />
                )}
              </FormField>

              <FormField label="Password" error={errors.password?.message} required>
                {(fieldProps) => (
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    {...fieldProps}
                  />
                )}
              </FormField>

              {errors.root && (
                <p id="login-error" role="alert" className="text-sm text-destructive">
                  {errors.root.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in\u2026' : 'Sign In'}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
