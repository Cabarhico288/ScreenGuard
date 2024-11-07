import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchBar from '../(Parenttabs)/SearchBar';
import _ChildList from '../(Parenttabs)/ChildList';

const Child: React.FC = () => {
  return (
    <View style={styles.container}>
      <SearchBar />
      <_ChildList/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Child;
