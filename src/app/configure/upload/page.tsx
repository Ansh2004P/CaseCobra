"use client";

import { toast } from "sonner"

import { cn } from "@/lib/utils";
import { useState } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, MousePointerSquareDashed } from "lucide-react";
import Image from "next/image";

const Page = () => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const onDropAccepted = () => { }

    const onDropRejected = (rejectedFiles: FileRejection[]) => {
        const [file] = rejectedFiles;

        setIsDragOver(false);

        // toast.error(`File ${file.file.name} was rejected: ${file.errors.map((e) => e.message).join(", ")}`);
    }
    return (
        <div
            className={cn(
                "relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center items-center",
                {
                    "ring-blue-900/25 bg-blue-900/10": isDragOver
                }
            )}>
            <div className="relative flex flex-1 flex-col items-center justify-center w-full">
                <Dropzone
                    onDropRejected={onDropRejected}
                    onDropAccepted={onDropAccepted}
                    accept={{
                        'image/png': ['.png'],
                        'image/jpeg': ['.jpeg'],
                        'image/jpg': ['.jpg'],
                    }}
                    onDragEnter={() => setIsDragOver(true)}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={() => {
                        setIsDragOver(false);
                        console.log("Dropped");
                    }}
                    multiple={false}>
                    {({ getRootProps, getInputProps }) => (
                        <div
                            className="h-full w-full flex flex-1 flex-col item-center "
                            {...getRootProps()}>
                            <input {...getInputProps} />
                            {isDragOver ? (
                                <MousePointerSquareDashed className='h-6 w-6 text-zinc-500 mb-2' />
                            ) : (<div></div>)
                                //  isUploading || isPending ? (
                                //     <Loader2 className='animate-spin h-6 w-6 text-zinc-500 mb-2' />
                                // ) : (
                                //     <Image className='h-6 w-6 text-zinc-500 mb-2' />
                                // )
                            }

                        </div>
                    )}
                </Dropzone>
            </div>
        </div>
    )
}

export default Page