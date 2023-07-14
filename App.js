import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import NetInfo from "@react-native-community/NetInfo";

const API_URL = "https://api.example.com/posts";
const STORAGE_KEY = "@OfflineApp:posts";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [offlineData, setOfflineData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const { data } = response;
      setData(data);
      setOfflineData(data);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    try {
      const offlineDataStr = await AsyncStorage.getItem(STORAGE_KEY);
      const offlineData = JSON.parse(offlineDataStr) || [];
      setOfflineData(offlineData);
      const response = await axios.post(API_URL, offlineData);
      const { data } = response;
      setData(data);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
    >
      <Text>{item.title}</Text>
      <Text>{item.body}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>
                No data available. Please check your internet connection.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default App;

const handleConnectivityChange = (isConnected) => {
  if (isConnected) {
    syncData();
  }
};

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

  return () => unsubscribe();
}, []);
