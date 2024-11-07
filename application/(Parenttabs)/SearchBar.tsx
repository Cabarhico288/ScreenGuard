import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchBar: React.FC = () => {
  return (
    <View style={styles.searchContainer}>
      <TextInput style={styles.searchInput} placeholder="Search" />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    borderRadius: 30,
    backgroundColor: 'white',
    marginTop: 50,
    marginHorizontal: 10,
    marginLeft: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    width: '100%',
    height: 30,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 20,
    paddingLeft: 10,
  },
});

export default SearchBar;
