// "use client";
// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from "next/navigation";
// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// //nfc is using the web nfc api, will need to switch to capacitor nfc api (written by team capawesome)
// //when deploying to native android apps with capacitor, switch to capacitor nfc api (it is paid sponsorware)
// //

// //this page registers nfc tags, there is also a secret delete functionality for devs :)
// //the heading on the page is actually a button that calls the delete function
// //after a tag is registered (basically we store the serial number and text in a db table) we redirect to the read page
// //another improvment to make would be to write the text to the tag itself so it works offline with the native apps
// //the user's location is also stored (i think?) if you are reading this its your problem

// declare var NDEFReader: any;

// export default function NFCPage() {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const isOrganization = session?.accountType.toLowerCase() === "organization";

//     useEffect(() => {
//         if (!session || status !== "authenticated" || !isOrganization) router.push("/login");
//     }, [session, status, router, isOrganization]);

//     const [serialNumber, setSerialNumber] = useState('');
//     const [userId, setUserId] = useState('');
//     const [text, setText] = useState('');
//     const [location, setLocation] = useState('');
//     const [message, setMessage] = useState('');
//     const [isNFCSupported, setIsNFCSupported] = useState(false);
//     const { isLoaded } = useJsApiLoader({
//         id: "google-map-script",
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || "",
//     });

//     useEffect(() => {
//         if ('NDEFReader' in window) {
//             setIsNFCSupported(true);
//         } else {
//             setMessage('Web NFC is not supported on this device');
//         }
//     }, []);

//     useEffect(() => {
//         if (session?.user?.email) {
//             // fetchUserId(session.user.email);
//         }
//     }, [session]);

//     const handleWriteNFC = async () => {
//         const toDelete = false;
//         const tagInfo = {
//             toDelete,
//             serialNumber,
//             text,
//             location
//         };

//         const data = JSON.stringify(tagInfo);

//         try {
//             const response = await fetch('/api/nfc', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: data
//             });
//             if (response.status === 200) {
//                 setMessage("New Tag registered successfully");
//                 router.push("/read-tag");
//             } else if (response.status === 400) {
//                 setMessage("This tag is already registered");
//             } else {
//                 setMessage("We ran into a problem :(");
//             }
//         } catch (error) {
//             setMessage('An error occurred while writing NFC tag data');
//             console.error('Error writing NFC tag data:', error);
//         }
//     };

//     const handleNFCScan = async () => {
//         setMessage("Approach a kindr NFC tag");
//         try {
//             if ('NDEFReader' in window) {
//                 const ndef = new NDEFReader();
//                 await ndef.scan();
//                 ndef.addEventListener('reading', ({ serialNumber }: { serialNumber: string }) => {
//                     setSerialNumber(serialNumber);
//                     setMessage("New Tag Scanned!");
//                 });
//             }
//         } catch (error) {
//             setMessage('An error occurred while scanning NFC tag');
//             console.error('Error scanning NFC tag:', error);
//         }
//     };

//     const handleDeleteNFC = async () => {
//         const toDelete = true;
//         const tagInfo = {
//             toDelete,
//             serialNumber,
//             text,
//             location
//         };

//         const data = JSON.stringify(tagInfo);

//         try {
//             const response = await fetch('/api/nfc', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: data
//             });
//             if (response.status === 200) {
//                 setMessage("Tag deleted successfully");
//                 router.refresh();
//             } else if (response.status === 400) {
//                 setMessage("How is this possible?");
//             } else {
//                 setMessage("We ran into a problem :(");
//             }
//         } catch (error) {
//             setMessage('An error occurred while writing NFC tag data');
//             console.error('Error writing NFC tag data:', error);
//         }
//     };

//     const handleUseMyLocation = () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(async (position) => {
//                 const { latitude, longitude } = position.coords;
//                 try {
//                     const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`);
//                     const data = await response.json();
//                     if (data.results && data.results.length > 0) {
//                         const address = data.results[0].formatted_address;
//                         setLocation(address);
//                     } else {
//                         setMessage('Unable to retrieve location information.');
//                     }
//                 } catch (error) {
//                     setMessage('An error occurred while fetching the location.');
//                     console.error('Error fetching location:', error);
//                 }
//             }, (error) => {
//                 setMessage('Geolocation is not enabled.');
//                 console.error('Error getting geolocation:', error);
//             });
//         } else {
//             setMessage('Geolocation is not supported by this browser.');
//         }
//     };

//     return (
//         <div className="w-full relative flex h-screen items-center justify-center bg-gradient-to-r from-orange-200 to-transparent">
//             <div className="z-10 flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
//                 <button
//                     className="text-3xl font-bold text-secondary"
//                     onClick={handleDeleteNFC}
//                 >
//                     Register Kindr Tag
//                 </button>
//                 <p className="mt-4 text-lg text-secondary">{message}</p>
//                 {isNFCSupported && !serialNumber && (
//                     <div className="mt-6 flex flex-col items-center w-full">
//                         <button
//                             className="rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white hover:opacity-80"
//                             onClick={handleNFCScan}
//                         >
//                             Scan an NFC Tag
//                         </button>
//                     </div>
//                 )}
//                 {serialNumber && (
//                     <div className="mt-6 w-full">
//                         <label htmlFor="text" className="block text-secondary text-sm font-bold">
//                             Text:
//                         </label>
//                         <input
//                             type="text"
//                             id="text"
//                             value={text}
//                             onChange={(e) => setText(e.target.value)}
//                             className="w-full mt-2 rounded-md border border-gray-300 p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
//                         />
//                         <label htmlFor="location" className="block text-secondary text-sm font-bold mt-4">
//                             Location:
//                         </label>
//                         <div className="relative w-full mt-2">
//                             <input
//                                 type="text"
//                                 id="location"
//                                 value={location}
//                                 onChange={(e) => setLocation(e.target.value)}
//                                 className="w-full rounded-md border border-gray-300 p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
//                             />
//                             <button
//                                 onClick={handleUseMyLocation}
//                                 className="absolute inset-y-0 right-0 flex items-center pr-3"
//                                 title="Use My Location"
//                             >
//                                 📍
//                             </button>
//                         </div>
//                         <button
//                             onClick={handleWriteNFC}
//                             className="mt-6 w-full rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white hover:opacity-80"
//                         >
//                             Register Tag
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

//nfc is using the web nfc api, will need to switch to capacitor nfc api (written by team capawesome)
//when deploying to native android apps with capacitor, switch to capacitor nfc api (it is paid sponsorware)
//


//this page registers nfc tags, there is also a secret delete functionality for devs :)
//the heading on the page is actually a button that calls the delete function
//after a tag is registered (basically we store the serial number and text in a db table) we redirect to the read page
//another improvment to make would be to write the text to the tag itself so it works offline with the native apps
//the user's location is also stored (i think?) if you are reading this its your problem

interface NDEFMessageInit {
    records: NDEFRecordInit[];
}

interface NDEFRecordInit {
    recordType: string;
    mediaType?: string;
    id?: string;
    data?: string | BufferSource | null;
}

declare class NDEFReader {
    scan: () => Promise<void>;
    write: (message: NDEFMessageInit) => Promise<void>;
    onreading: (event: Event) => void;
    onreadingerror: (event: Event) => void;
    addEventListener: (type: string, listener: (event: any) => void) => void;
}



export default function NFCPage() {

    const { data: session, status } = useSession();
    const router = useRouter();
    const isOrganization = session?.accountType.toLowerCase() === "organization";

    useEffect(() => {
        if (!session || status !== "authenticated" || !isOrganization) router.push("/login");
    }, [session, status, router, isOrganization]);

    const [serialNumber, setSerialNumber] = useState('');
    const [userId, setUserId] = useState('');
    const [text, setText] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [isNFCSupported, setIsNFCSupported] = useState(false);
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || "",
    });

    useEffect(() => {
        if ('NDEFReader' in window) {
            setIsNFCSupported(true);
        } else {
            setMessage('Web NFC is not supported on this device');
        }
    }, []);



    useEffect(() => {
        if (session?.user?.email) {
            // fetchUserId(session.user.email);
        }
    }, [session]);

    const handleWriteNFC = async () => {
        const toDelete = false;
        const tagInfo = {
            toDelete,
            serialNumber,
            text,
            location
        };

        const data = JSON.stringify(tagInfo);

        try {
            const response = await fetch('/api/nfc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            });
            if (response.status === 200) {
                setMessage("New Tag registered successfully");
                router.push("/read-tag");
            } else if (response.status === 400) {
                setMessage("This tag is already registered");
            } else {
                setMessage("We ran into a problem :(");
            }
        } catch (error) {
            setMessage('An error occurred while writing NFC tag data');
            console.error('Error writing NFC tag data:', error);
        }
    };

    const handleNFCScan = async () => {
        setMessage("Approach a kindr NFC tag");
        try {
            if ('NDEFReader' in window) {
                const ndef = new NDEFReader();
                await ndef.scan();
                ndef.addEventListener('reading', ({ serialNumber }) => {
                    setSerialNumber(serialNumber);
                    setMessage("New Tag Scanned!");
                });
            }
        } catch (error) {
            setMessage('An error occurred while scanning NFC tag');
            console.error('Error scanning NFC tag:', error);
        }
    };

    const handleDeleteNFC = async () => {
        const toDelete = true;
        const tagInfo = {
            toDelete,
            serialNumber,
            text,
            location
        };

        const data = JSON.stringify(tagInfo);

        try {
            const response = await fetch('/api/nfc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            });
            if (response.status === 200) {
                setMessage("Tag deleted successfully");
                router.refresh();
            } else if (response.status === 400) {
                setMessage("How is this possible?");
            } else {
                setMessage("We ran into a problem :(");
            }
        } catch (error) {
            setMessage('An error occurred while writing NFC tag data');
            console.error('Error writing NFC tag data:', error);
        }
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}`);
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        const address = data.results[0].formatted_address;
                        setLocation(address);
                    } else {
                        setMessage('Unable to retrieve location information.');
                    }
                } catch (error) {
                    setMessage('An error occurred while fetching the location.');
                    console.error('Error fetching location:', error);
                }
            }, (error) => {
                setMessage('Geolocation is not enabled.');
                console.error('Error getting geolocation:', error);
            });
        } else {
            setMessage('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className="w-full relative flex h-screen items-center justify-center bg-gradient-to-r from-orange-200 to-transparent">
            <div className="z-10 flex flex-col items-center p-8 bg-white rounded-lg shadow-lg">
                <button
                    className="text-3xl font-bold text-secondary"
                    onClick={handleDeleteNFC}
                >
                    Register Kindr Tag
                </button>
                <p className="mt-4 text-lg text-secondary">{message}</p>
                {isNFCSupported && !serialNumber && (
                    <div className="mt-6 flex flex-col items-center w-full">
                        <button
                            className="rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white hover:opacity-80"
                            onClick={handleNFCScan}
                        >
                            Scan an NFC Tag
                        </button>
                    </div>
                )}
                {serialNumber && (
                    <div className="mt-6 w-full">
                        <label htmlFor="text" className="block text-secondary text-sm font-bold">
                            Text:
                        </label>
                        <input
                            type="text"
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full mt-2 rounded-md border border-gray-300 p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <label htmlFor="location" className="block text-secondary text-sm font-bold mt-4">
                            Location:
                        </label>
                        <div className="relative w-full mt-2">
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                            />
                            <button
                                onClick={handleUseMyLocation}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                title="Use My Location"
                            >
                                📍
                            </button>
                        </div>
                        <button
                            onClick={handleWriteNFC}
                            className="mt-6 w-full rounded-2xl bg-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white hover:opacity-80"
                        >
                            Register Tag
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
}
