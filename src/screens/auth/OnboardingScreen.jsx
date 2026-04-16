// src/screens/auth/OnboardingScreen.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ScrollView, Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    icon:       'fish',
    iconColor:  '#22d3ee',
    gradient:   ['#0c4a6e', '#0e7490'],
    title:      'Pescado fresco\ndel Chapare',
    subtitle:   'Compra directamente a los productores de la regiÃ³n piscÃ­cola del Chapare, Cochabamba.',
    accent:     '#22d3ee',
  },
  {
    icon:       'pulse',
    iconColor:  '#34d399',
    gradient:   ['#064e3b', '#065f46'],
    title:      'Monitoreo IoT\nen tiempo real',
    subtitle:   'Sensores ESP32 monitoran temperatura, pH y turbidez del agua las 24 horas del dÃ­a.',
    accent:     '#34d399',
  },
  {
    icon:       'qr-code',
    iconColor:  '#a78bfa',
    gradient:   ['#2e1065', '#4c1d95'],
    title:      'Trazabilidad\nverificada',
    subtitle:   'Escanea el QR de cualquier producto y conoce toda su historia, desde la laguna hasta tu mesa.',
    accent:     '#a78bfa',
  },
  {
    icon:       'bicycle',
    iconColor:  '#fb923c',
    gradient:   ['#431407', '#7c2d12'],
    title:      'Seguimiento\nen vivo',
    subtitle:   'Rastrea tu pedido en tiempo real con mapa GPS y recibe notificaciones en cada etapa.',
    accent:     '#fb923c',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const handleNext = async () => {
    if (current < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      const next = current + 1;
      setCurrent(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      await finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    navigation.replace('Login');
  };

  const slide = SLIDES[current];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={slide.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          {/* Skip */}
          <TouchableOpacity style={styles.skipBtn} onPress={finish}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>

          {/* Contenido animado */}
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Ãcono grande */}
            <View style={[styles.iconWrapper, { borderColor: slide.accent + '40', backgroundColor: slide.accent + '15' }]}>
              <View style={[styles.iconInner, { backgroundColor: slide.accent + '25' }]}>
                <Ionicons name={slide.icon} size={72} color={slide.accent} />
              </View>
              {/* Anillos decorativos */}
              <View style={[styles.ring1, { borderColor: slide.accent + '20' }]} />
              <View style={[styles.ring2, { borderColor: slide.accent + '10' }]} />
            </View>

            {/* Texto */}
            <Text style={[styles.title, { color: '#fff' }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.75)' }]}>{slide.subtitle}</Text>
          </Animated.View>

          {/* Indicadores */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                { backgroundColor: i === current ? slide.accent : 'rgba(255,255,255,0.3)',
                  width: i === current ? 24 : 8 }
              ]} />
            ))}
          </View>

          {/* BotÃ³n */}
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextText, { color: slide.gradient[1] }]}>
              {current === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
            </Text>
            <Ionicons name={current === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20} color={slide.gradient[1]} />
          </TouchableOpacity>

          {/* Ya tengo cuenta */}
          {current === SLIDES.length - 1 && (
            <TouchableOpacity onPress={finish} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Ya tengo una cuenta</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1 },
  gradient:      { flex: 1 },
  safe:          { flex: 1, alignItems: 'center', paddingHorizontal: 28 },
  skipBtn:       { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 4, marginTop: 4 },
  skipText:      { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  content:       { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  iconWrapper:   { width: 180, height: 180, borderRadius: 90, borderWidth: 1.5,
                   justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  iconInner:     { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  ring1:         { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 1 },
  ring2:         { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1 },
  title:         { fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 40, marginBottom: 16 },
  subtitle:      { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  dots:          { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot:           { height: 8, borderRadius: 4 },
  nextBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                   gap: 8, width: '100%', paddingVertical: 16, borderRadius: 16, marginBottom: 12 },
  nextText:      { fontSize: 17, fontWeight: '700' },
  loginLink:     { paddingVertical: 8, marginBottom: 8 },
  loginLinkText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecorationLine: 'underline' },
});

export default OnboardingScreen;
