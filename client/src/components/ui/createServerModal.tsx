import React, { useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'
import { useCreateServer } from '@/api/hooks/useServers'
import { useUiStore } from '@/store/ui.store'

function CreateServerModal() {
    const [serverName, setServerName] = React.useState('')
    const { mutate: createServer, isPending, isSuccess, error } = useCreateServer()
    const isModalOpen = useUiStore((s) => s.isSearchServerModalOpen)
    const setModalOpen = useUiStore((s) => s.setIsSearchServerModalOpen)

    const handleCreateServer = () => {
        createServer({ name: serverName });
    }

    
useEffect(() => {
  if (isSuccess) {
    setServerName("");
    setModalOpen?.(false);
  }
}, [isSuccess]);


    return (
        <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
                <label htmlFor="serverName" className="text-sm font-medium">
                    Server Name
                </label>
                <Input
                    id="serverName"
                    placeholder="Enter your server name..."
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full"
                />
            </div>
            {error && (
  <p className="text-red-500 text-sm">
    {error?.response?.data?.message ?? "Something went wrong"}
  </p>
)}
            <Button
                onClick={handleCreateServer}
                disabled={!serverName.trim() || isPending}
                className="w-full"
            >
                {isPending ? 'Creating...' : 'Create Server'}
            </Button>
        </div>
    )
}

export default CreateServerModal