"use client";

import { useAuthStore } from '@/store/user.store'
import { useUiStore } from '@/store/ui.store'
import React, { useState, useEffect, useRef } from 'react'
import { logoutUser } from '@/services/user.service'
import { getAvatarColor } from '@/lib/avatar'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import ThemeToggleButton from './ThemeToggleButton';

function UserAvatar() {
    const user = useAuthStore((state) => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setIsOpen(false);
    };

    const handleViewProfile = () => {
        useUiStore.getState().setUserProfileModalOpen?.(true);
        setIsOpen(false);
    };

    const avatarColor = user ? getAvatarColor(user.id, user.profileColor) : 'bg-gray-500';



    return (
        <div className="relative border-t bg-muted/30 p-2" ref={dropdownRef}>
            <div 
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Avatar */}
                <div className="relative">
                    <div 
                        className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-background transition-transform group-hover:scale-105`}
                    >
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>

                {/* Username and status */}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                        {user?.username || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Online
                    </div>
                </div>

                {/* Three dots menu */}
                <button 
                    className="p-1.5 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute bottom-full left-2 right-2 mb-2 bg-popover rounded-md shadow-lg border z-50 overflow-hidden animate-in slide-in-from-bottom-2">
                    <div className="bg-muted/50 px-3 py-2 border-b">
                        <div className="font-semibold text-sm">{user?.username}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</div>
                    </div>

                    {/* Theme Toggle Section */}
                    {mounted && (
                         <ThemeToggleButton/>
                    )}

                    <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 hover:bg-destructive/10 transition-colors text-destructive text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserAvatar