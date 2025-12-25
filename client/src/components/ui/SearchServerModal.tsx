"use client"

import React, { useState, useEffect } from 'react'
import { Search, Users, Hash, Plus, ArrowLeft } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/ui.store'
import CreateServerModal from './createServerModal'
import { useJoinServer, useSearchServers } from '@/api/hooks/useServers'

interface Server {
    id: string
    name: string
    image?: string
    memberCount: number
    category: string
}

type ViewMode = 'options' | 'search' | 'create'

function SearchServerModal() {
    const [viewMode, setViewMode] = useState<ViewMode>('options')
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Server[]>([])
    const [serverName, setServerName] = useState('')
    const [joiningServerId, setJoiningServerId] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const setIsSearchServerModalOpen = useUiStore((s) => s.setIsSearchServerModalOpen)
    const isSearchServerModalOpen = useUiStore((s) => s.isSearchServerModalOpen)
    const { data: fetchedSearchResults, isLoading } = useSearchServers(debouncedQuery)
    const { mutate: joinServer }= useJoinServer()
    
    const servers = fetchedSearchResults || []
    

    // Reset state when modal closes
    useEffect(() => {
        if (!isSearchServerModalOpen) {
            setViewMode('options')
            setQuery('')
            setServerName('')
            setSearchResults([])
            setErrorMessage('')
            setJoiningServerId(null)
        }
    }, [isSearchServerModalOpen])

    // Debouncing logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 800)

        return () => clearTimeout(timer)
    }, [query])




    function handleJoin(serverId: string) {
        setErrorMessage('')
        setJoiningServerId(serverId)
        joinServer(serverId, {
            onSuccess: () => {
                setJoiningServerId(null)
                setIsSearchServerModalOpen(false)
            },
            onError: (error: any) => {
                setJoiningServerId(null)
                setErrorMessage(error?.response?.data?.message || 'Failed to join server. Please try again.')
            }
        })
    }


    return (
        <Dialog open={isSearchServerModalOpen} onOpenChange={setIsSearchServerModalOpen}>
            <DialogContent className="sm:max-w-[550px] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-2">
                        {viewMode !== 'options' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('options')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <h1 className='text-2xl tracking-tight font-medium'>
                            {viewMode === 'options' && 'Find or Create a Server'}
                            {viewMode === 'search' && 'Search for Servers'}
                            {viewMode === 'create' && 'Create Your Server'}
                        </h1>
                    </div>
                </DialogHeader>

                {viewMode === 'options' && (
                    <div className="px-6 pb-6">
                        <div className="space-y-3">
                            <Button
                                onClick={() => setViewMode('search')}
                                variant="outline"
                                className="w-full h-auto justify-start gap-4 p-4 border-2 hover:border-primary group"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                                    <Search className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-lg">Search for Servers</p>
                                    <p className="text-sm text-muted-foreground">Discover and join existing communities</p>
                                </div>
                            </Button>

                            <Button
                                onClick={() => setViewMode('create')}
                                variant="outline"
                                className="w-full h-auto justify-start gap-4 p-4 border-2 hover:border-primary group"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-lg">Create My Own Server</p>
                                    <p className="text-sm text-muted-foreground">Start your own community from scratch</p>
                                </div>
                            </Button>
                        </div>
                    </div>
                )}

                {viewMode === 'search' && (
                    <>
                        <div className="px-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search servers..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {errorMessage && (
                                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                                    {errorMessage}
                                </div>
                            )}
                        </div>

                        <ScrollArea className="max-h-[400px] px-6 pb-6">
                            <div className="space-y-2 mt-4">
                                {!debouncedQuery ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="space-y-3">
                                            <Search className="h-12 w-12 mx-auto opacity-50" />
                                            <p className="text-lg font-medium">Search for servers</p>
                                            <p className="text-sm">Start typing to discover communities</p>
                                        </div>
                                    </div>
                                ) : isLoading ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                        <p className="mt-4">Searching...</p>
                                    </div>
                                ) : servers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No servers found</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-semibold text-muted-foreground mb-3">
                                            {servers.length} {servers.length === 1 ? 'Result' : 'Results'}
                                        </p>
                                        {servers.map((server) => {

    // Generate stable hash from server name for consistent color
    const hash = server.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const bgColor = `hsl(${hue}, 65%, 45%)`; // Deeper, more saturated color

    // First 2 letters
    const initials = server.name.slice(0, 2).toUpperCase();
    const isJoining = joiningServerId === server.id;

    return (
        <div
            key={server.id}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-md transition"
        >
            <Avatar className="h-12 w-12">
                <AvatarImage src={server.image} />
                <AvatarFallback style={{ backgroundColor: bgColor }}>
                    <span className="font-semibold text-sm text-white">{initials}</span>
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate">{server.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{server._count.members.toLocaleString() || 0} members</span>
                </div>
            </div>

            {/* Join Button */}
            <Button
                disabled={isJoining}
                onClick={() => handleJoin(server.id)}
                className="h-9 px-4"
            >
                {isJoining ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                    "Join"
                )}
            </Button>
        </div>
    );
})}

                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                )}

                {viewMode === 'create' && <CreateServerModal/> }
            </DialogContent>
        </Dialog>
    )
}

export default SearchServerModal
