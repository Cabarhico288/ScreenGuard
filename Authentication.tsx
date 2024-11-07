import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '731412951458-gnjkf3jgg3fvvhu9j2kph6c9q1amtk3d.apps.googleusercontent.com',
    androidClientId: '731412951458-bnk728dohago51o82n3cgn8qt2n3dsoi.apps.googleusercontent.com',
    webClientId: '731412951458-n0vfjfjd99s80783663sc9p8gufi387c.apps.googleusercontent.com',
    responseType: ResponseType.Token,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      setAccessToken(response.authentication?.accessToken ?? null);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        disabled={!request}
        title="Login with Google"
        onPress={() => promptAsync()}
      />
      {accessToken && <Text>Access Token: {accessToken}</Text>}
    </View>
  );
}
