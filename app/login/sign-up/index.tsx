import * as React from 'react';
import { TextInput, Button, View, StyleSheet, Text } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation, useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');


  const navigation = useNavigation();

    React.useEffect(() => {
        navigation.setOptions({
          headerTitle: 'Sign Up', // Hide the header
        });
      }, [navigation]);

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {!pendingVerification && (
        <>
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email..."
            onChangeText={(email) => setEmailAddress(email)}
            style={styles.input}
          />
          <TextInput
            value={password}
            placeholder="Password..."
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
            style={styles.input}
          />
          <Button title="Sign Up" onPress={onSignUpPress} />
        </>
      )}
      {pendingVerification && (
        <>
          <Text style={styles.label}>Enter the verification code sent to your email:</Text>
          <TextInput
            value={code}
            placeholder="Code..."
            onChangeText={(code) => setCode(code)}
            style={styles.input}
          />
          <Button title="Verify Email" onPress={onPressVerify} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
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
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
});
