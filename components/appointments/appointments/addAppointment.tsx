import { View, Text, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { db } from '@/config/FireBaseConfig';
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { UserContext } from '@/contexts/userContext';
import * as Location from 'expo-location';  // Import the location API

interface AddAppointmentProps {
    sessions: Array<{
        date: string;
        startTime: string;
        endTime: string;
        noOfSlots: number;
        bookedSlots: Array<string>;
        location: string;
        sessionType: string;
    }>;
    midwifeId: String;
    sessionType: string;
    selectedLocation: string;
}

// Function to generate the next 14 days including today
const getNextFourteenDays = () => {
    const dates = [];
    const today = new Date();
  
    for (let i = 0; i < 14; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
  
        const day = nextDay.toLocaleDateString('en-US', { weekday: 'short' });
        const date = nextDay.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        dates.push({ day, date });
    }
  
    return dates;
};


// Manually setting logged document ID (replace with dynamic ID once login is implemented)
const childDocumentID = 'child001';

const AddAppointment: React.FC<AddAppointmentProps> = ({ sessions, midwifeId, sessionType, selectedLocation }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<string>>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');  // State to save selected time slot
    const [sessionsForSelectedDate, setSessionsForSelectedDate] = useState<any[]>([]);
    const [midwifeObj, setMidwifeObj] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [locationCode, setLocationCode] = useState<string>('');  // State for storing location code
    const [locationAddress, setLocationAddress] = useState<string>('');  // State for storing the address
    const { user } = useContext(UserContext);

    console.log("filtered by type and location sessions: ", sessions)
    console.log("sessionsForSelectedDate: ", sessionsForSelectedDate)

    useEffect(() => {
        const fetchMidwifeData = async () => {
          try {
            const midwifeDocRef = doc(db, 'Midwives', midwifeId); // Reference to the specific midwife document
            const midwifeDoc = await getDoc(midwifeDocRef);
    
            if (midwifeDoc.exists()) {
              setMidwifeObj(midwifeDoc.data());
            } else {
              console.log('No midwife found with this ID.');
            }
          } catch (error) {
            console.error('Error fetching midwife data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchMidwifeData();
      }, [midwifeId]);

    // Generate the next 14 days
    const dates = getNextFourteenDays();

    // Get available session dates for comparison
    const sessionDates = sessions.map(session => session.date);

    // Set the default selected date to today (first item in the dates array if available)
    useEffect(() => {
        const initialDate = dates.find(dateObj => sessionDates.includes(dateObj.date));
        if (initialDate) {
            setSelectedDate(initialDate.date);
        }
    }, [sessions]);

    // Update the day of the month and month when selectedDate changes
    useEffect(() => {
        updateSelectedDateDayOfMonth(selectedDate);
        updateSelectedMonth(selectedDate);
        filterSessionsForSelectedDate(selectedDate);
    }, [selectedDate]);

    const updateSelectedDateDayOfMonth = (date: string) => {
        const parsedDate = new Date(date);
        const dayOfMonth = parsedDate.getDate().toString();
        setSelectedDateDayOfMonth(dayOfMonth);
    };

    const updateSelectedMonth = (date: string) => {
        const parsedDate = new Date(date);
        const monthName = parsedDate.toLocaleString('default', { month: 'long' });
        setSelectedMonth(monthName);
    };

    // Filter sessions based on the selected date and calculate available slots
    const filterSessionsForSelectedDate = (selectedDate: string) => {
        const filteredSessions = sessions.filter(session => session.date === selectedDate);
        setSessionsForSelectedDate(filteredSessions);
        let allAvailableSlots: string[] = [];

        filteredSessions.forEach(session => {
            const allSlots = generateTimeSlots(session.startTime, session.endTime, session.noOfSlots);
            const availableSlots = allSlots.filter(slot => !session.bookedSlots.includes(slot));
            allAvailableSlots = [...allAvailableSlots, ...availableSlots];
        });

        // Sort the time slots in ascending order
        const sortedAvailableSlots = allAvailableSlots.sort((a, b) => {
            const timeA = new Date(`1970-01-01T${convertTo24HourFormat(a)}:00`).getTime();
            const timeB = new Date(`1970-01-01T${convertTo24HourFormat(b)}:00`).getTime();
            return timeA - timeB;
        });

        setAvailableTimeSlots(sortedAvailableSlots);
    };



    // Function to fetch the user's current location and get the address
    const handleAddLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setLocationCode(`${latitude},${longitude}`); // Store the location code

            const address = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (address.length > 0) {
                const formattedAddress = `${address[0].name}, ${address[0].city}, ${address[0].region}`;
                setLocationAddress(formattedAddress); // Store the address
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            Alert.alert('Error', 'Failed to get current location.');
        }
    };


    // Function to generate time slots based on start and end time
    const generateTimeSlots = (startTime: string, endTime: string, noOfSlots: number) => {
        const slots = [];
        const start = new Date(`1970-01-01T${convertTo24HourFormat(startTime)}:00`);
        const end = new Date(`1970-01-01T${convertTo24HourFormat(endTime)}:00`);
        
        // Check if the end time is later than the start time
        if (end <= start) {
            console.error("End time must be after the start time");
            return [];
        }
    
        // Calculate the duration between start and end in milliseconds
        const slotDuration = (end.getTime() - start.getTime()) / noOfSlots;
    
        for (let i = 0; i < noOfSlots; i++) {
            const slotStart = new Date(start.getTime() + i * slotDuration);
            slots.push(formatTime(slotStart));
        }
    
        console.log("slots", slots);
        return slots;
    };
    
    // Convert time to 24-hour format (with minute handling)
    const convertTo24HourFormat = (time: string) => {
        const [hours, minutes, modifier] = time.split(/[: ]/);  // Include minutes handling
        let hour = parseInt(hours, 10);
        if (modifier === 'PM' && hour !== 12) hour += 12;
        if (modifier === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Format time as 'HH:MM AM/PM'
    const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    // Fetch time when the selected date changes
    useEffect(() => {
        setSelectedTimeSlot('');
    }, [selectedDate]);

    // Render each time slot
    const renderTimeSlot = ({ item }: { item: string }) => (
        <TouchableOpacity 
            className={`px-4 py-2 rounded-lg mx-2 h-16 items-center justify-center ${
                selectedTimeSlot === item ? 'bg-blue-300' : 'bg-white'  // Change the background if selected
            }`}
            onPress={() => setSelectedTimeSlot(item)}  // Save the selected time slot
        >
            <Text className={`text-lg font-bold ${selectedTimeSlot === item ? 'text-white' : 'text-black'}`}>{item}</Text>
        </TouchableOpacity>
    );

    // Render each date button
    const renderDate = ({ item }: { item: { day: string; date: string } }) => {
        const isDateDisabled = !sessionDates.includes(item.date); // Check if the date is in sessions array
        return (
            <TouchableOpacity
                className={`px-4 py-2 rounded-lg mx-2 h-16 items-center justify-center ${
                    selectedDate === item.date ? 'bg-blue-300' : 'bg-white'
                } ${isDateDisabled ? 'opacity-50' : ''}`} // Add opacity if disabled
                onPress={() => !isDateDisabled && setSelectedDate(item.date)} // Prevent selection if disabled
                disabled={isDateDisabled} // Disable button if not a valid session date
            >
                <Text className={`text-sm ${selectedDate === item.date ? 'text-black' : 'text-gray-500'}`}>{item.day}</Text>
                <Text className="text-lg font-bold">{new Date(item.date).getDate()}</Text>
            </TouchableOpacity>
        );
    };


    // Function to save the appointment data to Firestore in a separate collection (MidwifeAppointments)
    const bookAppointment = async () => {
        try {
            // Find the session that contains the selected time slot
            const sessionToUpdate = sessionsForSelectedDate.find(session => {
                const allSlots = generateTimeSlots(session.startTime, session.endTime, session.noOfSlots);
                return allSlots.includes(selectedTimeSlot);
            });
    
            if (!sessionToUpdate) {
                Alert.alert('Error', 'Selected time slot not available.');
                return;
            }
    
            // Get the document ID of the session to update (from sessionsForSelectedDate)
            const sessionId = sessionToUpdate.id;
    
            // Reference the document in Firestore
            const sessionDocRef = doc(db, `Midwives/${midwifeId}/MidwifeSessions/${sessionId}`);
    
            // Update the bookedSlots array with the selected time slot
            await updateDoc(sessionDocRef, {
                bookedSlots: arrayUnion(selectedTimeSlot)
            });
    
            // Add the appointment to the MidwifeAppointments collection
            const appointmentsCollectionRef = collection(db, 'MidwifeAppointments');
    
            await addDoc(appointmentsCollectionRef, {
                midwifeId,  // Include midwife ID
                date: selectedDate,
                timeSlot: selectedTimeSlot,
                sessionType,
                location: selectedLocation,
                status: "Scheduled",
                user: user.uid,
                child: childDocumentID,
                locationCode,
                locationAddress,
            });
    
            Alert.alert('Success', 'Appointment created successfully!');
            router.navigate({
                pathname: '/appointments/midwives/appointmentSuccess',
                params: {
                    date: selectedDate,
                    timeSlot: selectedTimeSlot,
                    sessionType,
                    location: selectedLocation,
                    status: "Scheduled",
                    user: user.uid,
                    child: childDocumentID,
                },
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            Alert.alert('Error', 'Failed to create appointment.');
        }
    };


    return (
        <View className='m-5'>
            {/* Horizontal Date Picker */}
            <View className="mb-7">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-lg font-semibold">Date</Text>
                    <View className="flex-row items-center">
                        <Text className="text-lg mr-2">{selectedMonth}</Text>
                        {/* <AntDesign name="right" size={24} color="black" />  */}
                    </View>
                </View>
                <FlatList
                    data={dates}
                    horizontal
                    renderItem={renderDate}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={{ justifyContent: 'space-between' }}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Available Time Slots */}
            <View>
                <View className="flex-row justify-between mb-3">
                    <Text className="text-lg font-semibold">Available Time Slots</Text>
                </View>
                <FlatList
                    data={availableTimeSlots}
                    horizontal
                    renderItem={renderTimeSlot}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ justifyContent: 'space-between' }}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View className='flex-row'>
                <View>
                    {/* Add a button "Add Location" */}
                </View>
                <View>
                    {/* Display location by get the address from the location */}
                </View>
            </View>


            {/* Button to add current location */}
            <View className='py-4'>
                <TouchableOpacity
                    onPress={handleAddLocation}
                    className='bg-blue-500 p-4 rounded-md flex-row items-center justify-center'
                >
                    <AntDesign name="pluscircleo" size={24} color="white" />
                    <Text className='text-white text-lg ml-2'>Add Current Location</Text>
                </TouchableOpacity>
            </View>

            {/* Display the address of the current location */}
            {locationAddress ? (
                <View className='px-4 py-2'>
                    <Text className='text-lg font-semibold'>Location Address:</Text>
                    <Text>{locationAddress}</Text>
                </View>
            ) : null}


            <View className="bg-gray-100 p-4 rounded-lg mb-4">
                <Text className="text-lg font-semibold text-gray-700">Date: {selectedDate}</Text>
                <Text className="text-lg font-semibold text-gray-700">Time: {selectedTimeSlot}</Text>
                <Text className="text-lg font-semibold text-gray-700">Location: {selectedLocation}</Text>
                <Text className="text-lg font-semibold text-gray-700">Status: {sessionType}</Text>
            </View>


            {/* Midwife Information */}
            {midwifeObj ? (
                <View className="bg-white shadow-md p-4 rounded-lg">
                <View className="flex flex-row items-center mb-4">
                    <Image source={{ uri: midwifeObj.image }} className="w-24 h-24 rounded-full mr-4" />
                    <View>
                    <Text className="text-xl font-bold text-gray-800">{midwifeObj.name}</Text>
                    <Text className="text-md text-gray-500">Location: {midwifeObj.location}</Text>
                    <Text className="text-md text-gray-500">Province: {midwifeObj.province}</Text>
                    <Text className="text-md text-gray-500">Phone: {midwifeObj.phone}</Text>
                    </View>
                </View>
                </View>
            ) : (
                <Text className="text-gray-500 text-center">No midwife data available.</Text>
            )}

            
            {/* Create Session Button */}
            <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={bookAppointment}>
                <Text className="text-white text-lg">Book Appointment</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddAppointment;
