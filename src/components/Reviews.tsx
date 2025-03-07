'use client';

import React, { HTMLAttributes } from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import Image from 'next/image';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import Phone from './Phone';

const PHONES = [
    '/testimonials/1.jpg',
    '/testimonials/2.jpg',
    '/testimonials/3.jpg',
    '/testimonials/4.jpg',
    '/testimonials/5.jpg',
    '/testimonials/6.jpg',
];

function splitArray<T>(array: Array<T>, numParts: number) {
    const result: Array<Array<T>> = Array.from({ length: numParts }, () => []);

    array.forEach((item, i) => {
        result[i % numParts].push(item);
    });

    return result;
}

function ReviewColumn({
    reviews,
    className,
    reviewClassName,
    msPerPixel = 0,
}: {
    reviews: string[];
    className?: string;
    reviewClassName?: (reviewIndex: number) => string;
    msPerPixel?: number;
}) {
    const columnRef = React.useRef<HTMLDivElement | null>(null);
    const [columnHeight, setColumnHeight] = React.useState(0);
    const duration = `${columnHeight * msPerPixel}ms`;

    React.useEffect(() => {
        if (!columnRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            setColumnHeight(columnRef.current?.offsetHeight ?? 0);
        });

        resizeObserver.observe(columnRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div
            ref={columnRef}
            className={cn('animate-marquee space-y-8 py-4', className)}
            style={{
                animationDuration: duration || '10s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
            }}
        >
            {reviews.concat(reviews).map((imgSrc, reviewIndex) => (
                <Review
                    key={`Review-${reviewIndex}`}
                    className={reviewClassName?.(reviewIndex % reviews.length)}
                    imgSrc={imgSrc}
                />
            ))}
        </div>
    );
}

interface ReviewProps extends HTMLAttributes<HTMLDivElement> {
    imgSrc: string;
}

function Review({ imgSrc, className, ...props }: ReviewProps) {
    const POSSIBLE_ANIMATION_DELAYS = ['0s', '0.1s', '0.2s', '0.3s', '0.4s', '0.5s'];
    const animationDelay = POSSIBLE_ANIMATION_DELAYS[Math.floor(Math.random() * POSSIBLE_ANIMATION_DELAYS.length)];

    return (
        <div
            className={cn(
                'animate-fade-in rounded-[2.25rem] bg-white p-6 opacity-100 transition-opacity duration-700 ease-in-out shadow-xl shadow-slate-900/5',
                className
            )}
            style={{ animationDelay: animationDelay || '0s' }}
            {...props}
        >
            <Phone imgSrc={imgSrc} />
        </div>
    );
}

function ReviewGrid() {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inView = useInView(containerRef, { once: true, amount: 0.2 });
    const columns = splitArray(PHONES, 3);
    const col1 = columns[0] || [];
    const col2 = columns[1] || [];
    const col3 = columns[2] ? splitArray(columns[2], 2) : [[], []];

    return (
        <div
            ref={containerRef}
            className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
        >
            {inView ? (
                <>
                    <ReviewColumn
                        reviews={[...col1, ...col3.flat(), ...col2]}
                        reviewClassName={(reviewIndex) =>
                            cn({
                                'md:hidden': reviewIndex >= col1.length + col3[0].length,
                                'lg:hidden': reviewIndex >= col1.length,
                            })
                        }
                        msPerPixel={5}
                    />
                    <ReviewColumn
                        reviews={[...col2, ...col3[1]]}
                        className="hidden md:block"
                        reviewClassName={(reviewIndex) =>
                            reviewIndex >= col2.length ? 'lg:hidden' : ''
                        }
                        msPerPixel={7}
                    />
                    <ReviewColumn reviews={col3.flat()} className="hidden md:block" msPerPixel={4} />
                </>
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-100" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100" />
        </div>
    );
}

export function Reviews() {
    return (
        <MaxWidthWrapper className="relative max-w-5xl">
            <Image
                aria-hidden="true"
                src="/what-people-are-buying.png"
                className="absolute select-none hidden xl:block -left-32 top-1/3"
                alt="what people are buying"
                width={150}
                height={150}
            />
            <ReviewGrid />
        </MaxWidthWrapper>
    );
}
