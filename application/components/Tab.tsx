import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Entypo, Ionicons, FontAwesome } from '@expo/vector-icons';

const Tab = ({ state, descriptors, navigation }) => {
  const icons = {
    index: (props) => <FontAwesome name="home" size={26} {...props} />,
    location: (props) => <Entypo name="location" size={26} {...props} />,
    notifications: (props) => <Ionicons name="notifications" size={26} {...props} />,
    child: (props) => <FontAwesome name="child" size={26} {...props} />,
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
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 0.1,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});

export default Tab;
