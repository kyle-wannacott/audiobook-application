import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { ListItem, Image, Tile, LinearProgress } from "react-native-elements";
import * as rssParser from "react-native-rss-parser";
// import Sound from 'react-native-sound';
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
  const [linearProgessBar, setlinearProgressBar] = useState(0);
  const [loading2, setLoading2] = useState(true);
  const [loading, setLoading] = useState(true);
  const [Loading, SetLoading] = useState(false);
  const [Loaded, SetLoaded] = useState(false);
  // const [sound, setSound] = React.useState();
  const [volume, setVolume] = useState(1.0);
  const [audioTrackLength, setAudioTrackLength] = useState(0);
  const [Playing, SetPlaying] = useState(false);
  const [Duration, SetDuration] = useState(0);
  const [Value, SetValue] = React.useState(0);
  const sound = React.useRef(new Audio.Sound());

  const [
    AudioBooksRSSLinkToAudioTracks,
    AudioBookId,
    bookCoverImage,
  ] = props.route.params;

  useEffect(() => {
    fetch(AudioBooksRSSLinkToAudioTracks)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        setData(rss.items);
        setAudioBookDescription(rss);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(
      `https://librivox.org/api/feed/audiobooks/?id=${AudioBookId}&extended=1&format=json`
    )
      .then((response) => response.json())
      .then((json) => setAudioBookData(json.books))
      .catch((error) => console.error(error))
      .finally(() => setLoading2(false));
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
        HandleNext(CurrentIndex + 1);
      } else if (data.positionMillis) {
        if (data.durationMillis) {
          SetValue(((data.positionMillis / data.durationMillis) * 100).toFixed(2));
          console.log(data.positionMillis, data.durationMillis, Value);
        }
      }
    } catch (error) {
      console.log("Error");
    }
  };

  // const UpdateStatus = async (data) => {
  // try {
  // if (data.didJustFinish) {
  // ResetPlayer();
  // } else if (data.positionMillis) {
  // if (data.durationMillis) {
  // let positionInAudiobook =
  // (data.positionMillis / data.durationMillis) * 100;
  // SetValue(positionInAudiobook);
  // console.log(Value, "time", data.positionMillis, data.durationMillis);
  // }
  // }
  // } catch (error) {
  // console.log(error);
  // }
  // };
  //
  const SeekUpdate = async (data) => {
    try {
      const result = await sound.current.getStatusAsync();
      console.log("seek update");
      if (result.isLoaded == true) {
        const result = (data / 100) * Duration;
        await sound.current.setPositionAsync(Math.round(result));
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const ResetPlayer = async () => {
    try {
      const checkLoading = await sound.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        SetValue(0);
        SetPlaying(false);
        await sound.current.setPositionAsync(0);
        await sound.current.stopAsync();
      }
    } catch (error) {
      console.log("Error");
    }
  };

  // async function playSound(itemURL, index, time) {
  // console.log(index, currentAudioTrackIndex, time);
  // SetPlaying(true);
  // currentAudioTrackIndex.current = index;
  // try {
  // console.log("Loading Sound");
  // await Audio.setAudioModeAsync({
  // allowsRecordingIOS: false,
  // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  // playsInSilentModeIOS: true,
  // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  // shouldDuckAndroid: true,
  // staysActiveInBackground: true,
  // playThroughEarpieceAndroid: true,
  // });
  // const result = await sound.current.loadAsync({ uri: itemURL });
  // await sound.current.playAsync();
  // SetPlaying(true);
  // sound.current.setStatusAsync({ progressUpdateIntervalMillis: 1000 });
  // sound.current.setOnPlaybackStatusUpdate(UpdateStatus);
  //
  // result = await sound.getStatusAsync();
  // console.log(result);
  // console.log("Playing Sound");
  // sound.setStatusAsync({ shouldPlay: true, positionMillis: 8000 });
  // } catch (error) {
  // console.log(error);
  // }
  // }
  const LoadAudio = async (index) => {
    SetLoading(true);
    console.log(index, "Playing");
    const checkLoading = await sound.current.getStatusAsync();
    if (checkLoading.isLoaded === false) {
      try {
        const result = await sound.current.loadAsync(
          { uri: listRSSURLS[index] },
          {},
          true
        );
        if (result.isLoaded === false) {
          SetLoading(false);
          SetLoaded(false);
        } else {
          sound.current.setOnPlaybackStatusUpdate(UpdateStatus);
          SetLoading(false);
          SetLoaded(true);
          SetDuration(result.durationMillis);
          PlayAudio();
        }
      } catch (error) {
        SetLoading(false);
        SetLoaded(false);
      }
    } else {
      SetLoading(false);
      SetLoaded(true);
    }
  };
  // const handlePlayPause = async () => {
  // try {
  // const asyncStatus = await sound.current.getStatusAsync();
  // if (asyncStatus.isPlaying === false) {
  // SetPlaying(!Playing);
  // playSound(listRSSURLS[currentAudioTrackIndex], currentAudioTrackIndex);
  // setCurrentAudioTrackIndex(currentAudioTrackIndex + 1);
  // } else if (asyncStatus.isPlaying === true) {
  // Playing
  // ? await sound.current.pauseAsync()
  // : await sound.current.playAsync();
  // SetPlaying(!Playing);
  // }
  // } catch (error) {
  // console.log(error);
  // }
  // };

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
      SetPlaying(true);
    }
  };

  const HandleNext = async () => {
    if (currentAudioTrackIndex.current + 1 < listRSSURLS.length) {
      await sound.current.unloadAsync();
      LoadAudio(currentAudioTrackIndex.current + 1);
      currentAudioTrackIndex.current += 1;
    }
  };

  const HandlePrev = async () => {
    if (currentAudioTrackIndex.current - 1 >= 0) {
      await sound.current.unloadAsync();
      LoadAudio(currentAudioTrackIndex.current - 1);
      currentAudioTrackIndex.current -= 1;
    }
  };
  // const handlePreviousTrack = async () => {
  // const asyncStatus = await sound.current.getStatusAsync();
  // if (asyncStatus.isPlaying === true) {
  // await sound.current.unloadAsync();
  // SetPlaying(false)
  // currentAudioTrackIndex < listRSSURLS.length - 1 &&
  // currentAudioTrackIndex >= 1
  // ? setCurrentAudioTrackIndex(currentAudioTrackIndex - 1)
  // : setCurrentAudioTrackIndex(0);
  // playSound(listRSSURLS[currentAudioTrackIndex], currentAudioTrackIndex);
  // }else{
  // SetPlaying(false)
  // currentAudioTrackIndex < listRSSURLS.length - 1 &&
  // currentAudioTrackIndex >= 1
  // ? setCurrentAudioTrackIndex(currentAudioTrackIndex - 1)
  // : setCurrentAudioTrackIndex(0);
  // playSound(listRSSURLS[currentAudioTrackIndex], currentAudioTrackIndex);
  // }
  // };
  //
  // const handleNextTrack = async () => {
  // const asyncStatus = await sound.current.getStatusAsync();
  // if (asyncStatus.isPlaying === true) {
  // console.log(currentAudioTrackIndex, listRSSURLS.length - 1);
  // await sound.current.unloadAsync();
  // SetPlaying(false)
  // currentAudioTrackIndex < listRSSURLS.length - 1
  // ? setCurrentAudioTrackIndex(currentAudioTrackIndex + 1)
  // : setCurrentAudioTrackIndex(0);
  // playSound(listRSSURLS[currentAudioTrackIndex], currentAudioTrackIndex);
  // }
  // else{
  // SetPlaying(false)
  // currentAudioTrackIndex < listRSSURLS.length - 1
  // ? setCurrentAudioTrackIndex(currentAudioTrackIndex + 1)
  // : setCurrentAudioTrackIndex(0);
  // playSound(listRSSURLS[currentAudioTrackIndex], currentAudioTrackIndex);
  // }
  // };

  // React.useEffect(() => {
  // return sound.current
  // ? () => {
  // console.log("Unloading Sound");
  // sound.current.unloadAsync();
  // }
  // : undefined;
  // }, [sound.current]);

  const GetDurationFormat = (duration) => {
    let time = duration / 1000;
    let minutes = Math.floor(time / 60);
    let timeForSeconds = time - minutes * 60;
    let seconds = Math.floor(timeForSeconds);
    let secondsReadable = seconds > 9 ? seconds : `0${seconds}`;
    return `${minutes}:${secondsReadable}`;
  };

  const keyExtractor = (item, index) => index.toString();
  const renderItem = ({ item, index }) => (
    <View>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>
            {item.section_number}: {item.title}
          </ListItem.Title>
          <ListItem.Subtitle>{item.genres}</ListItem.Subtitle>
          <ListItem.Subtitle>
            Read by: {item.readers[0].display_name}
          </ListItem.Subtitle>
          <ListItem.Subtitle>Playtime: {item.playtime}</ListItem.Subtitle>
          <LinearProgress
            color="primary"
            value={linearProgessBar}
            variant="determinate"
          />
        </ListItem.Content>
        <ListItem.Chevron />
        <Button
          onPress={() => {
            LoadAudio(index);
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

  if (!loading && !loading2) {
    const getHeader = () => {
      return (
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}> {AudioBookData[0].title}</Text>
          <Image
            source={{ uri: bookCoverImage }}
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.bookDescription}>
            {" "}
            By {AudioBookData[0].authors[0].first_name}{" "}
            {AudioBookData[0].authors[0].last_name}
          </Text>
          <Text style={styles.bookDescription}>
            {" "}
            Description: {AudioBookDescription.description}
          </Text>
          <Text> Total time: {AudioBookData[0].totaltime} </Text>
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
            value={Value}
            allowTouchTrack={true}
            minimumValue={0}
            maximumValue={100}
            onSlidingComplete={(data) => SeekUpdate(data)}
          />
          <Text>{Value} world</Text>
          <Text>{audioTrackLength} length track</Text>
          <Text>
            {Playing
              ? GetDurationFormat((Value * Duration) / 100)
              : GetDurationFormat(Duration)}
          </Text>
        </View>
        <View style={styles.controlsVert}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => HandlePrev()}>
              <MaterialIcons
                name="skip-previous"
                size={40}
                color="black"
                style={styles.control}
              />
            </TouchableOpacity>

            {Loading ? (
              <ActivityIndicator size={"large"} color={"dodgerblue"} />
            ) : Loaded === false ? (
              <TouchableOpacity
                onPress={() => LoadAudio(currentAudioTrackIndex.current)}
              >
                <Ionicons
                  name="md-reload-sharp"
                  size={30}
                  color="black"
                  style={styles.control}
                />
              </TouchableOpacity>
            ) : Playing ? (
              <TouchableOpacity onPress={() => PauseAudio()}>
                <Entypo
                  name="controller-paus"
                  size={40}
                  color="black"
                  style={styles.control}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <Entypo
                  name="controller-play"
                  size={40}
                  color="black"
                  style={styles.control}
                  onPress={() => PlayAudio()}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => HandleNext()}>
              <MaterialIcons
                name="skip-next"
                size={40}
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
    backgroundColor: "blue",
    padding: 10,
    // alignItems: "center",
    // justifyContent: "center",
  },
  AudioTracksStyle: {
    flex: 8,
  },
  controlsVert: {
    flex: 1,
  },
  controls: {
    flex: 1,
    // top:-100,
    flexDirection: "row",
    backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center",
  },
  SliderStyle: {
    backgroundColor: "purple",
    // top: -200,
    // padding: 10,
    flex: 1,
  },
  listItemHeaderStyle: {
    fontSize: 20,
    top: 20,
    backgroundColor: "red",
  },
  ActivityIndicatorStyle: {
    top: 100,
    // top:100,
  },
  bookTitle: {
    // top:100,
    fontSize: 30,
  },
  bookDescription: {
    // top:100,
    fontSize: 14,
  },
  bookHeader: {
    padding: 10,
  },
  albumCover: {
    width: 250,
    height: 250,
  },
  control: {
    backgroundColor: "blue",
    color: "purple",
    margin: 30,
  },
});

export default Audiotracks;
