"use client"

import React, { useEffect, useState } from 'react'
import { getUser } from '@/services/user.service'
import { useAuthStore } from '@/store/user.store'
import { useRouter, usePathname } from 'next/navigation'
import { getOrCreateAvatarColor } from '@/lib/avatar'

function AuthProvider({ children }: { children: React.ReactNode }) {

  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  async function fetchUser(){
     try{

      const userData = await getUser();
      
      // Get or create avatar color from localStorage
      const avatarColor = getOrCreateAvatarColor(userData.data.id);
      
      // Set user with profile color
      setUser({ ...userData.data, profileColor: avatarColor });

     }catch(error : any){

       setUser(null);

     }finally{
      setLoading(false);
     }
  }


  useEffect(()=> {
     fetchUser();
  }, [])

  useEffect(() => {
    if (!loading) {
    if (user && isPublicRoute) {
      // Logged in user trying to access login/signup
      router.replace('/');
    } else if (!user && !isPublicRoute) {
      // Logged out user trying to access protected route
      router.replace('/login');
    }
    }
  }, [loading, user, isPublicRoute, pathname]);

  // Show loading spinner while fetching user
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent rendering children if redirect is needed
  if (user && isPublicRoute) {
    // Logged in user on login/signup page - show loading while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    // Logged out user on protected page - show loading while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider