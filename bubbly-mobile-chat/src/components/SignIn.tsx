
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, Lock } from 'lucide-react';
import { useFormik } from 'formik'
import { signinSchmea } from '@/schemas/signinschema';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp }) => {

  let initialState = {
    email: "",
    password: ""
  }
  const { values, errors, touched, handleChange, handleBlur,handleSubmit } = useFormik({
    initialValues: initialState,
    validationSchema: signinSchmea,
    onSubmit: (values) => {
      onSignIn(values.email, values.password);
    }
  })

  console.log("errors",errors)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bloop</h1>
          <p className="text-white/80">Connect with friends instantly</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                <Input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
                {
                  errors.email && touched.email && (
                    <p className="form-error" style={{ color: '#ffffff' }}>
                      {errors.email}
                    </p>
                  )
                }
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
                {
                  errors.password && touched.password && (
                    <p className="form-error" style={{ color: '#ffffff' }}>
                      {errors.password}
                    </p>
                  )
                }
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-3 transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-white font-semibold underline hover:text-white/80 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
