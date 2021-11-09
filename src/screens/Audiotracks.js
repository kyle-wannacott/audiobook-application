import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  ListItem,
  Image,
  Tile,
  LinearProgress,
  Card,
  Rating,
} from "react-native-elements";
import * as rssParser from "react-native-rss-parser";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import {
  FlatList,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function Audiotracks(props) {
  const [AudioBookData, setAudioBookData] = useState([]);
  const [AudioBookDescription, setAudioBookDescription] = useState([]);
  const currentAudioTrackIndex = useRef(0);
  const [data, setData] = useState([]);
  const [loadingAudiobookData, setLoadingAudioBookData] = useState(true);
  const [loadingAudioListeningLinks, setLoadingAudioListeningLinks] =
    useState(true);
  const [loadingCurrentAudiotrack, setLoadingCurrentAudiotrack] =
    useState(false);
  const [loadedCurrentAudiotrack, setLoadedCurrentAudiotrack] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [audioTrackLength, setAudioTrackLength] = useState(0);
  const [Playing, SetPlaying] = useState(false);
  const [Duration, SetDuration] = useState(0);
  const [audioTrackPlayingTitle, setAudioTrackPlayingTitle] = useState("");
  const [audioTrackReader, setAudioTrackReader] = useState("");
  const [currentAudiotrackPosition, setCurrentAudiotrackPosition] =
    React.useState(0);

  const [lengthOfSections, setLengthOfSections] = useState(0);
  const [linearProgessBar, setlinearProgressBar] = useState([]);

  const [AudioBooksRSSLinkToAudioTracks, AudioBookId, bookCoverImage] =
    props.route.params;

  useEffect(() => {
    async function setAudioMode() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: true,
          allowsRecordingIOS: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
        });
      } catch (e) {
        console.log(e);
      }
    }
    setAudioMode();
  }, []);
  const sound = React.useRef(new Audio.Sound());

  useEffect(() => {
    fetch(AudioBooksRSSLinkToAudioTracks)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        setData(rss.items);
        setAudioBookDescription(rss);
      })
      .catch((error) => console.log("Error: ", error))
      .finally(() => {
        setLoadingAudioListeningLinks(false);
      });
  }, []);

  useEffect(() => {
    fetch(
      `https://librivox.org/api/feed/audiobooks/?id=${AudioBookId}&extended=1&format=json`
    )
      .then((response) => response.json())
      .then((json) => {
        return (
          setAudioBookData(json.books),
          setLengthOfSections(json.books[0].sections.length)
        );
      })
      .catch((error) => console.log("Error: ", error))
      .finally(() => setLoadingAudioBookData(false));
  }, []);

  useEffect(() => {
    let AudiotracksProgressBars = new Array(lengthOfSections).fill(0);
    setlinearProgressBar(AudiotracksProgressBars);
    console.log("useEffect");
  }, []);

  React.useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.current.unloadAsync();
        }
      : undefined;
  }, [sound.current]);

  const UpdateStatus = async (data) => {
    try {
      if (data.didJustFinish) {
        console.log("Finished!!!");
        return HandleNext(currentAudioTrackIndex.current);
      } else if (data.positionMillis && data.durationMillis) {
        console.log(
          data.positionMillis,
          data.durationMillis,
          currentAudiotrackPosition
        );

        let newArray = [...linearProgessBar];
        newArray[currentAudioTrackIndex.current] = linearProgessBar[
          currentAudioTrackIndex.current
        ] = data.positionMillis / data.durationMillis;
        setlinearProgressBar(newArray);

        return setCurrentAudiotrackPosition(
          ((data.positionMillis / data.durationMillis) * 100).toFixed(2)
        );
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const SeekUpdate = async (data) => {
    try {
      const result = await sound.current.getStatusAsync();
      console.log("seek update");
      if (result.isLoaded == true) {
        const result = (data / 100) * Duration;
        return await sound.current.setPositionAsync(Math.round(result));
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const ResetPlayer = async () => {
    try {
      const checkLoading = await sound.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        setCurrentAudiotrackPosition(0);
        SetPlaying(false);
        await sound.current.setPositionAsync(0);
        await sound.current.stopAsync();
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const LoadAudio = async (index) => {
    currentAudioTrackIndex.current = index;
    setLoadingCurrentAudiotrack(true);
    console.log(index, "Playing");
    const checkLoading = await sound.current.getStatusAsync();
    // console.log(listRSSURLS[index]);
    // console.log(AudioBookData[0].sections[index].title);
    if (checkLoading.isLoaded === false) {
      try {
        const result = await sound.current.loadAsync(
          { uri: listRSSURLS[index] },
          {
            // androidImplementation: 'MediaPlayer',
            // downloadFirst: true,
            progressUpdateIntervalMillis: 5000,
            positionMillis: 0,
            shouldPlay: false,
            rate: 1.0,
            shouldCorrectPitch: false,
            volume: 1.0,
            isMuted: false,
            isLooping: false,
          },
          true
        );
        if (result.isLoaded === false) {
          setLoadingCurrentAudiotrack(false);
          setLoadedCurrentAudiotrack(false);
        } else {
          setAudioTrackPlayingTitle(
            AudioBookData[0].sections[index].section_number +
              ". " +
              AudioBookData[0].sections[index].title
          );
          setAudioTrackReader(
            AudioBookData[0].sections[index].readers[0]["display_name"]
          );
          sound.current.setOnPlaybackStatusUpdate(UpdateStatus);
          setLoadingCurrentAudiotrack(false);
          setLoadedCurrentAudiotrack(true);
          SetDuration(result.durationMillis);
          PlayAudio();
        }
      } catch (error) {
        setLoadingCurrentAudiotrack(false);
        setLoadedCurrentAudiotrack(false);
        console.log("Error: ", error);
      }
    } else {
      setLoadingCurrentAudiotrack(false);
      setLoadedCurrentAudiotrack(true);
    }
  };

  const PlayAudio = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === false) {
          console.log("playing");
          sound.current.playAsync();
          SetPlaying(true);
        }
      }
    } catch (error) {
      SetPlaying(false);
      console.log("Error: ", error);
    }
  };

  const PauseAudio = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === true) {
          sound.current.pauseAsync();
          SetPlaying(false);
        }
      }
    } catch (error) {
      console.log("Error: ", error);
      SetPlaying(true);
    }
  };

  const HandleNext = async () => {
    if (currentAudioTrackIndex.current < listRSSURLS.length - 1) {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        currentAudioTrackIndex.current += 1;
        ResetPlayer();
        return LoadAudio(currentAudioTrackIndex.current);
      }
    } else if (currentAudioTrackIndex.current >= listRSSURLS.length - 1) {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        currentAudioTrackIndex.current = 0;
        ResetPlayer();
        return LoadAudio(currentAudioTrackIndex.current);
      }
    }
  };

  const HandlePrev = async () => {
    if (currentAudioTrackIndex.current - 1 >= 0) {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        LoadAudio(currentAudioTrackIndex.current - 1);
        currentAudioTrackIndex.current -= 1;
      }
    }
  };

  const GetDurationFormat = (duration) => {
    const time = duration / 1000;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    const secondsFormatted = seconds > 9 ? seconds : `0${seconds}`;
    return `${minutes}:${secondsFormatted}`;
  };

  const PlayFromListenButton = async (index) => {
    try {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        ResetPlayer();
        return LoadAudio(index);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const keyExtractor = (item, index) => index.toString();
  // TODO: error handle if null/undefined i.e no reader listed/read by.
  const renderItem = ({ item, index }) => (
    <View>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>
            {item.section_number}: {item.title}
          </ListItem.Title>
          <ListItem.Subtitle>{item.genres}</ListItem.Subtitle>
          <ListItem.Subtitle>
            Read by:{" "}
            {item.readers[0]["display_name"]}
          </ListItem.Subtitle>
          <ListItem.Subtitle>Playtime: {item.playtime}</ListItem.Subtitle>
          <LinearProgress
            color="primary"
            value={linearProgessBar[index]}
            variant="determinate"
            trackColor="lightblue"
          />
        </ListItem.Content>
        <ListItem.Chevron />
        <Button
          onPress={() => {
            PlayFromListenButton(index);
          }}
          title="Listen"
          color="#841584"
          accessibilityLabel="purple button"
        />
      </ListItem>
    </View>
  );

  const listRSSURLS = [];
  const rssURLS = Object.entries(data);
  rssURLS.forEach(([key, value]) => {
    listRSSURLS.push(value.enclosures[0].url);
  });

  function ratingCompleted(rating) {
    // console.log("Rating is: " + rating)
  }

  if (!loadingAudioListeningLinks && !loadingAudiobookData) {
    const getHeader = () => {
      return (
        <View style={styles.bookHeader}>
          <Card>
            <Card.Title style={styles.bookTitle}>
              {" "}
              {AudioBookData[0].title}
            </Card.Title>
            <Card.Divider />
            <Card.Image
              source={{ uri: bookCoverImage }}
              style={{
                width: 200,
                height: 200,
                marginBottom: 20,
                marginLeft: 35,
              }}
            />
            <Text style={styles.bookAuthor}>
              {" "}
              Author: {AudioBookData[0].authors[0].first_name}{" "}
              {AudioBookData[0].authors[0].last_name}
            </Text>
            <Text style={styles.bookDescription}>
              {AudioBookDescription.description}
            </Text>
            <Rating
              showRating
              ratingCount={5}
              startingValue={0}
              onFinishRating={ratingCompleted}
              style={{ paddingVertical: 10 }}
            />
            <Text> Total time: {AudioBookData[0].totaltime} </Text>
          </Card>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.AudioTracksStyle}>
          <View style={styles.listItemHeaderStyle}>
            <FlatList
              data={AudioBookData[0].sections}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={getHeader()}
            />
          </View>
        </View>

        <View style={styles.SliderStyle}>
          <Slider
            value={currentAudiotrackPosition}
            allowTouchTrack={true}
            minimumValue={0}
            maximumValue={100}
            onSlidingComplete={(data) => SeekUpdate(data)}
          />
          <View style={styles.AudiobookTime}>
            <Text style={{ marginLeft: 10 }}>
              {" "}
              {GetDurationFormat(
                (currentAudiotrackPosition * Duration) / 100
              )}{" "}
            </Text>
            <Text style={{ marginRight: 10 }}>
              {" "}
              {GetDurationFormat(Duration)}
            </Text>
          </View>

          <View style={styles.SliderContainer}>
            <Image
              source={{ uri: bookCoverImage }}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <View>
              <Text> {audioTrackPlayingTitle} </Text>
              <Text> {audioTrackReader} </Text>
            </View>
          </View>
        </View>
        <View style={styles.controlsVert}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => HandlePrev()}>
              <MaterialIcons
                name="skip-previous"
                size={50}
                color="black"
                style={styles.control}
              />
            </TouchableOpacity>

            {loadingCurrentAudiotrack ? (
              <ActivityIndicator size={"large"} color={"dodgerblue"} />
            ) : loadedCurrentAudiotrack === false ? (
              <TouchableOpacity
                onPress={() => LoadAudio(currentAudioTrackIndex.current)}
              >
                <MaterialIcons
                  name="not-started"
                  size={50}
                  color="black"
                  style={styles.control}
                />
              </TouchableOpacity>
            ) : Playing ? (
              <TouchableOpacity onPress={() => PauseAudio()}>
                <MaterialIcons
                  name="pause"
                  size={50}
                  color="black"
                  style={styles.control}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <MaterialIcons
                  name="play-arrow"
                  size={50}
                  color="black"
                  style={styles.control}
                  onPress={() => PlayAudio()}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => HandleNext()}>
              <MaterialIcons
                name="skip-next"
                size={50}
                color="black"
                style={styles.control}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View>
        <ActivityIndicator
          size="large"
          color="#00ff00"
          style={styles.ActivityIndicatorStyle}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "darkgreen",
    padding: 10,
  },
  AudioTracksStyle: {
    flex: 7,
    marginBottom: 20,
  },
  controlsVert: {
    flex: 0.8,
  },
  controls: {
    flex: 1,
    // top:-100,
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  AudiobookTime: {
    display: "flex",
    backgroundColor: "purple",
    flexDirection: "row",
    justifyContent: "space-between",
    // top: -200,
    // padding: 10,
    flex: 1,
  },
  SliderStyle: {
    backgroundColor: "purple",
    // top: -200,
    // padding: 10,
    flex: 1,
  },
  SliderContainer: {
    backgroundColor: "orange",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    // top: -200,
    // padding: 10,
  },
  listItemHeaderStyle: {
    fontSize: 20,
    top: 20,
    backgroundColor: "black",
  },
  ActivityIndicatorStyle: {
    top: 100,
    // top:100,
  },
  bookTitle: {
    // top:100,
    fontSize: 30,
  },
  bookAuthor: {
    // top:100,
    fontWeight: "bold",
  },
  bookDescription: {
    // top:100,
    fontSize: 16,
    padding: 2,
  },
  bookHeader: {
    display: "flex",
    paddingBottom: 10,
    padding: 2,
  },
  albumCover: {
    width: 250,
    height: 250,
  },
  control: {
    height: 50,
    backgroundColor: "blue",
    borderRadius: 25,
    color: "purple",
    margin: 30,
  },
});

export default Audiotracks;
