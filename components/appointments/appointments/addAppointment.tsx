import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { db } from '@/config/FireBaseConfig';
import { addDoc, collection, doc } from 'firebase/firestore';
import { router } from 'expo-router';

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
const userDocumentID = 'user001';
const childDocumentID = 'child001';

const AddAppointment: React.FC<AddAppointmentProps> = ({ sessions, midwifeId, sessionType, selectedLocation }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedDateDayOfMonth, setSelectedDateDayOfMonth] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<string>>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');  // State to save selected time slot

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
        const filteredSession = sessions.find(session => session.date === selectedDate);
        if (filteredSession) {
            const allSlots = generateTimeSlots(filteredSession.startTime, filteredSession.endTime, filteredSession.noOfSlots);
            const availableSlots = allSlots.filter(slot => !filteredSession.bookedSlots.includes(slot));
            setAvailableTimeSlots(availableSlots);
        } else {
            setAvailableTimeSlots([]);
        }
    };

    // Function to generate time slots based on start and end time
    const generateTimeSlots = (startTime: string, endTime: string, noOfSlots: number) => {
        const slots = [];
        const start = new Date(`1970-01-01T${convertTo24HourFormat(startTime)}:00`);
        const end = new Date(`1970-01-01T${convertTo24HourFormat(endTime)}:00`);
        const slotDuration = (end.getTime() - start.getTime()) / noOfSlots;

        for (let i = 0; i < noOfSlots; i++) {
            const slotStart = new Date(start.getTime() + i * slotDuration);
            const slotEnd = new Date(slotStart.getTime() + slotDuration);
            slots.push(formatTime(slotStart));
        }

        return slots;
    };

    // Convert time to 24-hour format
    const convertTo24HourFormat = (time: string) => {
        const [hours, modifier] = time.split(/[: ]/);
        let hour = parseInt(hours, 10);
        if (modifier === 'PM' && hour !== 12) hour += 12;
        if (modifier === 'AM' && hour === 12) hour = 0;
        return hour.toString().padStart(2, '0') + ':00';
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


    // Function to save the appointment data to Firestore under the midwife's sub-collection
    const bookAppointment = async () => {
        try {
        const midwifeDocRef = doc(db, 'Midwives', midwifeId);
        const appointmentsCollectionRef = collection(midwifeDocRef, 'MidwifeAppointments');

        await addDoc(appointmentsCollectionRef, {
            date:selectedDate,
            timeSlot: selectedTimeSlot,
            sessionType,
            location:selectedLocation,
            status: "booked",
            user:userDocumentID,
            child: childDocumentID,
        });
        Alert.alert('Success', 'Appointment created successfully!');
        router.navigate({
            pathname: '/appointments/midwives/appointmentSuccess',
            params: { 
                date:selectedDate,
                timeSlot: selectedTimeSlot,
                sessionType,
                location:selectedLocation,
                status: "booked",
                user:userDocumentID,
                child: childDocumentID,
             },  
          });
        } catch (error) {
        console.error('Error creating appointment:', error);
        Alert.alert('Error', 'Failed to create appointment.');
        }
    };

    return (
        <View>
            {/* Horizontal Date Picker */}
            <View className="mb-7">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-lg font-semibold">Date</Text>
                    <View className="flex-row items-center">
                        <Text className="text-lg">{selectedMonth}</Text>
                        <AntDesign name="right" size={24} color="black" />
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

            
            {/* Create Session Button */}
            <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={bookAppointment}>
                <Text className="text-white text-lg">Book Appointment</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddAppointment;
