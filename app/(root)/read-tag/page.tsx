"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

// Declare NDEFReader to avoid TypeScript errors
declare var NDEFReader: any;

export default function WriteTagPage() {
    const [serialNumber, setSerialNumber] = useState('');
    const [tagText, setTagText] = useState('');
    const [message, setMessage] = useState('');
    const [isNFCSupported, setIsNFCSupported] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        if ('NDEFReader' in window) {
            setIsNFCSupported(true);
        } else {
            setMessage('Web NFC is not supported on this device');
        }
    }, []);

    const handleNFCScan = async () => {
        setMessage("Approach an NFC tag");
        try {
            if ('NDEFReader' in window) {
                const ndef = new NDEFReader();
                await ndef.scan();
                ndef.addEventListener('reading', (event: any) => {
                    const { serialNumber } = event;
                    setSerialNumber(serialNumber);
                    fetchTagText(serialNumber);
                    setMessage("Tag scanned successfully!");
                });
            }
        } catch (error) {
            setMessage('An error occurred while scanning NFC tag');
            console.error('Error scanning NFC tag:', error);
        }
    };

    const fetchTagText = async (serialNumber: string) => {
        try {
            console.log("here")
            const response = await fetch(`/api/read-tag?serialNumber=${serialNumber}`);
            console.log("here")
            const data = await response.json();
            if (response.ok) {
                setTagText(data.text);
                console.log(data.text)
                console.log("success")
            } else {
                setMessage("Tag not found or an error occurred");
            }
        } catch (error) {
            setMessage('An error occurred while fetching tag text');
            console.error('Error fetching tag text:', error);
        }
    };

    return (
        <div className="w-full relative flex h-screen items-center justify-center bg-gradient-to-r from-orange-200 to-transparent">
            <div className="z-10 flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
                {isNFCSupported && (!tagText) && (
                    <div className='w-full flex'>
                        <div className='flex flex-col items-center mx-9'>
                            <button
                                className="w-full text-3xl font-bold text-secondary"
                            >
                                Read Kindr Tag
                            </button>
                            <p className="mt-4 text-lg text-secondary ">{message}</p>
                            <button
                                className="rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white hover:opacity-80"
                                onClick={handleNFCScan}
                            >
                                Scan an NFC Tag
                            </button>
                            {/* <p className="mt-4 text-secondary">Tag Id: {serialNumber}</p> */}
                        </div>
                    </div>
                )}
                {tagText && (
                    <div className='w-full flex flex-col m-6'>
                        <div className="w-full flex flex-col">
                            <p className='text-xl mb-4'>{tagText}</p>
                        </div>
                        <a
                            href={session ? "/vaok" : "/sign-up"}
                            className="rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white"
                        >
                            Do something Kind
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}