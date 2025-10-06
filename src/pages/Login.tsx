import { Button } from '@/components/ui/button'
import { useSessionStore } from '../store/session'
import { Input } from '@/components/ui/input'
import { useState } from 'react';

export default function Login() {
  const { handleSignIn, handleAdminRegistration } = useSessionStore();
  const [email, setEmail] = useState('priya.shukla@cokwp.com');
  const [password, setPassword] = useState('Chemistry@123');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignIn(email, password);
  };

  const handleRegister = async () => {
    await handleAdminRegistration(email, password);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <div className='max-w-xl w-full m-auto p-8 rounded-md  rounded-md'>
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-2 '>
          <p className='text-2xl font-bold text-gray-500'>
            Login to manage your courses and students
          </p>
          <Input
            type='email'
            placeholder='Email'
            value={email}
            onChange={handleEmailChange}
            className='w-full p-2 border border-gray-300 rounded-md mb-2'
          />
          <Input
            type='password'
            placeholder='Password'
            value={password}
            onChange={handlePasswordChange}
            className='w-full p-2 border border-gray-300 rounded-md mb-2'
          />
          <Button type='submit' className='w-full'>Login with Email</Button>
          <Button type='button' onClick={handleRegister}>
            Register Admin
          </Button>
        </form>
      </div>
    </div>
  )
}