import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await login(email, password);
      if (error) alert('Login failed');
    } else {
      const { error } = await signup(email, password);
      if (error) alert('Signup failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p className="mt-2 text-sm text-center cursor-pointer text-blue-600" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'No account? Sign up' : 'Have an account? Login'}
      </p>
    </div>
  );
}
