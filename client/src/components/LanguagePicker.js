/**
 * LanguagePicker Component
 * ========================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Dropdown-style language selector with flags
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Pressable
} from 'react-native';
import { COLORS, LANGUAGES } from '../constants/config';

const LanguagePicker = ({ 
  label, 
  selectedLanguage, 
  onSelectLanguage,
  languages = LANGUAGES 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedLang = languages.find(l => l.code === selectedLanguage) || languages[0];
  
  const handleSelect = (language) => {
    onSelectLanguage(language.code);
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{selectedLang.flag}</Text>
        <Text style={styles.languageName}>{selectedLang.name}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    item.code === selectedLanguage && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionFlag}>{item.flag}</Text>
                  <Text style={[
                    styles.optionName,
                    item.code === selectedLanguage && styles.selectedText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.optionCode}>({item.code.toUpperCase()})</Text>
                  {item.code === selectedLanguage && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  languageName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  arrow: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#EBF5FF',
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionCode: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 8,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LanguagePicker;
