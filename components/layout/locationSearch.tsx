import React, { useState, useEffect } from "react";

// Location search related states and handlers

const useLocationSearch = (initialLocation = '', initialCoordinates: [number, number] = [0, 0]) => {
    const [searchValue, setSearchValue] = useState<string>(initialLocation);
    const [searchData, updateSearchData] = useState<any[]>([]);
    const [valueLocation, setValueLocation] = useState<string>(initialLocation);
    const [valueCoordinates, setValueCoordinates] = useState<[number, number]>(initialCoordinates);
    const [addressButtonValue, setAddressButtonValue] = useState<string>('Search for a Location');
    const [showAddress, setShowAddress] = useState<boolean>(false);

    useEffect(() => {
        setValueLocation(initialLocation);
        setValueCoordinates(initialCoordinates)
    }, [initialLocation, initialCoordinates]);

    const updateLocationHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLocation = event.target.value;
        setSearchValue(newLocation);
        setValueLocation(newLocation);  
        if (newLocation.length > 3) {
            setAddressButtonValue('Select an Address');
            document.getElementById('menu-button')?.classList.remove('bg-white');
            document.getElementById('menu-button')?.classList.add('bg-tertiary', 'brightness-90', 'bg-opacity-40');
            handleSearch();
        } else {
            updateSearchData([]);
            setAddressButtonValue('Search for a Location');
            document.getElementById('menu-button')?.classList.add('bg-white');
            document.getElementById('menu-button')?.classList.remove('bg-tertiary', 'brightness-90', 'bg-opacity-40');
            document.getElementById('addressDropdown')?.classList.add('h-0');
            document.getElementById('addressDropdown')?.classList.remove('ring-1');
            setShowAddress(false);
        }
    };

    const handleSearch = () => {
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`)
            .then((response) => response.json())
            .then((data) => {
                updateSearchData(data.features);
                for (let i = 1; i <= 5; i++) {
                    const menuItem = document.getElementById('menu-item-' + i);
                    if (menuItem) {
                        menuItem.textContent = data.features[i - 1]?.place_name || "";
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching geocoding API:', error);
            });
    };

    const showAddresses = () => {
        if (searchData.length > 0 && !showAddress) {
            document.getElementById('addressDropdown')?.classList.remove('h-0');
            document.getElementById('addressDropdown')?.classList.add('ring-1');
            setShowAddress(true);
        } else {
            document.getElementById('addressDropdown')?.classList.add('h-0');
            document.getElementById('addressDropdown')?.classList.remove('ring-1');
            setShowAddress(false);
        }
    };

    const setAddress = (index: number, onUpdateLocation: (location: string, coordinates: [number, number]) => void) => {
        for (let i = 1; i <= 5; i++) {
            document.getElementById('dropdown-' + i)?.classList.remove('bg-tertiary', 'brightness-105', 'hover:bg-opacity-60');
            document.getElementById('dropdown-' + i)?.classList.add('hover:bg-gray-100');
        }
        document.getElementById('dropdown-' + index)?.classList.add('bg-tertiary', 'brightness-105', 'hover:bg-opacity-60');
        document.getElementById('dropdown-' + index)?.classList.remove('hover:bg-gray-100');

        const selectedPlace = searchData[index - 1];
        setValueLocation(selectedPlace.place_name);
        setValueCoordinates(selectedPlace.center)
        onUpdateLocation(selectedPlace.place_name, selectedPlace.center); // Call the onUpdateLocation callback
        setTimeout(() => {
            document.getElementById('addressDropdown')?.classList.add('h-0');
            document.getElementById('addressDropdown')?.classList.remove('ring-1');
            setShowAddress(false);
        }, 150);
    }

    const clearLocation = () => {
        setSearchValue('');
        setValueLocation('');
        setValueCoordinates([0, 0]);
        updateSearchData([]);
        setAddressButtonValue('Search for a Location');
    }

    return {
        searchValue,
        searchData,
        valueLocation,
        valueCoordinates,
        addressButtonValue,
        showAddress,
        updateLocationHandler,
        showAddresses,
        setAddress,
        setAddressButtonValue,
        clearLocation
    };
}

// Props interface update to include necessary props
interface LocationSearchComponentProps {
    disabled: boolean;
    initialLocation?: string;
    initialCoordinates?: [number, number];
    onUpdateLocation: (location: string, coordinates: [number, number]) => void;  // Ensure this prop is always provided
}

// Component function using these props
const LocationSearchComponent: React.FC<LocationSearchComponentProps> = ({
    disabled,
    initialLocation = '',
    initialCoordinates = [0, 0],
    onUpdateLocation
}) => {
    const {
        searchData,
        valueLocation,
        valueCoordinates,
        updateLocationHandler,
        showAddresses,
        setAddress,
        setAddressButtonValue,
        addressButtonValue,
        showAddress,
        clearLocation
    } = useLocationSearch(initialLocation, initialCoordinates);

    useEffect(() => {
        setAddressButtonValue('Select an Address');
    }, [initialLocation]);

    return (
        <div className="flex w-full flex-col space-y-2">
            <label htmlFor="PositionInput" className="text-sm text-[#4B4B4B]">
                Location
            </label>
            <div className="relative flex items-center">
                <input
                    id="PositionInput"
                    value={valueLocation}
                    onChange={updateLocationHandler}
                    placeholder="Enter your location here..."
                    disabled={disabled}
                    className={`flex-1 h-12 rounded-lg border border-[#EAEAEA] px-4 pr-10 ${
                        disabled ? "cursor-not-allowed bg-[#F5F5F5] text-[#858585]" : ""
                    }`}
                />
                {valueLocation && !disabled && (
                    <button
                        type="button"
                        className="absolute right-3 flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                        onClick={clearLocation}
                    >
                        ×
                    </button>
                )}
            </div>
            <button
                type="button"
                className={`mt-2 flex flex-row items-center  h-12 px-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 bg-white hover:bg-gray-200 text-sm sm:text-lg font-medium text-gray-900 ${
                    disabled ? "cursor-not-allowed hover:bg-[#F5F5F4] bg-[#F5F5F4] text-[#858585]" : ""
                }`}
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={showAddresses}
                disabled={disabled}
            >
                {addressButtonValue}
                <svg
                    id="dropDownFormatting"
                    className="ml-2 h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <div
                id="addressDropdown"
                className={`z-10 rounded-md shadow-lg ring-black ring-opacity-5 divide-y-1 divide-gray-300 bg-white focus:outline-none w-full mt-2 overflow-hidden ${
                    showAddress ? "h-auto ring-1" : "h-0"
                }`}
                aria-orientation="vertical"
                aria-labelledby="menu-button"
            >
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                        key={i}
                        className="p-1 hover:bg-gray-100 overflow-hidden"
                        id={`dropdown-${i + 1}`}
                        onClick={() => setAddress(i + 1, onUpdateLocation)}
                    >
                        <button
                            type="button"
                            className="block text-gray-700 text-md truncate w-full px-4 py-2"
                            id={`menu-item-${i + 1}`}
                        >
                            {searchData[i]?.place_name || ''}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default LocationSearchComponent;