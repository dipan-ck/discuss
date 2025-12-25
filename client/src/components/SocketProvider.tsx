"use client"

import socket from '@/lib/socket'
import React from 'react'
import { useEffect } from 'react'




function SocketProvider({children}: {children: React.ReactNode}) {


    useEffect(() => {
        const handleConnect = () => {
            console.log("you are online", socket.id);
        }

        const handleDisconnect = () => {
            console.log("you are offline");
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
  
    
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      }
    }, [])
    



   return <>{children}</>;
}

export default SocketProvider