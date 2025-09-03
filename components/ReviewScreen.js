import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { ridesApi } from '../lib/api';
import styles from '../styles/profileScreenStyles'; // Reusing the style you provided

export default function ReviewScreen({ route, navigation }) {
  const { bookingId, driverName, driverId, rideId } = route.params;
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');

    const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i.toString())}>
            <Text style={{ fontSize: 36, color: i <= parseInt(rating) ? '#FFD700' : '#ccc', marginHorizontal: 4 }}>
            {i <= parseInt(rating) ? '★' : '☆'}
            </Text>
        </TouchableOpacity>
        );
    }

  return <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>{stars}</View>;
};
  const submitReview = async () => {
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return Alert.alert("Please enter a valid rating between 1 and 5.");
    }

    const result = await ridesApi.submitReview({
      rideId,
      bookingId,
      driverId,
      rating,
      comment: comments,
    });

    if (result.error) {
      Alert.alert("Error submitting review");
    } else {
      Alert.alert("Thank you for your feedback!");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Ride</Text>
        <View style={{ width: 36 }} /> {/* spacer to balance back button */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Your experience with {driverName}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Rating</Text>
            {renderStars()}
            </View>


          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Comments (optional)</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={comments}
              onChangeText={setComments}
              multiline
              placeholder="Share more about your ride..."
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={submitReview}>
            <Text style={styles.saveButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
