'use client'
import React, { useEffect, useState } from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'

function Footer() {
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        setYear(new Date().getFullYear()) // Ensures year is always accurate on the client
    }, [])

    return (
        <footer className='bg-white h-20 relative border-t border-gray-200' aria-label='Footer'>
            <MaxWidthWrapper>
                <div className='h-full flex flex-col md:flex-row md:justify-between justify-center items-center'>
                    <div className='text-center md:text-left pb-2 md:pb-0'>
                        <p className='text-sm text-muted-foreground'>
                            &copy; {year} All rights reserved
                        </p>
                    </div>

                    <div className='flex items-center justify-center'>
                        <div className='flex space-x-8'>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-gray-600">
                                Terms
                            </Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-gray-600">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-gray-600">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </footer>
    )
}

export default Footer
