import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome back, John</Text>
        <Text style={styles.subtitle}>Here is your health overview</Text>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.actionIconText}>BP</Text>
            </View>
            <Text style={styles.actionText}>Log BP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.actionIconText}>G</Text>
            </View>
            <Text style={styles.actionText}>Glucose</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.actionIconText}>W</Text>
            </View>
            <Text style={styles.actionText}>Weight</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Blood Pressure</Text>
            <Text style={styles.statValue}>120/80</Text>
            <Text style={styles.statUnit}>mmHg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Blood Glucose</Text>
            <Text style={styles.statValue}>98</Text>
            <Text style={styles.statUnit}>mg/dL</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>72.5</Text>
            <Text style={styles.statUnit}>kg</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontWeight: '600',
    fontSize: 14,
  },
  actionText: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '500',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statUnit: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
