import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";

import ButtonPanel from "../components/ButtonPanel";
import { useNavigation } from "@react-navigation/native";
import { ListItem, Avatar , Rating} from "react-native-elements";
import { FlatList, ActivityIndicator, Dimensions } from "react-native";
import AudiobookAccordionList from "../components/audiobookAccordionList.js";

import { openDatabase } from "../utils";

const db = openDatabase();

function Bookshelf() {
  const [audiobookHistory, setAudiobookHistory] = useState("");
  const [audiobooksdata, setaudiobooksdata] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql("select * from testShelve23", [], (_, { rows }) => {
        setAudiobookHistory(rows);
        setLoadingHistory(false);
      });
    }, null);
  }, []);
  // console.log(2,audiobookHistory)

  // console.log(typeof audiobookHistory, audiobookHistory);

  useEffect(() => {
    console.log("useEffect");
  }, []);

  const keyExtractor = (item, index) => index.toString();

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const navigation = useNavigation();
  const renderBookshelve = ({ item, index }) => (
    <View>
      <ListItem topDivider containerStyle={styles.AudioBookListView}>
        <View style={styles.ImageContainer}>
          <Avatar
            source={{ uri: item.audiobook_image }}
            style={{ width: windowWidth / 2 - 42, height: windowHeight / 5 }}
            onPress={() => {
              navigation.navigate("Audio", [
                item.audiobook_rss_url,
                item.audiobook_id,
                item.audiobook_image,
                item.audiobook_title,
                item.audiobook_author_first_name,
                item.audiobook_author_last_name,
                item.audiobook_total_time,
                item.audiobook_copyright_year,
                item.audiobook_genres,
              ]);
            }}
          />
        </View>
      </ListItem>
          <Rating
            showRating
            imageSize={20}
            ratingCount={5}
            startingValue={item.audiobook_rating}
            showRating={false}
            readonly={true}
            style={{ratingColor:"red"}}
            tintColor={"black"}
            ratingBackgroundColor={"purple"}
          />
      <AudiobookAccordionList
        audiobookTitle={item.audiobook_title}
        audiobookAuthorFirstName={item.audiobook_author_first_name}
        audiobookAuthorLastName={item.audiobook_author_last_name}
        audiobookTotalTime={item.audiobook_total_time}
        audiobookCopyrightYear={item.audiobook_copyright_year}
        audiobookGenres={item.audiobook_genres}
      />
    </View>
  );

  if (!loadingHistory) {
    // console.log(audiobookHistory["_array"], "hisotry");
    return (
      <View>
        <View style={styles.audiobookImagesContainer}>
          <FlatList
            data={audiobookHistory["_array"]}
            keyExtractor={keyExtractor}
            renderItem={renderBookshelve}
            numColumns={2}
            containerStyle={{ bottom: 10 }}
          />
          <View styles={styles.buttonStyle}>
            <ButtonPanel buttonPressedIndex={1} />
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.ActivityIndicatorStyle}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }
}

export default Bookshelf;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  ImageContainer: {
    flexDirection: "column",
    backgroundColor: "red",
    width: windowWidth / 2 - 40,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 2,
  },
  audiobookImagesContainer: {
    padding: 10,
    paddingTop: 40,
    paddingBottom: 0,
    // bottom: 162,
    height: 750,
    color: "blue",
    backgroundColor: "#331800",
  },
  buttonStyle: {
    paddingTop: 0,
  },
  AudioBookListView: {
    backgroundColor: "#51361a",
  },
  ActivityIndicatorStyle: {
    top: windowHeight / 2,
    color: "green",
  },
});
