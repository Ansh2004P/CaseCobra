import React from 'react'
import { cn } from '../lib/utils'

type Props = { children: React.ReactNode, className?: string }

function MaxWidthWrapper({ children, className }: Props) {
    return (
        <div className={cn('h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20', className)}> {children}</div >
    )
}

export default MaxWidthWrapper