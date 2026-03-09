import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const CONTACT_BUTTONS = [
  { label: 'Call Us',    icon: 'call',   action: 'call',  bg: '#7c3aed' },
  { label: 'Email',      icon: 'mail',   action: 'email', bg: '#7c3aed' },
  { label: 'Live Chat',  icon: 'chat',   action: 'chat',  bg: '#7c3aed' },
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
    a: 'We currently accept select insurance plans. Please email us at support@rxhub.com with your insurance details for verification.',
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
  const [activeTab, setActiveTab] = useState('FAQs');
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: TICKET_CATEGORIES[0], message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const handleContact = (action) => {
    if (action === 'call')  Linking.openURL('tel:18001234567');
    if (action === 'email') Linking.openURL('mailto:support@rxhub.com');
    if (action === 'chat')  Alert.alert('Live Chat', 'Live chat will be available soon!');
  };

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      Toast.show({ type: 'error', text1: 'Please fill in subject and message' }); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    Toast.show({ type: 'success', text1: 'Ticket submitted!', text2: "We'll get back to you within 24 hours." });
    setTicketForm({ subject: '', category: TICKET_CATEGORIES[0], message: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#23170f" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Help & Support</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialIcons name="notifications" size={22} color="#fff" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Contact Cards ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactRow}>
            {CONTACT_BUTTONS.map(c => (
              <TouchableOpacity key={c.label} style={styles.contactCard} onPress={() => handleContact(c.action)}>
                <View style={[styles.contactIcon, { backgroundColor: c.bg }]}>
                  <MaterialIcons name={c.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.contactLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Response time banner */}
          <View style={styles.responseBanner}>
            <MaterialIcons name="schedule" size={20} color="#93c5fd" />
            <View>
              <Text style={styles.responseBannerLabel}>Current Response Time</Text>
              <Text style={styles.responseBannerValue}>Less than 5 minutes</Text>
            </View>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabsBar}>
          {['FAQs', 'Submit Ticket'].map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── FAQs ── */}
        {activeTab === 'FAQs' && (
          <View style={styles.section}>
            {/* Search bar */}
            <View style={styles.faqSearchWrap}>
              <MaterialIcons name="search" size={18} color="#cca88e" />
              <TextInput style={styles.faqSearchInput} placeholder="Search for help..." placeholderTextColor="#6b7280" />
            </View>

            <Text style={styles.subsectionLabel}>Common Questions</Text>

            {FAQS.map((faq, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.faqCard, openFaqIdx === idx && styles.faqCardOpen]}
                onPress={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <MaterialIcons
                    name={openFaqIdx === idx ? 'expand-less' : 'chevron-right'}
                    size={20}
                    color={openFaqIdx === idx ? '#f97415' : '#cca88e'}
                  />
                </View>
                {openFaqIdx === idx && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Ticket Form ── */}
        {activeTab === 'Submit Ticket' && (
          <View style={styles.section}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief summary of your issue"
                placeholderTextColor="#6b7280"
                value={ticketForm.subject}
                onChangeText={v => setTicketForm(f => ({ ...f, subject: v }))}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity style={styles.input} onPress={() => setCategoryPickerOpen(o => !o)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 15 }}>{ticketForm.category}</Text>
                  <MaterialIcons name="expand-more" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
              {categoryPickerOpen && (
                <View style={styles.picker}>
                  {TICKET_CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={styles.pickerItem} onPress={() => { setTicketForm(f => ({ ...f, category: c })); setCategoryPickerOpen(false); }}>
                      <Text style={[styles.pickerItemText, ticketForm.category === c && { color: '#f97415' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Please describe your issue in detail..."
                placeholderTextColor="#6b7280"
                value={ticketForm.message}
                onChangeText={v => setTicketForm(f => ({ ...f, message: v }))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={submitTicket} disabled={submitting}>
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={styles.submitBtnText}>Submit Ticket</Text>
                    <MaterialIcons name="send" size={16} color="#fff" />
                  </>}
            </TouchableOpacity>
            <Text style={styles.responseNote}>We typically respond within 24 hours.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23170f' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#4a3221' },
  headerBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  pageTitle: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f97415', borderWidth: 1, borderColor: '#23170f' },

  // Sections
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 20, marginBottom: 14 },

  // Contact
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  contactCard: { flex: 1, backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10 },
  contactIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
  responseBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e3a5f40', borderWidth: 1, borderColor: '#3b82f620', borderRadius: 12, padding: 14, marginBottom: 20 },
  responseBannerLabel: { color: '#bfdbfe', fontSize: 11, marginBottom: 2 },
  responseBannerValue: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Tabs
  tabsBar: { flexDirection: 'row', backgroundColor: '#23170f', borderBottomWidth: 1, borderBottomColor: '#4a3221', paddingHorizontal: 20 },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#f97415' },
  tabBtnText: { color: '#cca88e', fontWeight: '600', fontSize: 14 },
  tabBtnTextActive: { color: '#fff', fontWeight: '800' },

  // FAQ
  faqSearchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  faqSearchInput: { flex: 1, color: '#fff', fontSize: 13 },
  subsectionLabel: { color: '#cca88e', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  faqCard: { backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  faqCardOpen: { borderColor: '#f9741540' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  faqQuestion: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14, marginRight: 8 },
  faqAnswer: { borderTopWidth: 1, borderTopColor: '#4a322150', padding: 16, paddingTop: 12 },
  faqAnswerText: { color: '#cca88e', fontSize: 13, lineHeight: 20 },

  // Ticket form
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: '#cca88e', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 12, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { height: 120, textAlignVertical: 'top' },
  picker: { backgroundColor: '#2c1d14', borderWidth: 1, borderColor: '#4a3221', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#4a322150' },
  pickerItemText: { color: '#e5e5e5', fontSize: 14 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f97415', paddingVertical: 15, borderRadius: 14, marginTop: 4, elevation: 5, shadowColor: '#f97415', shadowOpacity: 0.3, shadowRadius: 8 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  responseNote: { color: '#cca88e', fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 20 },
});
