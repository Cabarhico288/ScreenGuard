import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Entypo, Ionicons, FontAwesome } from '@expo/vector-icons';

const ChildTab = ({ state, descriptors, navigation }) => {
  const icons = {
    Home : (props) => <FontAwesome name="home" size={26} {...props} />,
    Location: (props) => <Entypo name="location" size={26} {...props} />,
    Notifications: (props) => <Ionicons name="notifications" size={26} {...props} />,
    Child: (props) => <FontAwesome name="child" size={26} {...props} />,
  };

  const primaryColor = '#0891b2';
  const greyColor = '#737373';

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;

        if (['sitemap', 'not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.tabbarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
          >
            {icons[route.name]({ color: isFocused ? primaryColor : greyColor })}
            <Text style={{ color: isFocused ? primaryColor : greyColor, fontSize: 11 }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderTopEndRadius: 20,
    borderTopLeftRadius:20,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
  },
  indicatorWrapper: {
    position: 'absolute',
    bottom: -5,
    width: '100%',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0891b2',
  },
});

export default ChildTab;
