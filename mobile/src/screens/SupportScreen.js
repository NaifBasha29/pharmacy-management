import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supportAPI } from '../services/mobileApi';

const CONTACT_BUTTONS = [
  { label: 'Call Us',    icon: 'phone',         action: 'call',  color: '#f97316' },
  { label: 'Email',     icon: 'email-outline',  action: 'email', color: '#3b82f6' },
  { label: 'Live Chat', icon: 'chat-outline',   action: 'chat',  color: '#8b5cf6' },
];

const FAQS = [
  {
    q: 'How do I track my order?',
    a: "Go to the 'Orders' tab in the bottom navigation. Select your active order to view real-time shipping updates.",
  },
  {
    q: 'Can I change my delivery address?',
    a: 'Order addresses can be changed before the order is dispatched. Contact support immediately if you need a change.',
  },
  {
    q: 'How to refill a prescription?',
    a: "Go to the Prescriptions tab, upload your renewed prescription image, and our pharmacists will process it within 24 hours.",
  },
  {
    q: 'Insurance and copay questions',
    a: 'We currently accept select insurance plans. Please email us at support@RxPlus.com with your insurance details for verification.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, credit/debit cards, net banking, and cash on delivery for eligible orders.',
  },
  {
    q: 'Is my health information secure?',
    a: 'Absolutely. All health data is encrypted, HIPAA-compliant, and never shared with third parties without your consent.',
  },
];

const TICKET_CATEGORIES = ['Order Issue', 'Prescription Refill', 'Billing Question', 'Technical Support', 'General Inquiry'];

export default function SupportScreen({ navigation }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('FAQs');
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: TICKET_CATEGORIES[0], message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const handleContact = (action) => {
    if (action === 'call')  Linking.openURL('tel:18001234567');
    if (action === 'email') Linking.openURL('mailto:support@RxPlus.com');
    if (action === 'chat')  Alert.alert('Live Chat', 'Live chat will be available soon!');
  };

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      Alert.alert('Error', 'Please fill in subject and message'); return;
    }
    setSubmitting(true);
    try {
      await supportAPI.create({
        subject: ticketForm.subject,
        category: ticketForm.category,
        message: ticketForm.message,
      });
      Alert.alert('✅ Success', "Ticket submitted! We'll get back to you within 24 hours.");
      setTicketForm({ subject: '', category: TICKET_CATEGORIES[0], message: '' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Contact Cards */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Contact Us</Text>
          <View style={s.contactRow}>
            {CONTACT_BUTTONS.map(c => (
              <TouchableOpacity
                key={c.label}
                style={[s.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handleContact(c.action)}
              >
                <View style={[s.contactIcon, { backgroundColor: c.color + '20' }]}>
                  <Icon name={c.icon} size={24} color={c.color} />
                </View>
                <Text style={[s.contactLabel, { color: theme.textPrimary }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Response time */}
          <View style={[s.responseBanner, { backgroundColor: theme.infoMuted, borderColor: theme.info + '30' }]}>
            <Icon name="clock-outline" size={20} color={theme.info} />
            <View>
              <Text style={[s.responseLabel, { color: theme.textSecondary }]}>Current Response Time</Text>
              <Text style={[s.responseValue, { color: theme.textPrimary }]}>Less than 5 minutes</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[s.tabsBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {['FAQs', 'Submit Ticket'].map(t => {
            const active = activeTab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, active && { borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[s.tabBtnText, { color: active ? theme.primary : theme.textSecondary }, active && { fontWeight: '800' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FAQs */}
        {activeTab === 'FAQs' && (
          <View style={s.section}>
            <Text style={[s.subsectionLabel, { color: theme.textSecondary }]}>Common Questions</Text>
            {FAQS.map((faq, idx) => (
              <TouchableOpacity
                key={idx}
                style={[s.faqCard, { backgroundColor: theme.card, borderColor: openFaqIdx === idx ? theme.primary + '40' : theme.border }]}
                onPress={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                activeOpacity={0.8}
              >
                <View style={s.faqHeader}>
                  <Text style={[s.faqQuestion, { color: theme.textPrimary }]}>{faq.q}</Text>
                  <Icon
                    name={openFaqIdx === idx ? 'chevron-up' : 'chevron-right'}
                    size={20}
                    color={openFaqIdx === idx ? theme.primary : theme.textSecondary}
                  />
                </View>
                {openFaqIdx === idx && (
                  <View style={[s.faqAnswer, { borderTopColor: theme.border }]}>
                    <Text style={[s.faqAnswerText, { color: theme.textSecondary }]}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Ticket Form */}
        {activeTab === 'Submit Ticket' && (
          <View style={s.section}>
            <View style={s.fieldWrap}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Subject</Text>
              <TextInput
                style={[s.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Brief summary of your issue"
                placeholderTextColor={theme.placeholder}
                value={ticketForm.subject}
                onChangeText={v => setTicketForm(f => ({ ...f, subject: v }))}
              />
            </View>

            <View style={s.fieldWrap}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Category</Text>
              <TouchableOpacity
                style={[s.input, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setCategoryPickerOpen(o => !o)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{ticketForm.category}</Text>
                  <Icon name="chevron-down" size={20} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>
              {categoryPickerOpen && (
                <View style={[s.picker, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {TICKET_CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[s.pickerItem, { borderBottomColor: theme.border }]}
                      onPress={() => { setTicketForm(f => ({ ...f, category: c })); setCategoryPickerOpen(false); }}
                    >
                      <Text style={[s.pickerItemText, { color: ticketForm.category === c ? theme.primary : theme.textPrimary }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={s.fieldWrap}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Message</Text>
              <TextInput
                style={[s.input, s.textarea, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Please describe your issue in detail..."
                placeholderTextColor={theme.placeholder}
                value={ticketForm.message}
                onChangeText={v => setTicketForm(f => ({ ...f, message: v }))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]}
              onPress={submitTicket}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={s.submitBtnText}>Submit Ticket</Text>
                  <Icon name="send" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
            <Text style={[s.responseNote, { color: theme.textSecondary }]}>We typically respond within 24 hours.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontWeight: '800', fontSize: 20, marginBottom: 14 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  contactCard: {
    flex: 1, borderWidth: 1, borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 10,
  },
  contactIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { fontWeight: '700', fontSize: 13 },
  responseBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  responseLabel: { fontSize: 11, marginBottom: 2 },
  responseValue: { fontWeight: '800', fontSize: 14 },
  tabsBar: {
    flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 20,
  },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabBtnText: { fontWeight: '600', fontSize: 14 },
  subsectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  faqCard: { borderWidth: 1, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  faqQuestion: { flex: 1, fontWeight: '600', fontSize: 14, marginRight: 8 },
  faqAnswer: { borderTopWidth: 1, padding: 16, paddingTop: 12 },
  faqAnswerText: { fontSize: 13, lineHeight: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { height: 120, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerItemText: { fontSize: 14 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 14, marginTop: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  responseNote: { fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 20 },
});
