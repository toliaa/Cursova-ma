import AuthForm from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In or Create Account</h1>
        <AuthForm />
      </div>
    </div>
  )
}
