
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, Lock, User } from 'lucide-react';
import { signupSchmea } from '@/schemas/signupschema';
import { useFormik } from 'formik'

interface SignUpProps {
  onSignUp: (email: string, password: string, name: string) => void;
  onSwitchToSignIn: () => void;
}
interface UserState {
  username: string;
  email: string;
  password: string;
}
const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const initialState:UserState = {
    username: "",
    email: "",
    password: ""
  }


  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues: initialState,
    validationSchema: signupSchmea,
    onSubmit: (values) => {
      onSignUp(values.username, values.email, values.password);
    }
  })


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ChatApp</h1>
          <p className="text-white/80">Join the conversation</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                <Input
                  type="text"
                  placeholder="Username"
                  name='username'
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  required
                />
                {
                  errors.username && touched.username && (
                    <p className="form-error" style={{ color: '#ffffff' }}>
                      {errors.username}
                    </p>
                  )
                }
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name='email'
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  required
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
                  name='password'
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  required
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
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToSignIn}
                  className="text-white font-semibold underline hover:text-white/80 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
