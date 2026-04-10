// src/screens/consumer/PagoQRScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/axios.config';

const QR_IMAGE = require('../../assets/qr_bcp.jpeg');

const TITULAR = 'Luis Gustavo Daza Jimenez';
const CUENTA = '201-51679466-3-61';
const BANCO = 'BCP Bolivia';

const PagoQRScreen = ({ route, navigation }) => {
  const { total, pedidoData, paradaSeleccionada } = route.params;
  const { colors } = useTheme();
  const [procesando, setProcesando] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);

  const handleConfirmarPago = async () => {
    Alert.alert(
      '¿Ya realizaste el pago?',
      `Confirma que transferiste Bs ${parseFloat(total).toFixed(2)} a la cuenta de ${TITULAR}`,
      [
        { text: 'Aún no', style: 'cancel' },
        {
          text: 'Sí, ya pagué',
          onPress: async () => {
            setProcesando(true);
            try {
              // ✅ Enviar con los IDs correctos de la BD
              await api.post('/pedidos', {
                ...pedidoData,
                metodo_pago_id: 7, // QR en la BD
                notas: `Pago QR BCP - ${CUENTA}. ${pedidoData.notas || ''}`,
              });
              setPagoConfirmado(true);
            } catch (error) {
              console.error('Error pedido:', error?.response?.data || error.message);
              Alert.alert('Error', 'No se pudo confirmar el pedido. Intenta de nuevo.');
            } finally {
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  if (pagoConfirmado) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
          <Text style={[styles.successTitle, { color: colors.text }]}>¡Pedido confirmado!</Text>
          <Text style={[styles.successSub, { color: colors.textSecondary }]}>
            Tu pedido ha sido registrado. El productor lo confirmará pronto.
          </Text>
          {paradaSeleccionada && (
            <View style={[styles.paradaInfo, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bus" size={20} color="#3B82F6" />
              <Text style={[styles.paradaInfoText, { color: '#3B82F6' }]}>
                Entrega en: {paradaSeleccionada.nombre}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.verPedidoBtn} onPress={() => navigation.navigate('MisPedidos')}>
            <Text style={styles.verPedidoBtnText}>Ver mis pedidos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pago con QR</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={[styles.montoCard, { backgroundColor: '#3B82F6' }]}>
          <Text style={styles.montoLabel}>Monto a pagar</Text>
          <Text style={styles.montoValue}>Bs {parseFloat(total).toFixed(2)}</Text>
          <Text style={styles.montoHint}>Transfiere exactamente este monto</Text>
        </View>

        <View style={[styles.qrCard, { backgroundColor: colors.card }]}>
          <View style={styles.bancoHeader}>
            <Ionicons name="card-outline" size={24} color="#3B82F6" />
            <Text style={[styles.bancoNombre, { color: colors.text }]}>{BANCO}</Text>
          </View>
          <Image source={QR_IMAGE} style={styles.qrImage} resizeMode="contain" />
          <View style={[styles.cuentaInfo, { backgroundColor: colors.surface }]}>
            <View style={styles.cuentaRow}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.cuentaLabel, { color: colors.textSecondary }]}>Titular:</Text>
              <Text style={[styles.cuentaValue, { color: colors.text }]}>{TITULAR}</Text>
            </View>
            <View style={styles.cuentaRow}>
              <Ionicons name="document-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.cuentaLabel, { color: colors.textSecondary }]}>Cuenta:</Text>
              <Text style={[styles.cuentaValue, { color: colors.text }]}>{CUENTA}</Text>
            </View>
          </View>
        </View>

        {paradaSeleccionada && (
          <View style={[styles.paradaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="bus" size={20} color="#3B82F6" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Entrega en parada:</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{paradaSeleccionada.nombre}</Text>
            </View>
          </View>
        )}

        <View style={[styles.instruccionesCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.instruccionesTitle, { color: colors.text }]}>¿Cómo pagar?</Text>
          {[
            { num: '1', text: 'Abre tu app bancaria o billetera digital' },
            { num: '2', text: `Escanea el código QR del ${BANCO}` },
            { num: '3', text: `Ingresa el monto: Bs ${parseFloat(total).toFixed(2)}` },
            { num: '4', text: 'Confirma la transferencia' },
            { num: '5', text: 'Vuelve aquí y presiona "Ya pagué"' },
          ].map((paso) => (
            <View key={paso.num} style={styles.paso}>
              <View style={[styles.pasoNum, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.pasoNumText, { color: '#3B82F6' }]}>{paso.num}</Text>
              </View>
              <Text style={[styles.pasoText, { color: colors.text }]}>{paso.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.confirmarBtn, procesando && { opacity: 0.7 }]}
          onPress={handleConfirmarPago}
          disabled={procesando}
        >
          {procesando
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                <Text style={styles.confirmarBtnText}>Ya realicé el pago</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { padding: 16, gap: 14 },
  montoCard: { borderRadius: 16, padding: 24, alignItems: 'center' },
  montoLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  montoValue: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  montoHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  qrCard: { borderRadius: 16, padding: 20, alignItems: 'center', gap: 16 },
  bancoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bancoNombre: { fontSize: 18, fontWeight: '700' },
  qrImage: { width: 220, height: 220, borderRadius: 12 },
  cuentaInfo: { width: '100%', borderRadius: 10, padding: 12, gap: 8 },
  cuentaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cuentaLabel: { fontSize: 13 },
  cuentaValue: { fontSize: 13, fontWeight: '600', flex: 1 },
  paradaCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  instruccionesCard: { borderRadius: 16, padding: 16, gap: 12 },
  instruccionesTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  paso: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pasoNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pasoNumText: { fontSize: 13, fontWeight: '700' },
  pasoText: { fontSize: 14, flex: 1 },
  footer: { padding: 16, borderTopWidth: 1 },
  confirmarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22C55E', paddingVertical: 16, borderRadius: 14, gap: 8 },
  confirmarBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  successContainer: { alignItems: 'center', padding: 32, gap: 16 },
  successTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  successSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  paradaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10 },
  paradaInfoText: { fontSize: 14, fontWeight: '500' },
  verPedidoBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  verPedidoBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default PagoQRScreen;