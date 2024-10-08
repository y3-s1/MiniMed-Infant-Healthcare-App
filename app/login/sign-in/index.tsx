import { useSignIn } from '@clerk/clerk-expo';
import { Link, useNavigation, useRouter } from 'expo-router';
import { Text, TextInput, Button, View, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

export default function Page() {

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
          headerShown: false, // Hide the header
        });
      }, [navigation]);

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email..."
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        style={styles.input}
      />
      <TextInput
        value={password}
        placeholder="Password..."
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
        style={styles.input}
      />
      <Button title="Sign In" onPress={onSignInPress} />
      <View style={styles.footer}>
        <Text>Don't have an account?</Text>
        <Link href="/login/sign-up">
          <Text style={styles.signUpLink}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpLink: {
    marginLeft: 5,
    color: '#0d7ef7',
    fontWeight: 'bold',
  },
});
