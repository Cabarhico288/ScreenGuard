import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Linking, NativeModules, Image, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { database } from '../firebase'; // Import the Realtime Database
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native'; 
import { styles as externalStyles } from '../../css/homedashboardstyle'; 
import * as Battery from 'expo-battery';

const { AppUsageModule } = NativeModules;

const HomeDashboard = () => {
  const [appSessionTime, setAppSessionTime] = useState<number>(0);
  const [batteryLevel, setBatteryLevel] = useState('Loading...');
  const [appUsageData, setAppUsageData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [installedApps, setInstalledApps] = useState([]);
  const [bootTime, setBootTime] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [interval, setInterval] = useState('daily');
  const [searchQueryInstalled, setSearchQueryInstalled] = useState('');
  const [usageAnalysis, setUsageAnalysis] = useState({
    
    social: 0,
    gaming: 0,
    productivity: 0,
    total: 0,
  });
  // Utility function to convert seconds to HH:MM:SS format
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s > 0 ? `${s}s` : ''}`;
};
  const [suggestions, setSuggestions] = useState([]);
 // Fetch all installed apps
 const fetchInstalledApps = async () => {
  try {
    const apps = await AppUsageModule.getAllInstalledApps(); // Fetch installed apps
    setInstalledApps(apps);
  } catch (error) {
    console.error('Error fetching installed apps:', error);
  }
};
useEffect(() => {
  const fetchData = async () => {
    await fetchInstalledApps();  // Fetch installed apps first
    await checkAndFetchAppUsageData();  // Then fetch usage data, only if permission is granted
  };

  fetchBatteryLevel();
  fetchDeviceBootTime();
  fetchData();  // Fetch apps and usage data on component mount or interval change
}, [interval]);


 // Filter and sort usage apps based on search and selected sort optionyyy
  const fetchBatteryLevel = async () => {
    const level = await Battery.getBatteryLevelAsync();
    setBatteryLevel(`${Math.floor(level * 100)}%`);
  };

  const fetchDeviceBootTime = async () => {
    try {
      const bootInfo = await AppUsageModule.getDeviceBootInfo(); // Corrected method name
      const bootTime = bootInfo.bootTime; // Extract bootTime from the bootInfo object
      const bootCount = bootInfo.bootCount; // Extract bootCount from the bootInfo object
      setBootTime(bootTime); // Update state with boot time
      console.log(`Device boot time: ${bootTime}, Boot count: ${bootCount}`);
    } catch (error) {
      console.error('Error fetching device boot info:', error); // Log any error
    }
  };
  

  const checkAndFetchAppUsageData = async () => {
    try {
      const hasPermission = await AppUsageModule.checkUsageAccessPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Needed',
          'You need to grant usage access to view app usage statistics.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      } else {
        setPermissionGranted(true);
        fetchAppUsageData(interval);
      }
    } catch (error) {
      console.error('Error fetching app usage data:', error);
    }
  };

  const fetchAppUsageData = async (interval) => {
    try {
      const usageData = await AppUsageModule.getAppUsageStats(interval); // Fetch data for the selected interval
      setAppUsageData(usageData);
      setSortedData(usageData);
      prepareBarChartData(usageData); // Prepare data for the bar chart
      analyzeUsageData(usageData); // Analyze data for healthy usage
    } catch (error) {
      console.error('Error fetching app usage data:', error);
    }
  };

  // Function to analyze app usage data and provide health suggestions
  const analyzeUsageData = (data) => {
    let socialTime = 0;
    let gamingTime = 0;
    let productivityTime = 0;
    let totalTime = 0;

    data.forEach((app) => {
      const appTime = parseFloat(app.timeInForeground.split(' ')[0]);
      totalTime += appTime;
      switch (app.appCategory) {
        case 'Social':
          socialTime += appTime;
          break;
        case 'Game':
          gamingTime += appTime;
          break;
        case 'Productivity':
          productivityTime += appTime;
          break;
        default:
          break;
      }
    });

    // Save analysis results
    setUsageAnalysis({
      social: socialTime,
      gaming: gamingTime,
      productivity: productivityTime,
      total: totalTime,
    });

    // Provide suggestions based on the analysis
    const newSuggestions = [];

    if (socialTime > 2 * 60 * 60) {
      newSuggestions.push('You are spending too much time on social apps. Consider reducing time on social media.');
    }
    if (gamingTime > 2 * 60 * 60) {
      newSuggestions.push('Consider limiting your gaming time to balance it with productivity tasks.');
    }
    if (productivityTime < 1 * 60 * 60) {
      newSuggestions.push('Increase your time on productivity apps for better task management.');
    }

    setSuggestions(newSuggestions);
  };

 // Prepare Bar Chart Data: Filter apps with valid usage time
const prepareBarChartData = (data) => {
  const chartData = data
    .filter((app) => parseFloat(app.timeInForeground.split(' ')[0]) > 0) // Ensure usage > 0
    .map((app) => ({
      x: app.appName,
      y: parseFloat(app.timeInForeground.split(' ')[0]), // Usage in seconds
      formattedTime: formatTime(parseFloat(app.timeInForeground.split(' ')[0])), // Format usage time
    }));

  setBarChartData(chartData); // Set state with valid chart data
}; 
const renderAppItem = (app, index) => (
  <View key={app.packageName || index} style={styles.usageItem}>
    <Image
      source={{ uri: `data:image/png;base64,${app.appIcon}` }}
      style={styles.appIcon}
    />
    <View style={styles.appInfo}>
      <Text style={styles.usageLabel}>{app.appName}</Text>
      <Text style={styles.usageValue}>Installed: {app.installedDate || 'Unknown'}</Text>
      <Text style={styles.usageValue}>Category: {app.appCategory || 'Unknown'}</Text>
    </View>
  </View>
);

// Use an additional state or just filter on the fly in the render section
const filteredInstalledApps = installedApps.filter((app) =>
  app.appName.toLowerCase().includes(searchQueryInstalled.toLowerCase())
);
  
  
  const usageApps = sortedData.filter(
    (app) => app.timeInForeground && app.timeInForeground !== 'No usage data'
  );
  
  const allApps = installedApps.filter(
    (app) => app.appCategory !== 'Other' // Filter out unnecessary apps
  );
const handleSearchInstalled = (query) => {
  setSearchQueryInstalled(query);
};
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>

    {/* Dashboard Container */}
    <View style={styles.dashboardContainer}>
  {/* Bar Chart */}
  <View style={styles.chartContainer}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionHeader}>App Usage</Text>
      <View style={styles.pickerInlineContainer} >
        <Icon name="calendar-outline" size={20} color="#007AFF" style={styles.pickerIconInline} />
        <Picker
          selectedValue={interval}
          style={styles.pickerInline}
          onValueChange={(itemValue) => setInterval(itemValue)}
        >
          <Picker.Item label="Today" value="daily" />
          <Picker.Item label="Week" value="weekly" />
          <Picker.Item label="Month" value="monthly" />
        </Picker>
      </View>
    </View>
    <View style={styles.chartWrapper}>
    <VictoryChart
  theme={VictoryTheme.material}
  domainPadding={{ x: 0, y: 20 }}
>
  <VictoryBar
    data={barChartData}
    style={{
      data: { fill: ({ index }) => getColorForIndex(index) },
    }}
    alignment="middle"
    barWidth={20} // Adjust bar width here
    labels={({ datum }) => datum.formattedTime} // Use formatted time for labels
  />
  <VictoryAxis
    tickFormat={(x) => x.length > 8 ? `${x.substring(0, 8)}...` : x} // Truncate long app names
    style={{
      tickLabels: { angle: -45, textAnchor: 'end', fontSize: 10 } // Rotate labels by 45 degrees
    }}
  />
</VictoryChart>

</View>
    {/* Bar Graph Legend */}
    <View style={styles.labelsContainer}>
  {barChartData.map((data, index) => (
    <View key={index} style={styles.labelItem}>
      <View style={[styles.colorIndicator, { backgroundColor: getColorForIndex(index) }]} />
      {/* Wrap both data.x and data.formattedTime within Text component */}
      <Text style={styles.appLabel}>
        {data.x}: {data.formattedTime}
      </Text>
    </View>
  ))}
</View>
    <View style={styles.separator} />
    {/* Health Recommendations */}
    <Text style={styles.sectionHeader}>Health Recommendations</Text>
    {suggestions.length > 0 ? (
      suggestions.map((suggestion, index) => (
        <View key={index} style={styles.suggestionItem}>
          <Icon
            name={
              suggestion.includes('social')
                ? 'chatbubbles-outline'
                : suggestion.includes('gaming')
                ? 'game-controller-outline'
                : suggestion.includes('productivity')
                ? 'briefcase-outline'
                : 'alert-circle-outline'
            }
            size={24}
            color="#007AFF"
            style={styles.suggestionIcon}
          />
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </View>
      ))
    ) : (
      <View style={styles.suggestionItem}>
        <Icon name="checkmark-circle-outline" size={24} color="#28A745" style={styles.suggestionIcon} />
        <Text style={styles.suggestionText}>No suggestions at this time. Keep using your apps responsibly!</Text>
      </View>
    )}
  </View>
  
  <View style={styles.separator} />
      {/* Device Usage Section */}
      <View style={styles.usageContainer}>
        <Text style={styles.sectionHeader}>Device Information</Text>
        <View style={styles.usageDetails}>
          <View style={styles.usageItem}>
            <Icon name="battery-half-outline" size={24} color="#333" />
            <Text style={styles.usageLabel}>Battery Level:</Text>
            <Text style={styles.usageValue}>{batteryLevel}</Text>
          </View>
          <View style={styles.usageItem}>
            <Icon name="calendar-outline" size={24} color="#333" />
            <Text style={styles.usageLabel}>Device Boot Time:</Text>
            <Text style={styles.usageValue}>{bootTime}</Text>
          </View>
        </View>
      </View>
      <View style={styles.separator} />     
      {/* Applications Section */}
      <View style={styles.applicationsContainer}>
  <Text style={styles.sectionHeader}>Applications</Text>
  <View style={styles.applicationsContainer}>
  <Text style={styles.sectionHeader}>Applications with Usage Data</Text>
  {/* Search and Sort for Usage Apps */}
  {permissionGranted ? (
    usageApps.length > 0 ? (
      // Filter to show only apps with usage greater than 0
      usageApps
        .filter((app) => parseFloat(app.timeInForeground.split(' ')[0]) > 0)
        .map((app, index) => (
          <View key={app.packageName || index} style={styles.usageItem}>
            {/* Display App Icon */}
            <Image 
              source={{ uri: `data:image/png;base64,${app.appIcon}` }} 
              style={styles.appIcon} 
            />

            <View style={styles.appInfo}>
              {/* Display App Name */}
              <Text style={styles.usageLabel}>{app.appName}</Text>

              {/* Display Actual Usage Time */}
              <Text style={styles.usageValue}>
                Usage: {formatTime(parseFloat(app.timeInForeground.split(' ')[0]))}
              </Text>

              {/* Installed Date */}
              <Text style={styles.usageValue}>
                Installed: {app.installedDate || 'Unknown'}
              </Text>

              {/* App Category */}
              <Text style={styles.usageValue}>
                Category: {app.appCategory || 'Unknown'}
              </Text>
            </View>
          </View>
        ))
    ) : (
      <Text>No apps with usage data available</Text>
    )
  ) : (
    <Text>Permission not granted to view app usage data.</Text>
  )}
</View>
  <View style={styles.separator} />
         {/* Applications Section */}
         <View style={styles.applicationsContainer}>
        <Text style={styles.sectionHeader}>All Installed Applications</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search installed apps..."
          value={searchQueryInstalled}
          onChangeText={handleSearchInstalled}
        />

        {filteredInstalledApps.length > 0 ? (
          filteredInstalledApps.map((app, index) => renderAppItem(app, index))
        ) : (
          <Text>No installed apps available</Text>
        )}
      </View>
      <View style={styles.applicationsContainer}>
      <Text style={styles.sectionHeader}>Schedules</Text>
      </View>
</View>

    </View>
  </ScrollView>
  
  );
};

const getColorForIndex = (index) => {
  const colors = [
    '#ff6347', '#ffa500', '#ffd700', '#00ced1', '#1e90ff', '#9370db', '#3cb371', 
    '#ff4500', '#ff1493', '#ff69b4', '#dc143c', '#00fa9a', '#48d1cc', '#8a2be2', 
    '#ffdead', '#32cd32', '#8b0000', '#6495ed', '#e9967a', '#4b0082', '#d2691e',
  ];
  return colors[index % colors.length];  // Ensures each index gets a unique color
};

const styles = StyleSheet.create({
  ...externalStyles,
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  sortLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  
  picker: {
    flex: 1,
    height: 40,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginVertical: 10,
  },
  separator: {
    borderBottomColor: '#ccc',  // Color of the line
    borderBottomWidth: 1,       // Thickness of the line
    marginVertical: 10,         // Space above and below the line
  },
  chartWrapper: {
    bottom: 50,
  },

  applicationList: {
    marginTop: 20,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  applicationsContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
   
  },

  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },

  pickerIcon: {
    marginRight: 10,
  },
  pickerInline: {
    width: 100,
    height: 40,
    color: '#333',
  },

  pickerIconInline: {
    marginRight: 8,
  },
  pickerInlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align text and picker
    marginBottom: 10,
  },
   /* Picker Container to hold icons and labels */

  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10, // Space between label and picker
  },
 
  appIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  appInfo: {
    flex: 1,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  usageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usageValue: {
    fontSize: 14,
    color: '#555',
  },

  chartContainer: {
    marginTop: 10,
    borderRadius: 8,
    borderColor: '#ddd',
  },

  labelsContainer: {
    marginTop: -60,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,  // Adjust horizontal spacing between labels
    marginVertical: 10,    // Add vertical space for multi-line wrap
  },
  colorIndicator: {
    width: 15,
    height: 15,
    marginRight: 8,                 // Space between color box and label text
  },
  appLabel: {
    fontSize: 14,
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',           // Align icon and text horizontally
    alignItems: 'center',           // Vertically center the icon and text
    padding: 10,
    backgroundColor: '#f0f4f7',     // Light background for readability
    borderRadius: 8,                // Rounded corners for aesthetic appeal
    marginVertical: 5,              // Space between each suggestion item
    borderColor: '#ddd',
    borderWidth: 1,
  },
  suggestionIcon: {
    marginRight: 10,                // Space between icon and text
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,                        // Allow text to occupy remaining space
  },
});

export default HomeDashboard;
