import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://zenquotes.io/api/quotes"; // API to fetch quotes

const App = () => {
  const [quotes, setQuotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false); 
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // List of high-contrast colors for the quotes (no light pastel colors)
  const quoteColors = [
    '#FF6347', // Tomato (Bright and Red)
    '#FF4500', // Orange Red
    '#D2691E', // Chocolate
    '#8B0000', // Dark Red
    '#B22222', // Firebrick
    '#32CD32', // Lime Green
    '#008B8B', // Dark Cyan
    '#A52A2A', // Brown
    '#800080', // Purple
    '#FF1493', // Deep Pink
  ];

  // Load quotes from AsyncStorage
  const loadQuotesFromStorage = async () => {
    try {
      const storedQuotes = await AsyncStorage.getItem("quotes");
      if (storedQuotes) {
        console.log("✅ Quotes loaded from AsyncStorage!");
        setQuotes(JSON.parse(storedQuotes));
      }
    } catch (error) {
      console.error("❌ Error loading quotes from AsyncStorage:", error);
    }
  };

  // Fetch quotes from API and save to AsyncStorage
  const fetchQuotes = async () => {
    try {
      console.log("🔄 Fetching new quotes from API...");
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok) {
        const newQuotes = data.slice(0, 50); // Load only 50 quotes
        setQuotes(newQuotes);
        await AsyncStorage.setItem("quotes", JSON.stringify(newQuotes));
        console.log("✅ Quotes saved to AsyncStorage!");
      } else {
        throw new Error("Failed to fetch quotes");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load quotes. Please try again.");
      console.error("❌ API Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setRefreshing(false);
  };

  // Scroll to a specific index
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  // Load stored quotes first, then fetch new ones
  useEffect(() => {
    const initializeQuotes = async () => {
      await loadQuotesFromStorage();
      await fetchQuotes();
    };
    initializeQuotes();
  }, []);

  // Function to get random color for each quote
  const getRandomColor = () => {
    return quoteColors[Math.floor(Math.random() * quoteColors.length)];
  };

  return (
    <View style={styles.container}>
      {/* Scroll buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Go to Top" onPress={() => scrollToIndex(0)} />
        <Button title="Go to Middle" onPress={() => scrollToIndex(Math.floor(quotes.length / 2))} />
        <Button title="Go to End" onPress={() => scrollToIndex(quotes.length - 1)} />
      </View>

      {/* Show loader while fetching */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : quotes.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={quotes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: getRandomColor() }]}>
              <Text style={styles.quoteText}>"{item.q}"</Text>
              <Text style={styles.authorText}>- {item.a}</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>⚠️ No quotes available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  item: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    fontStyle: "italic",
  },
  authorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "right",
    fontWeight: "normal",
  },
  loader: {
    marginTop: 20,
  },
});

export default App;
