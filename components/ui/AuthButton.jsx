"use client"

import { Button } from '@base-ui/react'
import { LogIn, LogOut } from 'lucide-react'
import React, { useState } from 'react'
import  AuthModal  from './AuthModal'
import { signOut } from '@/app/actions'

const AuthButton = ({ user }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);

     if (user) {
    return (
      <form action={signOut}>
        <Button  variant="default" size="sm" type="submit"
        className="h-10 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold inline-flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </form>
    );
  }

  return (
    <>
    <Button
  type="button"
  onClick={() => setShowAuthModal(true)}
  className="h-10 min-w-27 shrink-0 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
>
  <LogIn className="h-4 w-4 shrink-0" />
  <span>Sign In</span>
</Button>

    <AuthModal
    isOpen={ showAuthModal}
    onClose={() => setShowAuthModal(false)}
    />

    </>
  )
}

export default AuthButton
