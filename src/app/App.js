import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Assets from '../util/Assets';
import Constants from '../util/Constants';
const {width: ScreenWidth} = Dimensions.get('window');

const App = () => {
  const [isInternetConnectionVisited, setConnectionVisitingStatus] =
    useState(false);
  const [isInternetConnected, setConnectionStatus] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [loader, setLoader] = useState(true);
  const [isRetrying, setRetrying] = useState(false);
  const [response, setResponse] = useState([]);

  React.useEffect(() => {
    let timer;
    const unsubscribe = NetInfo.addEventListener(state => {
      timer = setTimeout(() => {
        setConnectionVisitingStatus(true);
        setIsInternetReachable(state.isInternetReachable);
        setConnectionStatus(state.isConnected);
        setLoader(false);
      }, 3000);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    isInternetConnectionVisited &&
      isInternetConnected &&
      isInternetReachable &&
      fetchData(Constants.demoURL);
  }, [
    isInternetConnectionVisited,
    isInternetConnected,
    isInternetReachable,
    isRetrying,
  ]);

  const fetchData = async (url, options = {}) => {
    let response = null;
    let error = null;
    setLoader(true);

    try {
      const res = await fetch(url, {...options});
      response = await res.json();
      setResponse(response?.hits);
    } catch (err) {
      error = err;
      setResponse([]);
    } finally {
      setLoader(false);
      setRetrying(false);
    }
  };

  const Content = () => {
    const renderItem = data => {
      const {item, index} = data;
      return <Image source={{uri: item?.largeImageURL}} style={styles.image} />;
    };

    return (
      <View style={{flex: 1}}>
        <ListComponent
          data={{
            title: 'demoIMG',
            numColumns: 2,
            collection: response,
            renderShortListMethod: obj => renderItem(obj),
            card: {height: ScreenWidth / 2, spacing: 10},
          }}
        />
      </View>
    );
  };

  const RetryBox = () => {
    let canRetryWithInternet = isInternetConnected && !isInternetReachable;
    let errorMessage = !canRetryWithInternet
      ? 'No Internet Connection'
      : 'Something went wrong';

    return (
      <View>
        <Image style={{width: 200, height: 200}} source={Assets.offline} />

        <View style={styles.retryBoxDivider}>
          <Text style={styles.retryBoxDividerText}>{errorMessage}!</Text>
        </View>

        {canRetryWithInternet && (
          <TouchableOpacity
            onPress={() => {
              setRetrying(true);
            }}
            disabled={isRetrying}
            style={styles.retryBtn}>
            <Text style={styles.retryBtnLabel}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const Manager = () => {
    if (loader) {
      // Loader
      return (
        <ActivityIndicator style={styles.loader} color="#fff" size="large" />
      );
    } else {
      // Screen Content
      if (isInternetConnected && isInternetReachable) {
        return <Content />;
      } else {
        return <RetryBox />;
      }
    }
  };

  const ListComponent = ({data}) => {
    return (
      <FlatList
        ref={ref => ref}
        numColumns={data?.numColumns}
        data={data?.collection ?? []}
        renderItem={data?.renderShortListMethod}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id.toString()}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeWrapper}>
      <Manager />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  retryBtn: {
    backgroundColor: '#7FFFD4',
    borderRadius: 5,
    height: 50,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnLabel: {
    fontWeight: '600',
    color: '#000',
    fontSize: 18,
  },
  retryBoxDivider: {
    marginVertical: 20,
  },
  retryBoxDividerText: {
    color: '#fff',
    fontWeight: '600',
    alignSelf: 'center',
  },
  loader: {
    alignSelf: 'center',
  },
  image: {
    width: ScreenWidth / 2,
    aspectRatio: 1,
    marginRight: 10,
    marginBottom: 10,
  },
});

export default App;
