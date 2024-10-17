import React from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const appointmentSuccess = () => {
  const { date, timeSlot, sessionType, location, user, child } = useLocalSearchParams();

  // Example function to generate the PDF receipt
  const downloadReceipt = async () => {
    const htmlContent = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            text-align: center;
          }
          .heading {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subText {
            font-size: 16px;
            margin-bottom: 40px;
          }
          .content {
            text-align: left;
            margin-top: 20px;
          }
          .content p {
            font-size: 14px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="heading">Appointment Receipt</div>
        <div class="subText">Your Appointment Details</div>
        <div class="content">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time Slot:</strong> ${timeSlot}</p>
          <p><strong>Session Type:</strong> ${sessionType}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>User ID:</strong> ${user}</p>
          <p><strong>Child ID:</strong> ${child}</p>
        </div>
      </body>
      </html>
    `;

    try {
      // Generate PDF from the HTML content
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF generated at:', uri);

      // Share the PDF
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to download the receipt.');
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✓</Text>
      </View>
      <Text style={styles.heading}>Congratulations</Text>
      <Text style={styles.subText}>Your Appointment Is Successfully Placed</Text>
      
      {/* Download Receipt Button */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-3 items-center mb-5" onPress={downloadReceipt}>
          <Text className="text-white text-lg">Download Receipt</Text>
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity className="bg-white p-4 rounded-lg mt-3 items-center mb-5" 
          onPress={() => router.navigate({
            pathname: '/(tabs)/appointments',
          })} 
        >
          <Text className="text-black text-lg">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  iconContainer: {
    backgroundColor: '#00bcd4',
    borderRadius: 50,
    padding: 10,
    paddingHorizontal:20,
    marginBottom: 20,
  },
  icon: {
    fontSize: 50,
    color: 'white',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});

export default appointmentSuccess;
