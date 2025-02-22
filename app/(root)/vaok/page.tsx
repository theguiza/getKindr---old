// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from 'next/navigation';

// export default function VoluntaryActsPage() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [description, setDescription] = useState<string>("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [bgPrimary, setBgPrimary] = useState<boolean>(false);
//   const { data: session } = useSession();
//   const router = useRouter();

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);

//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleShare = async () => {
//     if (selectedFile) {
//       setLoading(true); // Show loading bar
//       setBgPrimary(true); // Change background color
//       if (navigator.share) {
//         try {
//           setTimeout(() => {
//             setLoading(false); // Hide loading bar
//             router.push("/"); // Redirect to homepage
//           }, 8000); // 5 seconds delay
//           navigator.share({
//             files: [selectedFile],
//             text: description,
//           });
//           console.log("File shared successfully");
//           await updateUserTokens();

//         } catch (error) {
//           console.error("Error sharing file:", error);
//           setLoading(false); // Hide loading bar on error
//           setBgPrimary(false);
//         }
//       } else {
//         setError("File sharing is not supported in this browser.");
//         setLoading(false); // Hide loading bar on error
//         setBgPrimary(false);
//       }
//     }
//   };

//   const updateUserTokens = async () => {
//     if (session?.user?.email) {
//       const res = await fetch("/api/update-tokens", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: session.user.email, tokens: 10 }),
//       });

//       if (res.ok) {
//         console.log("Tokens added successfully");
//       } else {
//         const errorData = await res.json();
//         console.error("Error adding tokens:", errorData);
//       }
//     }
//   };

//   return (
//     // <div className="w-full h-screen flex flex-col justify-center items-center ${bgPrimary ? 'bg-primary' : 'bg-white'}" id="main-div">
//     <div className={`w-full h-screen flex flex-col justify-center items-center ${bgPrimary ? 'bg-gray-300' : 'bg-white'}`} id="main-div">
//       {error && <p className="text-red-500">{error}</p>}
//       <div className="flex flex-col items-center space-y-4">
//         {loading ? (
//           <>
//             <span className="loader"></span>
//             <div className="coins-container">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="coin bg-primary"></div>
//               ))}
//             </div>
//           </>
//         ) : (
//           <>
//             {!selectedFile && (
//               <>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="hidden"
//                   id="file-input"
//                 />
//                 <label
//                   htmlFor="file-input"
//                   className="cursor-pointer bg-primary text-white py-3 px-6 rounded-lg font-semibold"
//                 >
//                   Show us your kindness
//                 </label>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Tell us about your act of kindness"
//                   className="mt-2 p-2 border rounded-lg w-64"
//                 />
//               </>
//             )}
//             {selectedFile && (
//               <>
//                 <button
//                   onClick={handleShare}
//                   className="bg-primary text-white py-3 px-6 rounded-lg font-semibold"
//                 >
//                   Share your kindness with the world
//                 </button>
//                 <div className="relative mt-4">
//                   {imagePreview && (
//                     <img src={imagePreview} alt="Uploaded Preview" className="max-w-xs" />
//                   )}
//                   <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-2 w-full text-center">
//                     {description}
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//       <style jsx>{`
//       .coins-container {
//         position: absolute;
//         top: 0;
//         left: 50%;
//         transform: translateX(-50%);
//         width: 100%;
//         height: 100%;
//         pointer-events: none;
//         overflow: hidden;
//       }
      
//       .coin {
//         position: absolute;
//         top: -10%;
//         width: 3rem;
//         height: 3rem;
//         // background: gold;
//         border-radius: 50%;
//         animation: fall 5s linear infinite;
//         opacity: 0;
//       }
      
//       @keyframes fall {
//         0% {
//           opacity: 1;
//           transform: translateY(0) rotate(0deg);
//         }
//         100% {
//           opacity: 0;
//           transform: translateY(100vh) rotate(360deg);
//         }
//       }
      
//       .coins-container .coin:nth-child(1) {
//         left: 20%;
//         animation-delay: 0s;
//       }
//       .coins-container .coin:nth-child(2) {
//         left: 40%;
//         animation-delay: 0.2s;
//       }
//       .coins-container .coin:nth-child(3) {
//         left: 60%;
//         animation-delay: 0.4s;
//       }
//       .coins-container .coin:nth-child(4) {
//         left: 80%;
//         animation-delay: 0.6s;
//       }
//       .coins-container .coin:nth-child(5) {
//         left: 100%;
//         animation-delay: 0.8s;
//       }

      
//       `}</style>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function VoluntaryActsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [bgPrimary, setBgPrimary] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    try{
      if (selectedFile) {
        setLoading(true); // Show loading bar
        setBgPrimary(true); // Change background color
        if (navigator.share) {
          try {
            // setTimeout(() => {
            //   setLoading(false); // Hide loading bar
            //   router.push("/"); // Redirect to homepage
            // }, 0); // 8 seconds delay
            
              try{
    navigator.share({
      files: [selectedFile],
      text: description,
    });
            } catch(e){
              console.log("caught e:", e)
            }
            router.push("/")
            console.log("File shared successfully");
            await updateUserTokens();
          } catch (error) {
            console.error("Error sharing file:", error);
            setLoading(false); // Hide loading bar on error
            setBgPrimary(false);
          }
        } else {
          setError("File sharing is not supported in this browser.");
          setLoading(false); // Hide loading bar on error
          setBgPrimary(false);
        }
      }
    } catch (e){ 
console.log("caught all error")
    }

  };

  const handleDownload = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const updateUserTokens = async () => {
    if (session?.user?.email) {
      const res = await fetch("/api/update-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, tokens: 10 }),
      });

      if (res.ok) {
        console.log("Tokens added successfully");
      } else {
        const errorData = await res.json();
        console.error("Error adding tokens:", errorData);
      }
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col justify-center items-center ${bgPrimary ? 'bg-gray-300' : 'bg-white'}`} id="main-div">
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      {/* why use css when <br> go brrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr */}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col items-center space-y-4">
        {loading ? (
          <>
            <span className="loader"></span>
            <div className="coins-container">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="coin bg-primary"></div>
              ))}
            </div>
          </>
        ) : (
          <>
            {!selectedFile && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer bg-primary text-white py-3 px-6 rounded-lg font-semibold"
                >
                  Show us your kindness
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your act of kindness"
                  className="mt-2 p-2 border rounded-lg w-64"
                />
              </>
            )}
            {selectedFile && (
              <>
                <button
                  onClick={handleShare}
                  className="bg-primary text-white py-3 px-6 rounded-lg font-semibold"
                >
                  Share your kindness with the world
                </button>
                <div className="relative mt-4">
                  {imagePreview && (
                    <img src={imagePreview} alt="Uploaded Preview" className="max-w-xs" />
                  )}
                  <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-2 w-full text-center">
                    {description}
                  </div>
                </div>
                {!navigator.share && (
                  <button
                    onClick={handleDownload}
                    className="bg-secondary text-white py-3 px-6 rounded-lg font-semibold mt-2"
                  >
                    Download your file
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
      <style jsx>{`
      .coins-container {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }
      
      .coin {
        display: none;
        position: absolute;
        top: -10%;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        animation: fall 5s linear infinite;
        opacity: 0;
      }
      
      @keyframes fall {
        0% {
          opacity: 1;
          transform: translateY(0) rotate(0deg);
        }
        100% {
          opacity: 1;
          transform: translateY(100vh) rotate(360deg);
        }
      }
      
      .coins-container .coin:nth-child(1) {
        left: 20%;
        animation-delay: 0s;
      }
      .coins-container .coin:nth-child(2) {
        left: 40%;
        animation-delay: 0.2s;
      }
      .coins-container .coin:nth-child(3) {
        left: 60%;
        animation-delay: 0.4s;
      }
      .coins-container .coin:nth-child(4) {
        left: 80%;
        animation-delay: 0.6s;
      }
      .coins-container .coin:nth-child(5) {
        left: 100%;
        animation-delay: 0.8s;
      }
      `}</style>
    </div>
  );
}
